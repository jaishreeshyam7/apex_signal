import type { Invoice, Party, Item, CompanyDetails } from '../types/billing';

interface ProcessQueryOptions {
  query: string;
  invoices: Invoice[];
  parties: Party[];
  items: Item[];
  companyDetails: CompanyDetails;
  apiKey?: string;
  apiProvider?: 'gemini' | 'openai';
}

export interface AIResponse {
  answer: string;
  matchedInvoices: Invoice[];
  language: 'hi' | 'en';
}

export async function processInvoiceQuery(options: ProcessQueryOptions): Promise<AIResponse> {
  const { query, invoices, parties, items, companyDetails, apiKey, apiProvider } = options;
  const q = query.trim().toLowerCase();

  // Detect language (Hindi / Hinglish vs English)
  const hindiKeywords = [
    'kya', 'hai', 'batao', 'kitna', 'kitne', 'kaun', 'kis', 'gaadi', 'ka', 'ke', 'ki',
    'bhejo', 'dikhao', 'kul', 'bhi', 'hua', 'tha', 'thi', 'the', 'se', 'me', 'mein', 'par',
    'rupaye', 'paisa', 'paisa', 'maal', 'gadi', 'khata', 'hisab', 'hisab-kitab'
  ];
  const isHindi = hindiKeywords.some((w) => q.split(' ').includes(w)) || /[\u0900-\u097F]/.test(query);

  // If user provided an external API key (Gemini / OpenAI), call the LLM API with full RAG context!
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const llmResult = await callExternalLLM({
        query,
        invoices,
        parties,
        items,
        companyDetails,
        apiKey: apiKey.trim(),
        provider: apiProvider || 'gemini',
        isHindi,
      });
      if (llmResult) return llmResult;
    } catch (err) {
      console.warn('External LLM call failed, falling back to local smart engine:', err);
    }
  }

  // --- Local Built-in Zero-Latency Intelligent RAG Engine ---

  // 1. Search for specific Invoice Number (e.g., "339", "bill #340", "inv-12")
  const invoiceNumMatch = q.match(/(?:bill|invoice|inv|no|number|#)?\s*#?\s*(\d{1,6})/i);
  if (invoiceNumMatch && invoiceNumMatch[1]) {
    const targetNo = invoiceNumMatch[1];
    const found = invoices.find((inv) => inv.invoiceNo === targetNo || inv.invoiceNo.includes(targetNo));
    if (found) {
      const itemsList = found.items
        .map((it) => `${it.description} (${it.quantity} ${it.unit} @ ₹${it.rate})`)
        .join(', ');

      if (isHindi) {
        return {
          answer: `📄 **बिल #${found.invoiceNo} का विवरण:**\n\n- **पार्टी / ग्राहक:** ${found.buyer?.name || 'Cash Sale'}\n- **तारीख:** ${found.date}\n- **कुल राशि (Grand Total):** ₹${found.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n- **सामान (Items):** ${itemsList}\n- **टैक्स (GST):** ₹${found.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${found.isInterState ? 'IGST 18%' : 'CGST 9% + SGST 9%'})\n- **गाड़ी नंबर (Vehicle No):** ${found.motorVehicleNo || 'Not specified'}\n- **स्टेटस:** ${found.status}`,
          matchedInvoices: [found],
          language: 'hi',
        };
      } else {
        return {
          answer: `📄 **Invoice #${found.invoiceNo} Details:**\n\n- **Buyer / Party:** ${found.buyer?.name || 'Cash Sale'}\n- **Date:** ${found.date}\n- **Grand Total:** ₹${found.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n- **Items:** ${itemsList}\n- **Total Tax:** ₹${found.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${found.isInterState ? 'IGST 18%' : 'CGST 9% + SGST 9%'})\n- **Vehicle No:** ${found.motorVehicleNo || 'Not specified'}\n- **Status:** ${found.status}`,
          matchedInvoices: [found],
          language: 'en',
        };
      }
    }
  }

  // 2. Search for Party / Customer specific queries
  const matchedParties = parties.filter((p) => q.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(q));
  let matchedParty = matchedParties[0];

  // Also check party names in invoices
  if (!matchedParty) {
    const invWithParty = invoices.find((inv) => inv.buyer?.name && q.includes(inv.buyer.name.toLowerCase()));
    if (invWithParty) matchedParty = invWithParty.buyer;
  }

  if (matchedParty) {
    const partyInvoices = invoices.filter((inv) => inv.buyer?.name?.toLowerCase() === matchedParty.name.toLowerCase());
    const totalPartySales = partyInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

    if (isHindi) {
      return {
        answer: `🏢 **${matchedParty.name} के बिल रिकॉर्ड:**\n\n- **कुल बिल (Total Invoices):** ${partyInvoices.length}\n- **कुल बिक्री (Total Business):** ₹${totalPartySales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n- **GSTIN:** ${matchedParty.gstin || 'N/A'}\n- **स्थान (State/City):** ${matchedParty.city}, ${matchedParty.state}\n\nनीचे इस पार्टी के सभी बिल सूचीबद्ध हैं:`,
        matchedInvoices: partyInvoices,
        language: 'hi',
      };
    } else {
      return {
        answer: `🏢 **Account Details for ${matchedParty.name}:**\n\n- **Total Invoices:** ${partyInvoices.length}\n- **Total Business Value:** ₹${totalPartySales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n- **GSTIN:** ${matchedParty.gstin || 'N/A'}\n- **Location:** ${matchedParty.city}, ${matchedParty.state}\n\nMatching invoices are shown below:`,
        matchedInvoices: partyInvoices,
        language: 'en',
      };
    }
  }

  // 3. Search for Vehicle / Gaadi queries
  const vehicleMatch = q.match(/([a-z]{2}\d{1,2}[a-z]{1,3}\d{1,4})/i);
  if (vehicleMatch || q.includes('vehicle') || q.includes('gaadi') || q.includes('gadi') || q.includes('motor')) {
    let vehicleInvoices = invoices;
    if (vehicleMatch) {
      const vNo = vehicleMatch[1].toUpperCase();
      vehicleInvoices = invoices.filter((inv) => inv.motorVehicleNo?.replace(/\s+/g, '').includes(vNo.replace(/\s+/g, '')));
    }

    if (vehicleInvoices.length > 0) {
      const vDetails = vehicleInvoices
        .map((inv) => `• Bill #${inv.invoiceNo} (${inv.date}) - ${inv.buyer?.name} (Vehicle: ${inv.motorVehicleNo}) - ₹${inv.grandTotal.toLocaleString('en-IN')}`)
        .join('\n');

      if (isHindi) {
        return {
          answer: `🚚 **गाड़ी / ट्रांसपोर्ट से जुड़े बिल (${vehicleInvoices.length}):**\n\n${vDetails}`,
          matchedInvoices: vehicleInvoices,
          language: 'hi',
        };
      } else {
        return {
          answer: `🚚 **Transport & Vehicle Invoices (${vehicleInvoices.length}):**\n\n${vDetails}`,
          matchedInvoices: vehicleInvoices,
          language: 'en',
        };
      }
    }
  }

  // 4. Overall Sales & Stats Summary (e.g., "Total sale", "Kitna sale hua", "GST summary")
  if (
    q.includes('sale') || q.includes('total') || q.includes('bikri') || q.includes('revenue') ||
    q.includes('turnover') || q.includes('gst') || q.includes('tax') || q.includes('summary') ||
    q.includes('hisab') || q.includes('khata') || invoices.length === 0
  ) {
    const totalSales = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const totalTax = invoices.reduce((sum, inv) => sum + (inv.totalTax || 0), 0);
    const totalTaxable = invoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);

    if (isHindi) {
      return {
        answer: `📊 **Yash Polymers का संक्षिप्त बही-खाता सारांश:**\n\n- **कुल बिल (Total Invoices):** ${invoices.length}\n- **कुल बिक्री (Gross Sales):** ₹${totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n- **टैक्सेबल अमाउंट:** ₹${totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n- **कुल एकत्रित GST (Total Tax):** ₹${totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n- **पार्टीज की संख्या:** ${parties.length}\n- **आइटम्स की संख्या:** ${items.length}\n\nआप किसी भी खास बिल नंबर (जैसे *'Bill 339'*) या पार्टी के नाम से भी पूछ सकते हैं!`,
        matchedInvoices: invoices.slice(0, 5),
        language: 'hi',
      };
    } else {
      return {
        answer: `📊 **Yash Polymers Business & Billing Summary:**\n\n- **Total Invoices Generated:** ${invoices.length}\n- **Total Gross Sales:** ₹${totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n- **Total Taxable Amount:** ₹${totalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n- **Total GST Collected:** ₹${totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n- **Registered Parties:** ${parties.length}\n- **Product Catalog Items:** ${items.length}\n\nYou can ask specific questions like *"Show details for bill 339"* or *"How many bills for Verma Polymers?"*`,
        matchedInvoices: invoices.slice(0, 5),
        language: 'en',
      };
    }
  }

  // 5. Default fallback search across all description / HSN / Party fields
  const generalMatches = invoices.filter((inv) =>
    inv.invoiceNo.includes(q) ||
    (inv.buyer?.name || '').toLowerCase().includes(q) ||
    inv.items.some((it) => it.description.toLowerCase().includes(q) || it.hsn.includes(q))
  );

  if (generalMatches.length > 0) {
    if (isHindi) {
      return {
        answer: `🔍 आपके सवाल से जुड़े **${generalMatches.length} बिल** मिले हैं:`,
        matchedInvoices: generalMatches,
        language: 'hi',
      };
    } else {
      return {
        answer: `🔍 Found **${generalMatches.length} matching invoices** for your query:`,
        matchedInvoices: generalMatches,
        language: 'en',
      };
    }
  }

  // No match found
  if (isHindi) {
    return {
      answer: `माफ़ कीजिए, आपके सवाल *" ${query} "* से जुड़ा कोई खास रिकॉर्ड नहीं मिला।\n\nआप इन तरीकों से पूछ सकते हैं:\n• **बिल नंबर:** जैसे *'Bill 339 की डिटेल बताओ'*\n• **पार्टी का नाम:** जैसे *'Verma Polymers ke bills'*\n• **गाड़ी नंबर:** जैसे *'DL01LAD1631 kis bill me hai'*\n• **कुल बिक्री:** जैसे *'Total sale kitni hui?'*`,
      matchedInvoices: [],
      language: 'hi',
    };
  } else {
    return {
      answer: `Sorry, I couldn't find specific records for *" ${query} "*.\n\nTry asking:\n• **By Invoice No:** e.g., *"Invoice 339 details"*\n• **By Customer / Party:** e.g., *"Show bills for Verma Polymers"*\n• **By Vehicle:** e.g., *"Which bill had vehicle DL01LAD1631?"*\n• **By Summary:** e.g., *"What is total sales & GST?"*`,
      matchedInvoices: [],
      language: 'en',
    };
  }
}

// Optional External LLM Integration (Gemini / OpenAI)
async function callExternalLLM(params: {
  query: string;
  invoices: Invoice[];
  parties: Party[];
  items: Item[];
  companyDetails: CompanyDetails;
  apiKey: string;
  provider: 'gemini' | 'openai';
  isHindi: boolean;
}): Promise<AIResponse | null> {
  const contextSummary = {
    company: params.companyDetails.name,
    gstin: params.companyDetails.gstin,
    totalInvoices: params.invoices.length,
    invoices: params.invoices.map((i) => ({
      invoiceNo: i.invoiceNo,
      date: i.date,
      party: i.buyer?.name,
      partyGstin: i.buyer?.gstin,
      vehicleNo: i.motorVehicleNo,
      items: i.items.map((it) => `${it.description} (${it.quantity} ${it.unit} @ ₹${it.rate})`),
      taxable: i.subtotal,
      totalTax: i.totalTax,
      grandTotal: i.grandTotal,
      status: i.status,
    })),
    parties: params.parties.map((p) => ({ name: p.name, gstin: p.gstin, city: p.city, state: p.state })),
    items: params.items.map((it) => ({ name: it.name, hsn: it.hsn, rate: it.rate, unit: it.unit })),
  };

  const systemPrompt = `You are the AI Billing & Accounts Assistant for Yash Polymers (Bawana Industrial Area, Delhi).
Answer the user's question accurately using ONLY the provided billing data context.
Language: Respond in ${params.isHindi ? 'Hindi / natural Hinglish' : 'English'}.
Keep it concise, clear, and professional with formatting (bullet points and bold text where helpful).`;

  if (params.provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${params.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nDATA CONTEXT:\n${JSON.stringify(contextSummary, null, 2)}\n\nUSER QUESTION: ${params.query}` },
            ],
          },
        ],
      }),
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
    const data = await res.json();
    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (answerText) {
      return {
        answer: answerText,
        matchedInvoices: params.invoices.filter((i) =>
          params.query.toLowerCase().includes(i.invoiceNo.toLowerCase()) ||
          params.query.toLowerCase().includes((i.buyer?.name || '').toLowerCase())
        ),
        language: params.isHindi ? 'hi' : 'en',
      };
    }
  }

  return null;
}

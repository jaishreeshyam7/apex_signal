import React, { useState, useRef, useEffect } from 'react';
import { useBilling } from '../../context/BillingContext';
import { processInvoiceQuery } from '../../utils/aiAssistant';
import type { ChatMessage, Invoice } from '../../types/billing';
import {
  Bot,
  Send,
  Sparkles,
  X,
  Printer,
  Key,
  Languages,
  Check,
  Minimize2,
  Maximize2,
} from 'lucide-react';

export const InvoiceAssistant: React.FC = () => {
  const {
    invoices,
    parties,
    items,
    companyDetails,
    setSelectedInvoiceForPrint,
  } = useBilling();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('yp_ai_api_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: '🙏 **Namaste! Yash Polymers AI Billing Assistant me aapka swagat hai.**\n\nAap mujhse kisi bhi bill number, customer/party ka naam, total sales, GST calculation ya vehicle number ke baare mein **English ya Hindi** me pooch sakte hain.\n\n*Jaise: "Bill 339 ki details", "Total sales kitni hui?", "Verma Polymers ke bills" आदि।*',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await processInvoiceQuery({
        query: textToSend.trim(),
        invoices,
        parties,
        items,
        companyDetails,
        apiKey: apiKey || undefined,
        apiProvider: 'gemini',
      });

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedInvoices: response.matchedInvoices,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an error processing your query. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = () => {
    localStorage.setItem('yp_ai_api_key', apiKey.trim());
    setKeySaved(true);
    setTimeout(() => {
      setKeySaved(false);
      setShowKeyModal(false);
    }, 1500);
  };

  const handleInvoiceClick = (inv: Invoice) => {
    setSelectedInvoiceForPrint(inv);
  };

  const quickChips = [
    '📊 Total Sales & GST Summary',
    '🔍 Bill 339 ki details',
    '🚚 Gaadi / Vehicle numbers',
    '🏢 Verma Polymers ke saare bills',
    '🇮🇳 हिंदी में हिसाब बताओ',
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 no-print">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm rounded-full shadow-2xl hover:scale-105 transition-all duration-200 border border-white/20 group"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          </div>
          <span>AI Bill Assistant (बही-खाता)</span>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </button>
      </div>

      {/* Chat Drawer / Window */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 no-print ${
            isExpanded
              ? 'w-[95vw] sm:w-[650px] h-[85vh] max-h-[800px]'
              : 'w-[92vw] sm:w-[420px] h-[540px]'
          }`}
        >
          {/* Header */}
          <div className="bg-[#0a152e] text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Yash Polymers AI Assistant</h3>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Languages className="w-3 h-3" />
                  <span>Bilingual (English + Hindi / Hinglish)</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setShowKeyModal(true)}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition text-xs flex items-center gap-1"
                title="Configure LLM API Key (Optional)"
              >
                <Key className="w-3.5 h-3.5" />
                <span className="text-[10px]">{apiKey ? 'API Active' : 'API'}</span>
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="bg-slate-50 px-3 py-2 border-b border-slate-200/80 overflow-x-auto whitespace-nowrap flex gap-1.5 shrink-0 scrollbar-none">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 text-[11px] font-semibold rounded-full border border-slate-200 transition shrink-0 shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Render Clickable Matched Invoices Cards */}
                {msg.matchedInvoices && msg.matchedInvoices.length > 0 && (
                  <div className="mt-2 w-full space-y-1.5 max-w-[92%]">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                      Matched Invoices (Click to View/Print):
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {msg.matchedInvoices.slice(0, 4).map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => handleInvoiceClick(inv)}
                          className="bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-2.5 rounded-xl cursor-pointer transition flex items-center justify-between shadow-2xs group"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">#{inv.invoiceNo}</span>
                              <span className="text-[10px] text-slate-500 font-medium">{inv.date}</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                              {inv.buyer?.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-600 text-xs">
                              ₹{inv.grandTotal.toLocaleString('en-IN')}
                            </span>
                            <div className="p-1 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white rounded-md text-slate-600 transition">
                              <Printer className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Finding invoice details & computing data...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about any bill, party, sales, vehicle... (Eng / हिंदी)"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-md transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Optional API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-base">LLM API Key (Optional)</h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              The AI Assistant already includes an **instant built-in zero-latency local RAG engine** that works 100% offline without any API key.
              <br /><br />
              Optionally, you can enter your <strong>Google Gemini API Key</strong> to enable deep conversational answering:
            </p>

            <div className="space-y-3 mb-5">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {keySaved && (
                <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>API Key saved to browser storage!</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setApiKey('');
                  localStorage.removeItem('yp_ai_api_key');
                  setShowKeyModal(false);
                }}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                Clear Key
              </button>
              <button
                onClick={handleSaveKey}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

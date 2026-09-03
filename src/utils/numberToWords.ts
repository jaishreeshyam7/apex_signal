const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertBelowThousand(num: number): string {
  let str = '';
  if (num >= 100) {
    str += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num > 0) {
    if (num < 20) {
      str += ones[num] + ' ';
    } else {
      str += tens[Math.floor(num / 10)] + ' ';
      if (num % 10 > 0) {
        str += ones[num % 10] + ' ';
      }
    }
  }
  return str.trim();
}

export function numberToWordsINR(amount: number): string {
  if (amount === 0) return 'INR Zero Rupees Only';
  if (isNaN(amount)) return '';

  const rounded = Math.round(amount * 100) / 100;
  let integerPart = Math.floor(rounded);
  const decimalPart = Math.round((rounded - integerPart) * 100);

  let result = '';

  // Crores
  if (integerPart >= 10000000) {
    const crores = Math.floor(integerPart / 10000000);
    result += convertBelowThousand(crores) + ' Crore ';
    integerPart %= 10000000;
  }

  // Lakhs
  if (integerPart >= 100000) {
    const lakhs = Math.floor(integerPart / 100000);
    result += convertBelowThousand(lakhs) + ' Lakh ';
    integerPart %= 100000;
  }

  // Thousands
  if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000);
    result += convertBelowThousand(thousands) + ' Thousand ';
    integerPart %= 1000;
  }

  // Hundreds & Below
  if (integerPart > 0) {
    result += convertBelowThousand(integerPart) + ' ';
  }

  result = result.trim();
  if (result) {
    result = 'INR ' + result + ' Rupees';
  } else {
    result = 'INR Zero Rupees';
  }

  if (decimalPart > 0) {
    result += ' and ' + convertBelowThousand(decimalPart) + ' Paise';
  }

  return result + ' Only';
}

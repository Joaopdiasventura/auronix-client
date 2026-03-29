export const parseMoneyInput = (value: string): number | null => {
  const normalizedValue = value.trim();
  if (!normalizedValue) return null;

  const sanitizedValue = normalizedValue.replace(/[^\d,.-]/g, '');
  if (!sanitizedValue) return null;

  const separatorIndex = Math.max(sanitizedValue.lastIndexOf(','), sanitizedValue.lastIndexOf('.'));

  if (separatorIndex < 0) {
    const digits = sanitizedValue.replace(/\D/g, '');
    if (!digits) return null;
    return Number(digits) * 100;
  }

  const integerPart = sanitizedValue.slice(0, separatorIndex).replace(/\D/g, '');
  const decimalPart = sanitizedValue
    .slice(separatorIndex + 1)
    .replace(/\D/g, '')
    .padEnd(2, '0')
    .slice(0, 2);

  const cents = `${integerPart || '0'}${decimalPart}`;
  if (!/^\d+$/.test(cents)) return null;

  return Number(cents);
};

import { parseMoneyInput } from './parse-money-input';

describe('parseMoneyInput', () => {
  it('parses integer values as cents', () => {
    expect(parseMoneyInput('150')).toBe(15000);
  });

  it('parses decimal values with comma or dot separators', () => {
    expect(parseMoneyInput('150,50')).toBe(15050);
    expect(parseMoneyInput('150.50')).toBe(15050);
  });

  it('parses formatted currency strings', () => {
    expect(parseMoneyInput('R$ 1.234,56')).toBe(123456);
  });

  it('pads decimal values with a single fractional digit', () => {
    expect(parseMoneyInput('10,5')).toBe(1050);
  });

  it('returns null for empty or non-numeric input', () => {
    expect(parseMoneyInput('')).toBeNull();
    expect(parseMoneyInput('   ')).toBeNull();
    expect(parseMoneyInput('abc')).toBeNull();
  });
});

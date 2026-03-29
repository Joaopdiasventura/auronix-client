const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  currency: 'BRL',
  style: 'currency',
});

export const formatCurrency = (valueInCents: number): string =>
  currencyFormatter.format(valueInCents / 100);

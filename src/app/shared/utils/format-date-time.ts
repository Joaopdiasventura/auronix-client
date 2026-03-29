const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const formatDateTime = (value: string): string => dateTimeFormatter.format(new Date(value));

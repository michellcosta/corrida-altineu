// Utilidades de data em fuso local

export function parseLocalDate(value: string | Date): Date {
  if (value instanceof Date) return value
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

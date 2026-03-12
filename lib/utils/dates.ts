// Utilidades de data em fuso local

export function parseLocalDate(value: string | Date): Date {
  if (value instanceof Date) return value
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Para o countdown: interpreta data (e hora se presente) como alvo.
 * Se só tiver data (YYYY-MM-DD), assume 08:00 Brasília (11:00 UTC).
 */
export function parseRaceDateTime(value: string | Date): Date {
  if (value instanceof Date) return value
  const str = typeof value === 'string' ? value.trim() : ''
  const datePart = str.split('T')[0]?.split(' ')[0] || str
  const parts = datePart.split('-').map(Number)
  const [year, month, day] = parts
  if (!year || !month || !day) return new Date(NaN)
  if (str.includes('T')) {
    const d = new Date(str)
    return Number.isNaN(d.getTime()) ? new Date(NaN) : d
  }
  // Apenas data: 08:00 Brasília = 11:00 UTC
  return new Date(Date.UTC(year, month - 1, day, 11, 0, 0))
}

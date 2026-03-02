/**
 * Formata data sem deslocamento de timezone.
 * Evita o bug: new Date('1959-09-08') = meia-noite UTC = 07/09 no Brasil (UTC-3).
 * Para strings YYYY-MM-DD (date-only), usa T12:00:00 para manter o dia correto.
 */
export function formatDateOnly(
  val: string | number | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (val == null || val === '') return ''
  const str = String(val).trim()
  if (!str) return ''
  const opts = options ?? { day: '2-digit', month: '2-digit', year: 'numeric' }
  const iso = str.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', opts)
  }
  return new Date(val).toLocaleDateString('pt-BR', opts)
}

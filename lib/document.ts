/**
 * Normaliza documento (CPF/RG) para formato canônico: apenas dígitos.
 * RG (8-9 dígitos) é padronizado com zeros à esquerda para 9 dígitos.
 */
export function normalizeDocument(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 11) return digits // CPF
  if (digits.length >= 8 && digits.length <= 9) return digits.padStart(9, '0') // RG
  return digits
}

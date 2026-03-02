/**
 * Validação de CPF e RG para formulários.
 * CPF: algoritmo dos dígitos verificadores.
 * RG: formato + rejeição de sequências inválidas (não há algoritmo nacional).
 */

export function isValidCPF(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false
  if (digits === '00000000000') return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(digits[10])) return false

  return true
}

export function isValidRG(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 9) return false
  if (/^(\d)\1{8}$/.test(digits)) return false
  if (digits === '000000000') return false
  return true
}

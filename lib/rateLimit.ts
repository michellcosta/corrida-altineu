import { NextRequest } from 'next/server'
import { createHash } from 'crypto'

const RATE_LIMIT_SALT = process.env.RATE_LIMIT_SALT || 'corrida-altineu-rate-limit-salt-v1'

/**
 * Hash do IP com salt para rate limiting e lockout.
 */
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip + RATE_LIMIT_SALT).digest('hex')
}

/**
 * Obtém o IP do cliente a partir da requisição.
 * Considera x-forwarded-for (primeiro da lista) ou x-real-ip.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return '127.0.0.1'
}

/**
 * Normaliza data de nascimento para YYYY-MM-DD.
 * Aceita: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD.
 */
export function parseBirthDate(input: string): string | null {
  const s = input?.toString().trim()
  if (!s) return null

  // YYYY-MM-DD
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s)
  if (iso) {
    const [, y, m, d] = iso
    const year = parseInt(y!, 10)
    const month = parseInt(m!, 10)
    const day = parseInt(d!, 10)
    if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  // DD/MM/YYYY ou DD-MM-YYYY
  const dmy = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(s)
  if (dmy) {
    const [, d, m, y] = dmy
    const year = parseInt(y!, 10)
    const month = parseInt(m!, 10)
    const day = parseInt(d!, 10)
    if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  return null
}

/**
 * Compara datas normalizadas (YYYY-MM-DD).
 */
export function datesMatch(dbDate: string | null | undefined, inputDate: string | null | undefined): boolean {
  if (!dbDate || !inputDate) return false
  const a = dbDate.slice(0, 10)
  const b = inputDate.slice(0, 10)
  return a === b
}

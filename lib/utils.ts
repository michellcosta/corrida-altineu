import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/** Garante que o base64 do QR Code PIX seja uma data URL válida para <img src> */
export function toQrCodeDataUrl(base64: string | null | undefined): string {
  if (!base64?.trim()) return ''
  const s = base64.trim()
  return s.startsWith('data:') ? s : `data:image/png;base64,${s}`
}

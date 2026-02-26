'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X } from 'lucide-react'

const SCANNER_ID = 'checkin-qr-scanner'

interface QrScannerProps {
  onScan: (decodedText: string) => void
  onClose: () => void
}

export default function QrScanner({ onScan, onClose }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const el = document.getElementById(SCANNER_ID)
    if (!el) return
    const scanner = new Html5Qrcode(SCANNER_ID)
    scannerRef.current = scanner
    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().then(() => {
            onScan(decodedText)
          }).catch(() => {})
        },
        () => {}
      )
      .catch((err) => {
        setError(err?.message || 'Não foi possível acessar a câmera')
      })
    return () => {
      scannerRef.current = null
      scanner.stop().catch(() => {})
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Escanear QR Code</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          <div id={SCANNER_ID} className="w-full min-h-[250px]" />
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>
        <p className="text-xs text-gray-500 p-4 text-center">
          Aponte a câmera para o QR Code do comprovante de inscrição
        </p>
      </div>
    </div>
  )
}

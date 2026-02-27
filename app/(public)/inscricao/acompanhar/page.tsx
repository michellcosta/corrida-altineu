import { Metadata } from 'next'
import { Suspense } from 'react'
import AcompanharClient from './AcompanharClient'

export const metadata: Metadata = {
  title: 'Acompanhar Inscrição | Corrida de Macuco',
  description: 'Consulte o status da sua inscrição na Corrida Rústica de Macuco informando CPF, RG ou código de confirmação.',
  keywords: 'acompanhar inscrição, status, corrida macuco, CPF, RG, código',
}

export default function AcompanharInscricaoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-500">Carregando...</div></div>}>
      <AcompanharClient />
    </Suspense>
  )
}

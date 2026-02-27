import { Suspense } from 'react'
import { Metadata } from 'next'
import InscricaoSucessoClient from './InscricaoSucessoClient'

export const metadata: Metadata = {
  title: 'Pagamento Confirmado | Corrida de Macuco',
  description: 'Sua inscrição na Corrida Rústica de Macuco foi confirmada com sucesso.',
}

function LoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="animate-pulse text-gray-400">Carregando...</div>
    </div>
  )
}

export default function InscricaoSucessoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InscricaoSucessoClient />
    </Suspense>
  )
}

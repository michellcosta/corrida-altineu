import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import InscricaoClient from './InscricaoClient'

export default function InscricaoPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      }
    >
      <InscricaoClient />
    </Suspense>
  )
}

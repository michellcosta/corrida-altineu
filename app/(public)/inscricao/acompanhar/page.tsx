import { Metadata } from 'next'
import { RACE_CONFIG } from '@/lib/constants'
import AcompanharClient from './AcompanharClient'

export const metadata: Metadata = {
  title: 'Acompanhar Inscrição | Corrida de Macuco',
  description: 'Consulte o status da sua inscrição na Corrida Rústica de Macuco informando CPF, RG ou código de confirmação.',
  keywords: 'acompanhar inscrição, status, corrida macuco, CPF, RG, código',
}

export default function AcompanharInscricaoPage() {
  return <AcompanharClient />
}

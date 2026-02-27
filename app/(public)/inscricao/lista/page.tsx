import { Metadata } from 'next'
import { RACE_CONFIG } from '@/lib/constants'
import { getLatestEvent } from '@/lib/cms/event'
import ListaInscritosClient from './ListaInscritosClient'

export async function generateMetadata(): Promise<Metadata> {
  const event = await getLatestEvent()
  const edition = event?.edition ?? RACE_CONFIG.edition
  return {
    title: 'Lista de Inscritos | Corrida de Macuco',
    description: `Confira a lista de inscritos por categoria na ${edition}ª Corrida Rústica de Macuco.`,
    keywords: 'lista inscritos, participantes, corrida macuco, categorias',
  }
}

export default function ListaInscritosPage() {
  return <ListaInscritosClient />
}

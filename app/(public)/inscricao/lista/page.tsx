import { Metadata } from 'next'
import { RACE_CONFIG } from '@/lib/constants'
import ListaInscritosClient from './ListaInscritosClient'

export const metadata: Metadata = {
  title: 'Lista de Inscritos | Corrida de Macuco',
  description: `Confira a lista de inscritos por categoria na ${RACE_CONFIG.edition}ª Corrida Rústica de Macuco.`,
  keywords: 'lista inscritos, participantes, corrida macuco, categorias',
}

export default function ListaInscritosPage() {
  return <ListaInscritosClient />
}

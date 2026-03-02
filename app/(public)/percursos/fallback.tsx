'use client'

import { Download, MapPin, TrendingUp, Droplets, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import ElevationChart from '@/components/charts/ElevationChart'

// Importar o mapa dinamicamente (sem SSR) pois o Leaflet precisa do browser
const RouteMap = dynamic(() => import('@/components/map/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <MapPin className="text-gray-400 mx-auto mb-4 animate-pulse" size={64} />
        <p className="text-gray-600 font-semibold">Carregando mapa interativo...</p>
      </div>
    </div>
  ),
})

export default function PercursosPage() {
  const [activeTab, setActiveTab] = useState('10k')

  const percursos = {
    '10k': {
      title: 'Percurso 10K',
      distance: '10 quilômetros',
      elevation: '+92m / -92m',
      start: 'Fábrica de Cimento Holcim',
      finish: 'Praça Prof. João Brasil, Macuco',
      time: 'Largada às 12h • Limite: 90 minutos',
      description:
        'Largada na Fábrica de Cimento Holcim com chegada na Praça Prof. João Brasil, passando por trechos rurais e pelo centro de Macuco.',
      highlights: [
        'Saída controlada na Fábrica de Cimento Holcim',
        'Trechos com apoio e hidratação ao longo da RJ-116',
        'Chegada no portal montado na Praça Prof. João Brasil',
      ],
      hydration: [
        'Largada - Holcim',
        'Km 3 - Apoio móvel',
        'Km 6 - Bairro Goiabal',
        'Km 8,5 - Acesso ao Centro',
        'Chegada - Praça Prof. João Brasil',
      ],
      // Dados reais de altimetria extraídos do GPX oficial
      altimetry: [
        { km: 0, elev: 347 },
        { km: 1, elev: 351.5 },
        { km: 2, elev: 317.8 },
        { km: 3, elev: 299.3 },
        { km: 4, elev: 291.5 },
        { km: 5, elev: 275.5 },
        { km: 6, elev: 277.8 },
        { km: 7, elev: 282 },
        { km: 8, elev: 281.8 },
        { km: 9, elev: 270.8 },
        { km: 9.69, elev: 272.3 },
      ],
    },
    '2k': {
      title: 'Corrida Infanto-Juvenil 2.5K',
      distance: '2,5 quilômetros',
      elevation: '+20m / -20m',
      start: 'Entrada do Goiabal',
      finish: 'Praça Prof. João Brasil, Macuco',
      time: 'Largada às 10h • Limite: 30 minutos',
      description:
        'Percurso rápido e seguro para atletas de 11 a 14 anos, ligando o bairro Goiabal ao centro de Macuco.',
      highlights: [
        'Concentração na entrada do Goiabal',
        'Acompanhamento integral de staff e batedores',
        'Chegada com passarela especial na Praça Prof. João Brasil',
      ],
      hydration: ['Chegada - Praça Prof. João Brasil'],
      // Dados simulados (percurso mais plano)
      altimetry: [
        { km: 0, elev: 340 },
        { km: 0.5, elev: 345 },
        { km: 1, elev: 350 },
        { km: 1.5, elev: 348 },
        { km: 2, elev: 342 },
      ],
    },
  }

  const currentPercurso = percursos[activeTab as keyof typeof percursos]

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl">
            <h1 className="font-display font-bold text-5xl md:text-6xl mb-6">
              Percursos
            </h1>
            <p className="text-xl text-green-100 leading-relaxed">
              Conheça os trajetos oficiais da 51ª Corrida de Macuco. Todos os percursos são medidos oficialmente.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              {[
                { key: '10k', label: '10K' },
                { key: '2k', label: '2.5K - Infantil' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Informações do Percurso */}
          <div className="max-w-6xl mx-auto mb-16">
            <div className="card">
              <h2 className="font-display font-bold text-3xl mb-6">
                {currentPercurso.title}
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                {currentPercurso.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <MapPin className="text-blue-600 mt-1" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Distância</p>
                    <p className="font-bold text-lg">{currentPercurso.distance}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <TrendingUp className="text-green-600 mt-1" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Elevação</p>
                    <p className="font-bold text-lg">{currentPercurso.elevation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <Droplets className="text-purple-600 mt-1" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Tempo Limite</p>
                    <p className="font-bold text-lg">{currentPercurso.time}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display font-bold text-xl mb-4">
                    Destaques do Percurso
                  </h3>
                  <ul className="space-y-3">
                    {currentPercurso.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary-600 mr-2">▸</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-display font-bold text-xl mb-4">
                    Postos de Hidratação
                  </h3>
                  <div className="space-y-3">
                    {currentPercurso.hydration.map((posto, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <Droplets className="text-blue-600" size={20} />
                        <span className="font-semibold">{posto}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="mb-16">
            <h2 className="section-title text-center mb-12">
              Mapa <span className="text-gradient">Interativo</span>
            </h2>
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <RouteMap routeType={activeTab as '10k' | '2k'} />
              </div>

              <div className="card">
                <div className="flex flex-wrap gap-4 justify-center">
                  {activeTab === '10k' && (
                    <a 
                      href="/routes/10k-oficial.gpx" 
                      download="corrida-macuco-10k.gpx"
                      className="btn-primary inline-flex items-center"
                    >
                      <Download size={20} className="mr-2" />
                      Baixar GPX Oficial
                    </a>
                  )}
                  {activeTab !== '10k' && (
                    <button className="btn-primary inline-flex items-center opacity-50 cursor-not-allowed" disabled>
                      <Download size={20} className="mr-2" />
                      GPX em breve
                    </button>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=-21.984536,-42.253116`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary inline-flex items-center"
                  >
                    <MapPin size={20} className="mr-2" />
                    Ver no Google Maps
                  </a>
                </div>
                {activeTab === '10k' && (
                  <p className="text-center text-sm text-gray-600 mt-4">
                    ✅ Percurso oficial de <strong>9.69 km</strong> • 
                    Elevação: <strong>265m - 358m</strong> • 
                    Ganho: <strong>+92m</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Altimetria */}
          <div className="mb-16">
            <h2 className="section-title text-center mb-12">
              Perfil de <span className="text-gradient">Elevação</span>
            </h2>
            <div className="max-w-5xl mx-auto card">
              <ElevationChart data={currentPercurso.altimetry} distanceLabel="km" />
            </div>
          </div>

          {/* Logística */}
          <div>
            <h2 className="section-title text-center mb-12">
              Logística e <span className="text-gradient">Informações</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="card">
                <h3 className="font-display font-bold text-xl mb-4">
                  🚗 Estacionamento
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Estacionamento gratuito na Rua das Flores</li>
                  <li>• Estacionamento oficial com manobrista (R$ 15)</li>
                  <li>• Chegue com antecedência (ruas fecham às 6h30)</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="font-display font-bold text-xl mb-4">
                  🚌 Transporte Público
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Ônibus especiais partindo às 5h30</li>
                  <li>• Saída: Terminal Rodoviário</li>
                  <li>• Retorno: Após às 10h</li>
                </ul>
              </div>

              <div className="card">
                <h3 className="font-display font-bold text-xl mb-4">
                  🚧 Interdições
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Centro fechado das 6h30 às 11h</li>
                  <li>• Av. Principal: fluxo controlado</li>
                  <li>• Rotas alternativas sinalizadas</li>
                </ul>
              </div>

              <div className="card bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-orange-600 mt-1" size={24} />
                  <div>
                    <h3 className="font-display font-bold text-xl mb-2">
                      ⚠️ Pontos de Atenção
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Km 3: Lombada redutora</li>
                      <li>• Km 5-6: Subida íngreme</li>
                      <li>• Km 8: Curva acentuada</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


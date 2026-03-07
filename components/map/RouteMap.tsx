'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Droplets, Heart, Flag, Navigation } from 'lucide-react'

// Fix para ícones do Leaflet no Next.js
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

interface RoutePoint {
  lat: number
  lng: number
  km?: number
}

interface HydrationPoint {
  lat: number
  lng: number
  label: string
}

interface MedicalPoint {
  lat: number
  lng: number
}

interface RouteMapProps {
  routeType: '10k' | '2k'
}

// Coordenadas reais extraídas do GPX oficial
const MACUCO_CENTER = { lat: -21.980031, lng: -42.287636 }

// Dados dos percursos - 10K do GPX oficial (New file 1.gpx)
const ROUTES_10K_FULL_PATH: [number, number][] = [
  [-21.980549, -42.286545],
  [-21.98111, -42.285421],
  [-21.981319, -42.28511],
  [-21.98179, -42.284753],
  [-21.982584, -42.284337],
  [-21.98287, -42.284092],
  [-21.982992, -42.283813],
  [-21.983227, -42.282815],
  [-21.983393, -42.282525],
  [-21.98359, -42.282351],
  [-21.985428, -42.281479],
  [-21.986086, -42.281481],
  [-21.986321, -42.281434],
  [-21.986499, -42.281304],
  [-21.986709, -42.28102],
  [-21.98716, -42.280663],
  [-21.988006, -42.280331],
  [-21.988288, -42.280283],
  [-21.98851, -42.280303],
  [-21.988911, -42.280496],
  [-21.9898, -42.281181],
  [-21.99005, -42.281431],
  [-21.990988, -42.282863],
  [-21.991182, -42.283515],
  [-21.991432, -42.284969],
  [-21.991457, -42.285378],
  [-21.991409, -42.285992],
  [-21.991233, -42.28659],
  [-21.990721, -42.287514],
  [-21.990587, -42.287919],
  [-21.990562, -42.288184],
  [-21.990727, -42.289041],
  [-21.990712, -42.289582],
  [-21.990805, -42.289678],
  [-21.99091, -42.289672],
  [-21.992279, -42.28703],
  [-21.992564, -42.286251],
  [-21.992623, -42.286002],
  [-21.992702, -42.285576],
  [-21.992788, -42.284928],
  [-21.992911, -42.28488],
  [-21.992971, -42.284687],
  [-21.99308, -42.284054],
  [-21.993151, -42.283495],
  [-21.99325, -42.282718],
  [-21.993313, -42.282088],
  [-21.993344, -42.281779],
  [-21.993364, -42.281431],
  [-21.993295, -42.281312],
  [-21.993247, -42.281229],
  [-21.993556, -42.278971],
  [-21.993619, -42.278603],
  [-21.993686, -42.278407],
  [-21.993752, -42.278274],
  [-21.993811, -42.278185],
  [-21.993886, -42.278086],
  [-21.993945, -42.278028],
  [-21.994113, -42.277889],
  [-21.994468, -42.277653],
  [-21.994885, -42.277351],
  [-21.995126, -42.276989],
  [-21.995236, -42.276556],
  [-21.99532, -42.275483],
  [-21.995489, -42.275125],
  [-21.996796, -42.27409],
  [-21.997084, -42.273733],
  [-21.997168, -42.273528],
  [-21.997225, -42.273075],
  [-21.997192, -42.272176],
  [-21.997367, -42.271644],
  [-21.998316, -42.270176],
  [-21.999162, -42.268973],
  [-21.999486, -42.268409],
  [-21.999599, -42.268043],
  [-21.999662, -42.267488],
  [-21.999483, -42.265912],
  [-21.999516, -42.265149],
  [-21.999747, -42.26439],
  [-22.00055, -42.263013],
  [-22.000697, -42.262629],
  [-22.000703, -42.262321],
  [-22.000588, -42.26194],
  [-22.000409, -42.261703],
  [-22.000187, -42.261518],
  [-21.99311, -42.25725],
  [-21.992385, -42.256904],
  [-21.991128, -42.256497],
  [-21.990368, -42.25616],
  [-21.989643, -42.255707],
  [-21.988753, -42.255066],
  [-21.988487, -42.254962],
  [-21.987746, -42.25489],
  [-21.985005, -42.25512],
  [-21.984317, -42.255098],
  [-21.983932, -42.254968],
  [-21.983464, -42.254628],
  [-21.98219, -42.253258],
  [-21.979404, -42.25121],
  [-21.980324, -42.249828],
  [-21.980467, -42.249939],
  [-21.981391, -42.250986],
  [-21.981633, -42.25116],
  [-21.984189, -42.252094],
  [-21.984774, -42.252419],
  [-21.984746, -42.252405],
  [-21.984694, -42.252585],
]

// Dados dos percursos
const ROUTES = {
  '10k': {
    zoom: 14,
    center: MACUCO_CENTER,
    path: [
      { lat: -21.980549, lng: -42.286545, km: 0 },
      { lat: -21.98287, lng: -42.284092, km: 1 },
      { lat: -21.990727, lng: -42.289041, km: 2 },
      { lat: -21.993811, lng: -42.278185, km: 3 },
      { lat: -21.999483, lng: -42.265912, km: 4 },
      { lat: -21.999662, lng: -42.267488, km: 5 },
      { lat: -21.990368, lng: -42.25616, km: 6 },
      { lat: -21.984317, lng: -42.255098, km: 7 },
      { lat: -21.980324, lng: -42.249828, km: 8 },
      { lat: -21.984774, lng: -42.252419, km: 9 },
      { lat: -21.984694, lng: -42.252585, km: 9.69 },
    ],
    fullPath: ROUTES_10K_FULL_PATH,
    hydration: [
      { lat: -21.990727, lng: -42.289041, label: 'Km 2' },
      { lat: -21.999483, lng: -42.265912, label: 'Km 4' },
      { lat: -21.990368, lng: -42.25616, label: 'Km 6' },
      { lat: -21.980324, lng: -42.249828, label: 'Km 8' },
      { lat: -21.984694, lng: -42.252585, label: 'Chegada' },
    ],
    medical: [{ lat: -21.984694, lng: -42.252585 }], // Chegada
    // Dados de elevação
    stats: {
      distance: 9.69,
      minElevation: 265.5,
      maxElevation: 357.8,
      elevationGain: 92.3,
    },
  },
  '2k': {
    zoom: 15,
    center: MACUCO_CENTER,
    // Percurso simulado de 2K (mais curto, próximo à praça)
    path: [
      { lat: -21.5644, lng: -42.1111, km: 0 }, // Largada
      { lat: -21.5620, lng: -42.1100, km: 0.5 },
      { lat: -21.5600, lng: -42.1090, km: 1 }, // Meio
      { lat: -21.5620, lng: -42.1100, km: 1.5 },
      { lat: -21.5644, lng: -42.1111, km: 2 }, // Chegada
    ],
    hydration: [
      { lat: -21.5644, lng: -42.1111, label: 'Largada' },
      { lat: -21.5600, lng: -42.1090, label: 'Km 1' },
      { lat: -21.5644, lng: -42.1111, label: 'Chegada' },
    ],
    medical: [{ lat: -21.5644, lng: -42.1111 }], // Chegada
  },
}

export default function RouteMap({ routeType }: RouteMapProps) {
  const [isClient, setIsClient] = useState(false)
  const route = ROUTES[routeType]

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Fix para ícones do Leaflet
    if (isClient) {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: icon.src,
        shadowUrl: iconShadow.src,
      })
    }
  }, [isClient])

  // Só renderizar o mapa no cliente
  if (!isClient) {
    return (
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="text-gray-400 mx-auto mb-4 animate-pulse" size={64} />
          <p className="text-gray-600 font-semibold">Carregando mapa...</p>
        </div>
      </div>
    )
  }

  // Ícones customizados
  const startIcon = L.divIcon({
    html: `<div class="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg></div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

  const finishIcon = L.divIcon({
    html: `<div class="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg></div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

  const hydrationIcon = L.divIcon({
    html: `<div class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg></div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

  const medicalIcon = L.divIcon({
    html: `<div class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg></div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })

  // Coordenadas da linha do percurso (usa fullPath para 10K - traçado real do GPX)
  const pathCoords =
    'fullPath' in route && Array.isArray(route.fullPath) && route.fullPath.length > 0
      ? (route.fullPath as [number, number][])
      : (route.path.map((p) => [p.lat, p.lng]) as [number, number][])

  return (
    <div className="rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[route.center.lat, route.center.lng]}
        zoom={route.zoom}
        style={{ height: '500px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Linha do percurso */}
        <Polyline
          positions={pathCoords}
          pathOptions={{
            color: '#2563eb',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 5',
          }}
        />

        {/* Marcador de Largada */}
        <Marker position={[route.path[0].lat, route.path[0].lng]} icon={startIcon}>
          <Popup>
            <div className="text-center">
              <p className="font-bold text-green-600">🏁 Largada</p>
              <p className="text-sm">Praça da Matriz</p>
            </div>
          </Popup>
        </Marker>

        {/* Marcador de Chegada */}
        <Marker
          position={[
            route.path[route.path.length - 1].lat,
            route.path[route.path.length - 1].lng,
          ]}
          icon={finishIcon}
        >
          <Popup>
            <div className="text-center">
              <p className="font-bold text-red-600">🏁 Chegada</p>
              <p className="text-sm">Praça da Matriz</p>
            </div>
          </Popup>
        </Marker>

        {/* Postos de Hidratação */}
        {route.hydration.map((hydro, idx) => (
          <Marker key={`hydro-${idx}`} position={[hydro.lat, hydro.lng]} icon={hydrationIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-blue-600">💧 Hidratação</p>
                <p className="text-sm">{hydro.label}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Postos Médicos */}
        {route.medical.map((medical, idx) => (
          <Marker key={`medical-${idx}`} position={[medical.lat, medical.lng]} icon={medicalIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-red-600">🚑 Apoio Médico</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Círculo na área de largada/chegada */}
        <Circle
          center={[route.center.lat, route.center.lng]}
          radius={50}
          pathOptions={{
            color: '#22c55e',
            fillColor: '#22c55e',
            fillOpacity: 0.1,
          }}
        />
      </MapContainer>

      {/* Legenda e Estatísticas */}
      <div className="bg-white border-t">
        {/* Estatísticas do Percurso */}
        {'stats' in route && route.stats && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
            <div className="flex flex-wrap gap-6 justify-center text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{route.stats.distance} km</p>
                <p className="text-xs text-gray-600">Distância Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">+{route.stats.elevationGain}m</p>
                <p className="text-xs text-gray-600">Ganho de Elevação</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{route.stats.maxElevation}m</p>
                <p className="text-xs text-gray-600">Altitude Máxima</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{route.stats.minElevation}m</p>
                <p className="text-xs text-gray-600">Altitude Mínima</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Legenda dos Marcadores */}
        <div className="p-4">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded-full"></div>
              <span>Largada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <span>Chegada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Hidratação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>Apoio Médico</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-600"></div>
              <span>Percurso Oficial</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


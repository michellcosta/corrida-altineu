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

// Dados dos percursos
const ROUTES = {
  '10k': {
    zoom: 14,
    center: MACUCO_CENTER,
    path: [
      { lat: -21.980031, lng: -42.287636, km: 0 },
      { lat: -21.985248, lng: -42.281555, km: 1 },
      { lat: -21.991411, lng: -42.284812, km: 2 },
      { lat: -21.99268, lng: -42.285697, km: 3 },
      { lat: -21.995186, lng: -42.276821, km: 4 },
      { lat: -21.999301, lng: -42.268747, km: 5 },
      { lat: -21.998695, lng: -42.260623, km: 6 },
      { lat: -21.990678, lng: -42.25631, km: 7 },
      { lat: -21.982573, lng: -42.253628, km: 8 },
      { lat: -21.979969, lng: -42.249637, km: 9 },
      { lat: -21.984536, lng: -42.253116, km: 9.69 },
    ],
    fullPath: [
      [-21.980031, -42.287636],
      [-21.980302, -42.287038],
      [-21.980506, -42.286631],
      [-21.980302, -42.287038],
      [-21.980506, -42.286631],
      [-21.980808, -42.286026],
      [-21.981087, -42.285468],
      [-21.98111, -42.285421],
      [-21.981207, -42.285261],
      [-21.981319, -42.28511],
      [-21.981357, -42.285073],
      [-21.981409, -42.28502],
      [-21.981543, -42.284906],
      [-21.981689, -42.284816],
      [-21.98179, -42.284753],
      [-21.982029, -42.284629],
      [-21.982343, -42.284464],
      [-21.982584, -42.284337],
      [-21.982803, -42.284164],
      [-21.98287, -42.284092],
      [-21.982902, -42.284038],
      [-21.982928, -42.283991],
      [-21.982992, -42.283813],
      [-21.983044, -42.283584],
      [-21.983185, -42.282959],
      [-21.983187, -42.282948],
      [-21.983227, -42.282815],
      [-21.983285, -42.282684],
      [-21.983323, -42.28263],
      [-21.983393, -42.282525],
      [-21.983481, -42.282439],
      [-21.98359, -42.282351],
      [-21.983634, -42.282324],
      [-21.983713, -42.282274],
      [-21.984041, -42.282114],
      [-21.984206, -42.282043],
      [-21.984284, -42.282008],
      [-21.98495, -42.281696],
      [-21.985276, -42.281542],
      [-21.985428, -42.281479],
      [-21.985528, -42.28146],
      [-21.985547, -42.281456],
      [-21.985774, -42.281458],
      [-21.98597, -42.281477],
      [-21.986026, -42.281479],
      [-21.986086, -42.281481],
      [-21.986194, -42.281469],
      [-21.986321, -42.281434],
      [-21.986414, -42.281383],
      [-21.986469, -42.281333],
      [-21.986499, -42.281304],
      [-21.986687, -42.28105],
      [-21.986709, -42.28102],
      [-21.986904, -42.280849],
      [-21.987054, -42.28073],
      [-21.98716, -42.280663],
      [-21.987164, -42.280657],
      [-21.98716, -42.280663],
      [-21.987644, -42.280474],
      [-21.988006, -42.280331],
      [-21.988161, -42.280295],
      [-21.988273, -42.280285],
      [-21.988288, -42.280283],
      [-21.988393, -42.280283],
      [-21.98851, -42.280303],
      [-21.988695, -42.280366],
      [-21.988786, -42.280412],
      [-21.988911, -42.280496],
      [-21.988987, -42.280553],
      [-21.989522, -42.28096],
      [-21.989671, -42.281078],
      [-21.9898, -42.281181],
      [-21.989907, -42.281278],
      [-21.99005, -42.281431],
      [-21.990187, -42.281613],
      [-21.990236, -42.281688],
      [-21.990795, -42.282546],
      [-21.990876, -42.28267],
      [-21.990988, -42.282863],
      [-21.991029, -42.282961],
      [-21.991074, -42.283098],
      [-21.991116, -42.283261],
      [-21.991182, -42.283515],
      [-21.991277, -42.284012],
      [-21.991362, -42.284456],
      [-21.991399, -42.284725],
      [-21.991432, -42.284969],
      [-21.991457, -42.285378],
      [-21.991455, -42.285421],
      [-21.991443, -42.285666],
      [-21.991409, -42.285992],
      [-21.991318, -42.286359],
      [-21.991297, -42.286417],
      [-21.991233, -42.28659],
      [-21.990973, -42.287061],
      [-21.990721, -42.287514],
      [-21.990623, -42.287771],
      [-21.99061, -42.287826],
      [-21.990587, -42.287919],
      [-21.990562, -42.288184],
      [-21.990588, -42.288402],
      [-21.990629, -42.288557],
      [-21.990705, -42.288842],
      [-21.990727, -42.289041],
      [-21.990725, -42.289081],
      [-21.990711, -42.289284],
      [-21.990715, -42.289451],
      [-21.990713, -42.289575],
      [-21.990712, -42.289582],
      [-21.990734, -42.289624],
      [-21.990805, -42.289678],
      [-21.990858, -42.289687],
      [-21.990876, -42.289682],
      [-21.990851, -42.289704],
      [-21.990807, -42.28974],
      [-21.990775, -42.289757],
      [-21.990753, -42.289765],
      [-21.990734, -42.28977],
      [-21.990667, -42.289776],
      [-21.990607, -42.289775],
      [-21.99057, -42.289779],
      [-21.990534, -42.289795],
      [-21.990512, -42.289818],
      [-21.990495, -42.289847],
      [-21.990495, -42.289847],
      [-21.990504, -42.289883],
      [-21.990554, -42.289916],
      [-21.990645, -42.289944],
      [-21.990695, -42.289961],
      [-21.99072, -42.289975],
      [-21.990744, -42.289997],
      [-21.990764, -42.290024],
      [-21.990775, -42.290049],
      [-21.990787, -42.290121],
      [-21.990782, -42.290174],
      [-21.990765, -42.290229],
      [-21.990706, -42.290349],
      [-21.990674, -42.290416],
      [-21.990652, -42.290487],
      [-21.990632, -42.290572],
      [-21.990598, -42.290719],
      [-21.990532, -42.291085],
      [-21.990483, -42.291383],
      [-21.990469, -42.29156],
    ],
    hydration: [
      { lat: -21.980031, lng: -42.287636, label: 'Largada' },
      { lat: -21.990715, lng: -42.289451, label: 'Km 2.5' },
      { lat: -21.999317, lng: -42.268720, label: 'Km 5' },
      { lat: -21.986555, lng: -42.254982, label: 'Km 7.5' },
      { lat: -21.984536, lng: -42.253116, label: 'Chegada' },
    ],
    medical: [
      { lat: -21.991399, lng: -42.284725 }, // Km 2
      { lat: -21.999317, lng: -42.268720 }, // Km 5
      { lat: -21.982591, lng: -42.253647 }, // Km 8
    ],
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
    medical: [{ lat: -21.5620, lng: -42.1100 }],
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

  const kmIcon = (km: number) =>
    L.divIcon({
      html: `<div class="bg-white text-primary-600 font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md border border-primary-600 text-xs">${km}</div>`,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

  // Coordenadas da linha do percurso
  const pathCoords = route.path.map((p) => [p.lat, p.lng]) as [number, number][]

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

        {/* Marcadores de Quilometragem */}
        {route.path
          .filter((p) => p.km && p.km > 0 && p.km < route.path[route.path.length - 1].km!)
          .map((point, idx) => (
            <Marker
              key={`km-${idx}`}
              position={[point.lat, point.lng]}
              icon={kmIcon(point.km!)}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold">Km {point.km}</p>
                </div>
              </Popup>
            </Marker>
          ))}

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


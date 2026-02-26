# 🗺️ Componente de Mapa Interativo

Mapa interativo usando React Leaflet para visualizar os percursos da Corrida de Macuco.

## 📦 Funcionalidades Implementadas

### ✅ Features Atuais

- **Mapa interativo** com OpenStreetMap
- **Traçado dos percursos** (10K, 2K - Infantil)
- **Marcadores de largada/chegada** com ícones customizados
- **Marcadores de quilometragem** em cada km do percurso
- **Postos de hidratação** com marcadores específicos
- **Postos médicos** ao longo do percurso
- **Popups informativos** em cada marcador
- **Legenda** explicativa dos elementos do mapa
- **Responsivo** e otimizado para mobile
- **SSR disabled** para compatibilidade com Next.js

### 🎨 Personalização

O componente usa ícones SVG customizados com cores do Tailwind:
- 🟢 **Verde** para largada
- 🔴 **Vermelho** para chegada
- 🔵 **Azul** para hidratação
- 🩺 **Vermelho claro** para apoio médico

## 📍 Uso

```tsx
import dynamic from 'next/dynamic'

// Importar dinamicamente (sem SSR)
const RouteMap = dynamic(() => import('@/components/map/RouteMap'), {
  ssr: false,
})

// Usar no componente
<RouteMap routeType="10k" />
```

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `routeType` | `'10k' \| '2k'` | Define qual percurso exibir |

## 🚀 Evoluções Futuras

### 1. Perfil de Altimetria

Adicionar gráfico de elevação usando Chart.js ou Recharts:

```tsx
import { Line } from 'recharts'

const elevationData = route.path.map(p => ({
  km: p.km,
  elevation: p.elevation, // Adicionar dados de elevação
}))

<LineChart data={elevationData}>
  <Line dataKey="elevation" />
</LineChart>
```

### 2. Carregamento de GPX/KML Dinâmico

Permitir upload e visualização de arquivos GPX:

```tsx
import { gpx } from 'leaflet-gpx'

// Carregar arquivo GPX
const gpxLayer = new L.GPX('path/to/file.gpx', {
  async: true,
  marker_options: {
    startIconUrl: '/markers/start.png',
    endIconUrl: '/markers/finish.png',
  },
})

gpxLayer.on('loaded', (e) => {
  map.fitBounds(e.target.getBounds())
})
```

### 3. Visualização 3D

Integrar com Mapbox GL para visualização 3D:

```tsx
import Map from 'react-map-gl'

<Map
  mapboxAccessToken={token}
  initialViewState={{
    longitude: -42.1111,
    latitude: -21.5644,
    zoom: 14,
    pitch: 60, // Ângulo 3D
  }}
  mapStyle="mapbox://styles/mapbox/outdoors-v12"
/>
```

### 4. Tracking ao Vivo

Durante a prova, mostrar posição dos corredores em tempo real:

```tsx
// WebSocket para receber posições
const socket = useWebSocket('wss://api.corridamacuco.com.br/tracking')

socket.onmessage = (event) => {
  const runners = JSON.parse(event.data)
  setRunnerPositions(runners)
}

// Exibir marcadores dos corredores
{runnerPositions.map(runner => (
  <Marker
    key={runner.id}
    position={[runner.lat, runner.lng]}
    icon={runnerIcon}
  >
    <Popup>{runner.name} - {runner.pace}</Popup>
  </Marker>
))}
```

### 5. Heatmap de Densidade

Mostrar onde há mais concentração de corredores:

```tsx
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3'

<HeatmapLayer
  points={runnerPositions}
  longitudeExtractor={p => p.lng}
  latitudeExtractor={p => p.lat}
  intensityExtractor={p => p.speed}
/>
```

### 6. Street View Integration

Adicionar preview de pontos importantes:

```tsx
import { ReactStreetview } from 'react-streetview'

<ReactStreetview
  apiKey={googleMapsKey}
  streetViewPanoramaOptions={{
    position: { lat: -21.5644, lng: -42.1111 },
    pov: { heading: 100, pitch: 0 },
    zoom: 1,
  }}
/>
```

### 7. Download de Mapas Offline

Permitir download para uso sem internet:

```tsx
import { tileLayer } from 'leaflet-offline'

const offlineLayer = tileLayer.offline(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '© OpenStreetMap',
    minZoom: 13,
    maxZoom: 19,
  }
)

// Baixar tiles
offlineLayer.saveAllTiles(13, 16)
```

### 8. Comparação de Percursos

Exibir múltiplos percursos simultaneamente:

```tsx
<RouteMap 
  routes={['10k', '2k']}
  colors={['#2563eb', '#059669']}
/>
```

### 9. Análise de Tempo Estimado

Calcular tempo estimado baseado no ritmo do atleta:

```tsx
const calculateFinishTime = (pace: number) => {
  const distance = route.path[route.path.length - 1].km
  return (distance * pace) / 60 // minutos
}
```

### 10. Integração com Strava

Permitir compartilhar percurso no Strava:

```tsx
const shareToStrava = () => {
  window.open(
    `https://www.strava.com/routes/new?gpx=${gpxUrl}`,
    '_blank'
  )
}
```

## 🎯 Coordenadas Reais

Atualmente o mapa usa coordenadas simuladas. Para melhor precisão:

1. Coletar GPX do percurso real usando app de corrida
2. Extrair waypoints do arquivo GPX
3. Atualizar constante `ROUTES` com coordenadas reais
4. Adicionar dados de elevação reais

## 🔧 Manutenção

### Atualizar Percurso

Edite o objeto `ROUTES` em `RouteMap.tsx`:

```tsx
const ROUTES = {
  '10k': {
    path: [
      { lat: -21.5644, lng: -42.1111, km: 0 },
      // Adicionar mais pontos...
    ],
    hydration: [
      { lat: -21.5644, lng: -42.1111, label: 'Largada' },
      // Adicionar postos...
    ],
  },
}
```

### Personalizar Ícones

Os ícones são definidos usando `L.divIcon` com HTML/CSS:

```tsx
const customIcon = L.divIcon({
  html: `<div class="bg-blue-600 ...">SVG</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})
```

## 📚 Referências

- [React Leaflet](https://react-leaflet.js.org/)
- [Leaflet Documentation](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [GPX Format Specification](https://www.topografix.com/gpx.asp)







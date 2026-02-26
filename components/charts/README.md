# 📊 Componente de Gráfico de Elevação

Gráfico de altimetria usando Recharts para visualizar perfil de elevação dos percursos.

## ✅ Implementado

Gráfico de área interativo mostrando o perfil de elevação ao longo do percurso.

## 📦 Dependências

```json
{
  "recharts": "^2.x.x"
}
```

Instalado com: `npm install recharts`

## 🎨 Features

### Gráfico de Área
- **Gradiente verde** suavizado
- **Linha verde escura** delineando o perfil
- **Grid pontilhado** para referência
- **Tooltip interativo** mostrando elevação exata
- **Linha de referência** para elevação média
- **Dots nos pontos** de dados
- **Responsivo** - adapta ao container

### Estatísticas Automáticas
- **Ganho Total** - Calculado automaticamente (max - min)
- **Altitude Máxima** - Ponto mais alto
- **Altitude Mínima** - Ponto mais baixo
- **Cards coloridos** com visual moderno

## 📍 Uso

```tsx
import ElevationChart from '@/components/charts/ElevationChart'

const altimetryData = [
  { km: 0, elev: 347 },
  { km: 1, elev: 351.5 },
  { km: 2, elev: 317.8 },
  // ...
]

<ElevationChart data={altimetryData} distanceLabel="km" />
```

### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `data` | `ElevationPoint[]` | - | Array de pontos com km e elevação |
| `distanceLabel` | `string` | `'km'` | Rótulo da unidade de distância |

### Tipo ElevationPoint

```typescript
interface ElevationPoint {
  km: number      // Quilometragem
  elev: number    // Elevação em metros
}
```

## 🎨 Personalização

### Alterar Cores

```tsx
// Gradiente
<linearGradient id="altimetryGradient">
  <stop offset="0%" stopColor="#3b82f6" /> {/* Azul */}
  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
</linearGradient>

// Linha
<Area stroke="#2563eb" />
```

### Adicionar Marcadores

```tsx
import { ReferenceLine, ReferenceArea } from 'recharts'

// Marcar subida íngreme
<ReferenceArea 
  x1={2} 
  x2={5} 
  fill="#ef4444" 
  fillOpacity={0.1}
  label="Subida Íngreme"
/>

// Marcar ponto crítico
<ReferenceLine 
  x={5} 
  stroke="#ef4444" 
  strokeDasharray="3 3"
  label="Pico"
/>
```

### Tipo de Curva

```tsx
// Suave (natural)
<Area type="natural" ... />

// Linear
<Area type="linear" ... />

// Escalonado
<Area type="step" ... />

// Monotônica (padrão)
<Area type="monotone" ... />
```

## 🚀 Evoluções Futuras

### 1. Destacar Trechos Críticos

```tsx
// Marcar subidas íngremes em vermelho
const steepAreas = [
  { start: 2, end: 5, label: 'Subida Íngreme', color: '#ef4444' },
]

{steepAreas.map(area => (
  <ReferenceArea
    key={area.start}
    x1={area.start}
    x2={area.end}
    fill={area.color}
    fillOpacity={0.1}
  />
))}
```

### 2. Comparação com Edições Anteriores

```tsx
<AreaChart data={data}>
  <Area dataKey="elev2025" stroke="#3b82f6" />
  <Area dataKey="elev2024" stroke="#9ca3af" opacity={0.5} />
</AreaChart>
```

### 3. Gradiente de Inclinação

```tsx
// Calcular inclinação entre pontos
const dataWithGradient = data.map((point, i) => {
  if (i === 0) return { ...point, gradient: 0 }
  const prev = data[i - 1]
  const rise = point.elev - prev.elev
  const run = (point.km - prev.km) * 1000 // metros
  return {
    ...point,
    gradient: (rise / run) * 100 // percentual
  }
})

// Colorir baseado em inclinação
<Area 
  dataKey="elev"
  stroke={(entry) => entry.gradient > 5 ? '#ef4444' : '#22c55e'}
/>
```

### 4. Modo Escuro

```tsx
const isDark = useTheme() // ou context

<AreaChart>
  <CartesianGrid stroke={isDark ? '#374151' : '#e5e7eb'} />
  <XAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
</AreaChart>
```

### 5. Animação de Entrada

```tsx
<Area 
  animationDuration={1500}
  animationEasing="ease-out"
/>
```

### 6. Brush para Zoom

```tsx
import { Brush } from 'recharts'

<AreaChart>
  {/* ... */}
  <Brush 
    dataKey="km" 
    height={30} 
    stroke="#22c55e"
  />
</AreaChart>
```

### 7. Tooltip Customizado

```tsx
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  
  const point = payload[0]
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border">
      <p className="font-bold">Km {label}</p>
      <p className="text-green-600">{point.value.toFixed(1)}m</p>
      {/* Adicionar mais info */}
    </div>
  )
}

<AreaChart>
  <Tooltip content={<CustomTooltip />} />
</AreaChart>
```

### 8. Export como Imagem

```tsx
import { toPng } from 'html-to-image'

const exportChart = () => {
  const node = document.getElementById('elevation-chart')
  toPng(node).then(dataUrl => {
    const link = document.createElement('a')
    link.download = 'altimetria.png'
    link.href = dataUrl
    link.click()
  })
}
```

### 9. Dados de Inclinação

```tsx
// Mostrar % de inclinação em cada trecho
const withGradient = data.map((p, i) => ({
  ...p,
  gradient: i > 0 
    ? ((p.elev - data[i-1].elev) / ((p.km - data[i-1].km) * 1000) * 100)
    : 0
}))

<ComposedChart data={withGradient}>
  <Area dataKey="elev" />
  <Line dataKey="gradient" stroke="#f59e0b" />
</ComposedChart>
```

### 10. Indicador de Dificuldade

```tsx
const getDifficulty = (gradient: number) => {
  if (gradient > 10) return { color: 'red', label: 'Muito Difícil' }
  if (gradient > 5) return { color: 'orange', label: 'Difícil' }
  if (gradient > 2) return { color: 'yellow', label: 'Moderado' }
  return { color: 'green', label: 'Fácil' }
}
```

## 📊 Dados Reais Usados

### Percurso 10K
- **Fonte:** GPX oficial (`macucorun.gpx`)
- **Pontos:** 11 marcadores de km
- **Elevação:** 265.5m - 357.8m
- **Ganho:** +92.3m

### Percursos 2K e Kids
- **Fonte:** Dados simulados (até coletar GPX real)
- **Perfil:** Mais plano que 10K
- **Placeholder:** Mostra gráfico funcional

## 🎯 Dados Necessários

Para adicionar altimetria real aos percursos 2K e Kids:

1. Coletar GPX com app de corrida
2. Processar com script (ver `components/map/COORDS_HELPER.md`)
3. Adicionar ao objeto `percursos`

## 🔧 Manutenção

### Atualizar Dados

```tsx
// Em app/(public)/percursos/fallback.tsx
const percursos = {
  '10k': {
    altimetry: [
      { km: 0, elev: 347 },
      { km: 1, elev: 351.5 },
      // Atualizar valores...
    ],
  },
}
```

### Trocar Tipo de Gráfico

```tsx
// De AreaChart para LineChart
import { LineChart, Line } from 'recharts'

<LineChart data={data}>
  <Line type="monotone" dataKey="elev" stroke="#22c55e" />
</LineChart>
```

## 📱 Performance

- **Bundle Size:** ~50KB (Recharts é otimizado)
- **Render:** Client-side apenas (`'use client'`)
- **Responsivo:** Usa `ResponsiveContainer`
- **Lazy Load:** Carrega apenas quando visível

## 🎊 Resultado

- ✅ Gráfico profissional de altimetria
- ✅ Dados reais do percurso 10K
- ✅ Estatísticas calculadas automaticamente
- ✅ Tooltip interativo
- ✅ Visual moderno e limpo
- ✅ Responsivo para mobile

---

**Desenvolvido com** 📊 **para a Corrida de Macuco**







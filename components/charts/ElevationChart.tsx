'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export interface ElevationPoint {
  km: number
  elev: number
}

interface ElevationChartProps {
  data: ElevationPoint[]
  distanceLabel?: string
}

export default function ElevationChart({ data, distanceLabel = 'km' }: ElevationChartProps) {
  if (!data?.length) {
    return (
      <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-semibold mb-2">Nenhum dado de altimetria disponível</p>
          <p className="text-sm text-gray-500">Em breve para este percurso</p>
        </div>
      </div>
    )
  }

  // Calcular elevação min/max
  const elevations = data.map(p => p.elev)
  const minElev = Math.min(...elevations)
  const maxElev = Math.max(...elevations)
  const avgElev = elevations.reduce((a, b) => a + b, 0) / elevations.length

  return (
    <div>
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="altimetryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="km" 
              tickFormatter={(value) => `${value} ${distanceLabel}`}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              tickFormatter={(value) => `${value} m`}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              domain={[Math.floor(minElev - 10), Math.ceil(maxElev + 10)]}
            />
            <Tooltip
              formatter={(value: number) => [`${value.toFixed(1)} m`, 'Elevação']}
              labelFormatter={(label) => `Km ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            />
            {/* Linha de referência para elevação média */}
            <ReferenceLine 
              y={avgElev} 
              stroke="#9ca3af" 
              strokeDasharray="5 5" 
              label={{ value: 'Média', position: 'right', fill: '#6b7280', fontSize: 12 }}
            />
            <Area
              type="monotone"
              dataKey="elev"
              stroke="#16a34a"
              fill="url(#altimetryGradient)"
              strokeWidth={3}
              dot={{ stroke: '#16a34a', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6, stroke: '#16a34a', strokeWidth: 2, fill: '#22c55e' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Estatísticas de Elevação */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">+{(maxElev - minElev).toFixed(0)}m</p>
          <p className="text-sm text-gray-600">Ganho Total</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{maxElev.toFixed(0)}m</p>
          <p className="text-sm text-gray-600">Altitude Máxima</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{minElev.toFixed(0)}m</p>
          <p className="text-sm text-gray-600">Altitude Mínima</p>
        </div>
      </div>
    </div>
  )
}







# 📍 Guia para Coletar Coordenadas Reais do Percurso

## 🎯 Objetivo

Substituir as coordenadas simuladas por dados reais do percurso da Corrida de Macuco.

## 🛠️ Métodos para Coletar Coordenadas

### Método 1: Usando Google Maps

1. Acesse [Google Maps](https://maps.google.com)
2. Pesquise por "Praça da Matriz, Macuco - RJ"
3. Clique com botão direito no mapa → "O que há aqui?"
4. As coordenadas aparecerão na parte inferior
5. Repita para cada ponto importante do percurso

**Formato do Google Maps:** `-21.5644, -42.1111`

### Método 2: Usando App de Corrida (Recomendado)

**Strava:**
1. Baixe o app Strava
2. Grave o percurso correndo/caminhando/de carro
3. Acesse a atividade no site: strava.com
4. Clique em ⋯ → "Exportar GPX"
5. Use o script Python abaixo para extrair coordenadas

**Nike Run Club / Garmin:**
- Similar ao Strava, exportar como GPX ou TCX

### Método 3: Usando OpenStreetMap

1. Acesse [OpenStreetMap](https://www.openstreetmap.org)
2. Pesquise "Macuco, Rio de Janeiro"
3. Clique com botão direito → "Mostrar endereço"
4. Coordenadas aparecem na URL

## 🐍 Script Python para Extrair Coordenadas de GPX

```python
import gpxpy
import json

def extract_coords_from_gpx(gpx_file):
    """
    Extrai coordenadas e quilometragem de arquivo GPX
    """
    with open(gpx_file, 'r') as f:
        gpx = gpxpy.parse(f)
    
    coords = []
    distance = 0
    prev_point = None
    
    for track in gpx.tracks:
        for segment in track.segments:
            for point in segment.points:
                if prev_point:
                    distance += gpxpy.geo.haversine_distance(
                        prev_point.latitude,
                        prev_point.longitude,
                        point.latitude,
                        point.longitude
                    ) / 1000  # Converter para km
                
                # Adicionar ponto a cada ~1km
                if not coords or distance >= len(coords):
                    coords.append({
                        'lat': round(point.latitude, 6),
                        'lng': round(point.longitude, 6),
                        'km': round(distance, 1),
                        'elevation': round(point.elevation, 1) if point.elevation else None
                    })
                
                prev_point = point
    
    return coords

# Uso
coords = extract_coords_from_gpx('percurso_10k.gpx')

# Formato para RouteMap.tsx
print('path: [')
for coord in coords:
    print(f"  {{ lat: {coord['lat']}, lng: {coord['lng']}, km: {coord['km']} }},")
print('],')
```

### Instalar dependências:
```bash
pip install gpxpy
```

## 📱 Apps Recomendados para Gravar Percurso

### Gratuitos:
- **Strava** (melhor para exportar GPX)
- **MapMyRun**
- **Nike Run Club**
- **Runkeeper**

### Profissionais:
- **Garmin Connect**
- **Polar Flow**
- **Suunto App**

## 🗺️ Exemplo de Estrutura de Dados

```typescript
const ROUTE_10K = {
  path: [
    { lat: -21.564400, lng: -42.111100, km: 0 },    // Largada - Praça da Matriz
    { lat: -21.562000, lng: -42.110000, km: 1 },    // Centro histórico
    { lat: -21.559000, lng: -42.108000, km: 2 },    // Rua Principal
    { lat: -21.555000, lng: -42.105000, km: 3 },    // Início subida
    { lat: -21.551000, lng: -42.102000, km: 4 },    // Subida média
    { lat: -21.547000, lng: -42.099000, km: 5 },    // Pico - Zona rural
    { lat: -21.545000, lng: -42.101000, km: 6 },    // Platô rural
    { lat: -21.548000, lng: -42.105000, km: 7 },    // Início descida
    { lat: -21.552000, lng: -42.108000, km: 8 },    // Descida
    { lat: -21.557000, lng: -42.110000, km: 9 },    // Aproximação
    { lat: -21.564400, lng: -42.111100, km: 10 },   // Chegada
  ],
  hydration: [
    { lat: -21.564400, lng: -42.111100, label: 'Largada' },
    { lat: -21.557000, lng: -42.109000, label: 'Km 2.5' },
    { lat: -21.547000, lng: -42.099000, label: 'Km 5' },
    { lat: -21.550000, lng: -42.107000, label: 'Km 7.5' },
    { lat: -21.564400, lng: -42.111100, label: 'Chegada' },
  ],
  medical: [
    { lat: -21.559000, lng: -42.108000 }, // Km 2
    { lat: -21.547000, lng: -42.099000 }, // Km 5
    { lat: -21.552000, lng: -42.108000 }, // Km 8
  ],
}
```

## 🎯 Checklist de Atualização

- [ ] Gravar percurso real com app de corrida
- [ ] Exportar arquivo GPX
- [ ] Extrair coordenadas usando script Python
- [ ] Identificar pontos de hidratação reais
- [ ] Marcar posições dos postos médicos
- [ ] Atualizar `ROUTES` em `RouteMap.tsx`
- [ ] Testar no navegador
- [ ] Verificar zoom e centralização
- [ ] Validar marcadores de km
- [ ] Confirmar posições de largada/chegada

## 🔍 Validação

Após atualizar as coordenadas:

1. **Distância Total:** Use Google Maps para medir o percurso
2. **Elevação:** Compare com perfis de apps de corrida
3. **Pontos de Interesse:** Confirme com organizadores da prova
4. **Testes:** Percorra o mapa verificando se os pontos fazem sentido

## 📞 Contato com Organizadores

Para obter dados oficiais:
- Solicitar arquivo GPX oficial do percurso
- Confirmar localização exata dos postos
- Validar pontos de atenção (lombadas, curvas)
- Obter permissão para uso de dados

## 🌐 Recursos Online

- [GPS Visualizer](https://www.gpsvisualizer.com/) - Converter formatos de GPS
- [GPX Studio](https://gpx.studio/) - Editor de percursos online
- [RouteConverter](https://www.routeconverter.com/) - Conversor de rotas
- [Ride with GPS](https://ridewithgps.com/) - Planejador de rotas

## 💡 Dicas

1. **Gravar em dia claro** para melhor sinal GPS
2. **Usar modo caminhada** se for a pé (mais preciso)
3. **Marcar waypoints** nos pontos importantes
4. **Conferir elevação** com dados oficiais
5. **Testar com diferentes zoom levels** no mapa
6. **Considerar variações do percurso** entre edições

## 🚀 Após Atualização

Com coordenadas reais, você pode:
- Calcular distância exata
- Gerar perfil de altimetria preciso
- Criar visualização 3D do terreno
- Integrar com apps de corrida
- Oferecer download de GPX real
- Mostrar tempo estimado por ritmo







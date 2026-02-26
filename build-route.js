const fs = require('fs');
const path = require('path');
const xml = fs.readFileSync(path.join(__dirname, 'public/routes/10k-oficial.gpx'), 'utf8');
const regex = /<trkpt lat="([0-9\-.]+)" lon="([0-9\-.]+)">([\s\S]*?)<\/trkpt>/g;
const points = [];
let match;
while ((match = regex.exec(xml)) !== null) {
  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[2]);
  const eleMatch = match[3].match(/<ele>([0-9\-.]+)<\/ele>/);
  const ele = eleMatch ? parseFloat(eleMatch[1]) : null;
  points.push({ lat, lon, ele });
}
if (!points.length) {
  console.error('No points parsed');
  process.exit(1);
}
function haversine(p1, p2) {
  const R = 6371e3;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(p2.lat - p1.lat);
  const dLon = toRad(p2.lon - p1.lon);
  const lat1 = toRad(p1.lat);
  const lat2 = toRad(p2.lat);
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
let distance = 0;
const cumulative = points.map((pt, idx) => {
  if (idx === 0) return { ...pt, dist: 0 };
  distance += haversine(points[idx-1], pt);
  return { ...pt, dist: distance };
});
const totalKm = distance / 1000;
function interpolate(target) {
  if (target <= 0) return cumulative[0];
  for (let i = 1; i < cumulative.length; i++) {
    if (cumulative[i].dist >= target) {
      const prev = cumulative[i-1];
      const curr = cumulative[i];
      const ratio = (target - prev.dist) / (curr.dist - prev.dist);
      const lat = prev.lat + (curr.lat - prev.lat) * ratio;
      const lon = prev.lon + (curr.lon - prev.lon) * ratio;
      const ele = (prev.ele ?? curr.ele ?? 0) + ((curr.ele ?? prev.ele ?? 0) - (prev.ele ?? curr.ele ?? 0)) * ratio;
      return { lat, lon, ele, dist: target };
    }
  }
  return cumulative[cumulative.length - 1];
}
const kmMarkers = [];
for (let km = 0; km <= Math.floor(totalKm); km++) {
  const point = interpolate(km * 1000);
  if (!point) continue;
  kmMarkers.push({ km, lat: parseFloat(point.lat.toFixed(6)), lng: parseFloat(point.lon.toFixed(6)), elev: point.ele ? parseFloat(point.ele.toFixed(1)) : null });
}
const finishPoint = cumulative[cumulative.length - 1];
kmMarkers.push({ km: parseFloat(totalKm.toFixed(2)), lat: parseFloat(finishPoint.lat.toFixed(6)), lng: parseFloat(finishPoint.lon.toFixed(6)), elev: finishPoint.ele ? parseFloat(finishPoint.ele.toFixed(1)) : null });
const step = Math.max(1, Math.floor(points.length / 120));
const fullPath = cumulative.filter((_, idx) => idx % step === 0).map(pt => [parseFloat(pt.lat.toFixed(6)), parseFloat(pt.lon.toFixed(6))]);
if (fullPath[fullPath.length - 1][0] !== parseFloat(finishPoint.lat.toFixed(6))) {
  fullPath.push([parseFloat(finishPoint.lat.toFixed(6)), parseFloat(finishPoint.lon.toFixed(6))]);
}
const altimetry = [];
const increment = 500;
for (let dist = 0; dist <= distance; dist += increment) {
  const point = interpolate(dist);
  altimetry.push({ km: parseFloat((point.dist / 1000).toFixed(2)), elev: point.ele ? parseFloat(point.ele.toFixed(1)) : null });
}
if (altimetry[altimetry.length - 1].km !== parseFloat((distance / 1000).toFixed(2))) {
  altimetry.push({ km: parseFloat((distance / 1000).toFixed(2)), elev: finishPoint.ele ? parseFloat(finishPoint.ele.toFixed(1)) : null });
}
const hydrationKm = [0, 2.5, 5, 7.5, parseFloat(totalKm.toFixed(2))];
const hydration = hydrationKm
  .map(km => {
    const point = interpolate(km * 1000);
    if (!point) return null;
    const label = km === 0 ? 'Largada' : km === parseFloat(totalKm.toFixed(2)) ? 'Chegada' : `Km ${km}`;
    return { lat: parseFloat(point.lat.toFixed(6)), lng: parseFloat(point.lon.toFixed(6)), label };
  })
  .filter(Boolean);
const medicalKm = [2, 5, 8];
const medical = medicalKm
  .map(km => {
    const point = interpolate(km * 1000);
    if (!point) return null;
    return { lat: parseFloat(point.lat.toFixed(6)), lng: parseFloat(point.lon.toFixed(6)) };
  })
  .filter(Boolean);
let minElevation = Infinity;
let maxElevation = -Infinity;
let elevationGain = 0;
for (let i = 0; i < cumulative.length; i++) {
  const ele = cumulative[i].ele;
  if (ele == null) continue;
  if (ele < minElevation) minElevation = ele;
  if (ele > maxElevation) maxElevation = ele;
if (i > 0 && cumulative[i-1].ele != null) {
    const diff = ele - cumulative[i-1].ele;
    if (diff > 0) elevationGain += diff;
  }
}
const routeData = {
  totalKm,
  kmMarkers,
  fullPath,
  altimetry,
  hydration,
  medical,
  stats: {
    distance: parseFloat(totalKm.toFixed(2)),
    minElevation: parseFloat(minElevation.toFixed(1)),
    maxElevation: parseFloat(maxElevation.toFixed(1)),
    elevationGain: parseFloat(elevationGain.toFixed(1)),
  },
};
fs.writeFileSync(path.join(__dirname, 'route-data.json'), JSON.stringify(routeData, null, 2));
console.log('route-data.json generated');

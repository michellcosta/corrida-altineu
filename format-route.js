const data = require('./route-data.json');
const fs = require('fs');
const path = require('path');
const gpx = fs.readFileSync(path.join(__dirname, 'public/routes/10k-oficial.gpx'), 'utf8');
const regex = /<trkpt lat="([0-9\-.]+)" lon="([0-9\-.]+)">([\s\S]*?)<\/trkpt>/g;
const points = [];
let match;
while ((match = regex.exec(gpx)) !== null) {
  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[2]);
  const eleMatch = match[3].match(/<ele>([0-9\-.]+)<\/ele>/);
  const ele = eleMatch ? parseFloat(eleMatch[1]) : null;
  points.push({ lat, lon, ele });
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
let dist = 0;
const cumulative = points.map((pt, idx) => {
  if (idx === 0) return { ...pt, dist: 0 };
  dist += haversine(points[idx-1], pt);
  return { ...pt, dist };
});
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
const hydrationKm = [0, 2.5, 5, 7.5, parseFloat(data.totalKm.toFixed(2))];
const hydrationPoints = hydrationKm.map(km => {
  const point = interpolate(km * 1000);
  return { km: km, lat: parseFloat(point.lat.toFixed(6)), lng: parseFloat(point.lon.toFixed(6)) };
});
console.log('Hydration suggestions:');
console.log(hydrationPoints);
const medicalKm = [2, 5, 8];
const medicalPoints = medicalKm.map(km => {
  const point = interpolate(km * 1000);
  return { km, lat: parseFloat(point.lat.toFixed(6)), lng: parseFloat(point.lon.toFixed(6)) };
});
console.log('Medical suggestions:');
console.log(medicalPoints);
const markers = data.kmMarkers.map(m => `  { lat: ${m.lat}, lng: ${m.lng}, km: ${m.km} },`).join('\n');
const fullPath = data.fullPath.map(p => `      [${p[0]}, ${p[1]}],`).join('\n');
const altimetry = data.altimetry.map(a => `        { km: ${a.km}, elev: ${a.elev ?? 'null'} },`).join('\n');
console.log('\nPATH');
console.log(markers);
console.log('\nFULL PATH');
console.log(fullPath);
console.log('\nALTIMETRY');
console.log(altimetry);

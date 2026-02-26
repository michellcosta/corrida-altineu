const fs = require('fs');
const path = require('path');
const xml = fs.readFileSync(path.join(__dirname, 'public/routes/10k-oficial.gpx'), 'utf8');
const regex = /<trkpt lat="([0-9\-.]+)" lon="([0-9\-.]+)">([\s\S]*?)<\/trkpt>/g;
const elevations = [];
let match;
while ((match = regex.exec(xml)) !== null) {
  const eleMatch = match[3].match(/<ele>([0-9\-.]+)<\/ele>/);
  if (eleMatch) elevations.push(parseFloat(eleMatch[1]));
}
const min = Math.min(...elevations);
const max = Math.max(...elevations);
let gain = 0;
for (let i = 1; i < elevations.length; i++) {
  const diff = elevations[i] - elevations[i-1];
  if (diff > 0) gain += diff;
}
console.log(JSON.stringify({ minElevation: parseFloat(min.toFixed(1)), maxElevation: parseFloat(max.toFixed(1)), elevationGain: parseFloat(gain.toFixed(1)) }));

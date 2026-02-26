const fs = require('fs');
const xml = fs.readFileSync('public/routes/10k-oficial.gpx', 'utf8');
const regex = /<trkpt lat="([0-9\-.]+)" lon="([0-9\-.]+)">/g;
console.log(regex.test(xml));

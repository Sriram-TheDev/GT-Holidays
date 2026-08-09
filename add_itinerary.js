import fs from 'fs';
const text = fs.readFileSync('src/data/packages.js', 'utf8');
const dummyStr = `    itinerary: [
      {
        day: 1,
        title: 'Arrival & Welcome',
        description: 'Arrive at your destination and transfer to the hotel. Evening at leisure.',
        places: [
          { name: 'Airport / Station', location: { lat: 28.5562, lng: 77.1000 } },
          { name: 'Hotel', location: { lat: 28.6139, lng: 77.2090 } }
        ]
      },
      {
        day: 2,
        title: 'City Exploration',
        description: 'Full day city tour covering major landmarks and local markets.',
        places: [
          { name: 'City Center', location: { lat: 28.6139, lng: 77.2090 } }
        ]
      },
      {
        day: 3,
        title: 'Departure',
        description: 'Morning free for shopping. Transfer to airport for onward journey.',
        places: [
          { name: 'Airport / Station', location: { lat: 28.5562, lng: 77.1000 } }
        ]
      }
    ]`;
// Add itinerary to any package that doesn't have it.
let replaced = 0;
const newText = text.replace(/featured:\s*(true|false),(\s*})/g, (match, p1, p2) => {
    replaced++;
    return 'featured: ' + p1 + ',\n' + dummyStr + p2;
});
fs.writeFileSync('src/data/packages.js', newText);
console.log('Replaced ' + replaced + ' instances.');

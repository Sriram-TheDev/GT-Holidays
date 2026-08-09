import https from 'https';

const apiKey = "AIzaSyDk22Zvho_CyNaSw4hG2M6-kUYgNDcjVKY";
const origin = "10.1518,76.3930"; // Cochin Airport
const destination = "10.1518,76.3930"; // Cochin Airport
const waypoints = [
  "9.9658,76.2421", // Fort Kochi
  "10.0889,77.0595", // Munnar
  "10.1066,77.1235", // Mattupetty Dam
  "9.6062,77.1643", // Thekkady
  "9.4679,77.1396", // Periyar National Park
  "9.4981,76.3388" // Alleppey
].join('|');

const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypoints}&key=${apiKey}`;

https.get(url, (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    const json = JSON.parse(data);
    console.log("Status:", json.status);
    if (json.error_message) console.log("Error:", json.error_message);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});

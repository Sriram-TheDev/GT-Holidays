// src/data/packages.js
// ─────────────────────────────────────────────────────────────────
// Static package definitions for the Discover page.
// ─────────────────────────────────────────────────────────────────

export const PACKAGES = [
  {
    "id": "kerala-backwaters",
    "title": "Kerala Backwaters",
    "subtitle": "Houseboat serenity across emerald lagoons",
    "location": "Alleppey, Kerala",
    "region": "South",
    "type": "Nature",
    "duration": "5 Days / 4 Nights",
    "basePriceAdult": 18999,
    "tags": [
      "Nature",
      "Relaxation",
      "Scenic"
    ],
    "glow": "#00FFA3",
    "glowRgb": "0,255,163",
    "badge": "BEST SELLER",
    "rating": 4.9,
    "reviewCount": 2847,
    "img": "/packages/kerala.png",
    "highlights": [
      "Houseboat Stay",
      "Ayurvedic Spa",
      "Kathakali Show",
      "Village Walk"
    ],
    "maxGroupSize": 12,
    "featured": true,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival in Cochin",
        "description": "Arrive in Cochin and transfer to your hotel. Evening walk by the Chinese Fishing Nets.",
        "places": [
          {
            "name": "Cochin Airport",
            "location": {
              "lat": 10.1518,
              "lng": 76.393
            }
          },
          {
            "name": "Fort Kochi",
            "location": {
              "lat": 9.9658,
              "lng": 76.2421
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Munnar Tea Gardens",
        "description": "Drive to Munnar. Visit the sprawling tea estates and the Mattupetty Dam.",
        "places": [
          {
            "name": "Munnar",
            "location": {
              "lat": 10.0889,
              "lng": 77.0595
            }
          },
          {
            "name": "Mattupetty Dam",
            "location": {
              "lat": 10.1066,
              "lng": 77.1235
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Thekkady Spice Route",
        "description": "Head to Thekkady. Enjoy a guided spice plantation tour and an elephant ride.",
        "places": [
          {
            "name": "Thekkady",
            "location": {
              "lat": 9.6062,
              "lng": 77.1643
            }
          },
          {
            "name": "Periyar National Park",
            "location": {
              "lat": 9.4679,
              "lng": 77.1396
            }
          }
        ]
      },
      {
        "day": 4,
        "title": "Alleppey Houseboat",
        "description": "Navigate the serene backwaters of Alleppey on a premium traditional houseboat.",
        "places": [
          {
            "name": "Alleppey",
            "location": {
              "lat": 9.4981,
              "lng": 76.3388
            }
          }
        ]
      },
      {
        "day": 5,
        "title": "Departure",
        "description": "Morning Ayurvedic spa session, then transfer back to Cochin for departure.",
        "places": [
          {
            "name": "Cochin Airport",
            "location": {
              "lat": 10.1518,
              "lng": 76.393
            }
          }
        ]
      }
    ]
  },
  {
    "id": "himachal-peaks",
    "title": "Himachal Peaks",
    "subtitle": "Snow trails & alpine adventure in the Himalayas",
    "location": "Manali & Spiti, HP",
    "region": "North",
    "type": "Adventure",
    "duration": "7 Days / 6 Nights",
    "basePriceAdult": 24999,
    "tags": [
      "Adventure",
      "Mountains",
      "Trekking"
    ],
    "glow": "#3D9BFF",
    "glowRgb": "61,155,255",
    "badge": "TRENDING",
    "rating": 4.8,
    "reviewCount": 1923,
    "img": "/packages/himachal.png",
    "highlights": [
      "Rohtang Pass",
      "Snow Trek",
      "Camping",
      "Spiti Valley"
    ],
    "maxGroupSize": 8,
    "featured": true,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival in Manali",
        "description": "Arrive in Manali and acclimatize. Evening walk at Mall Road.",
        "places": [
          {
            "name": "Manali",
            "location": {
              "lat": 32.2396,
              "lng": 77.1887
            }
          },
          {
            "name": "Mall Road",
            "location": {
              "lat": 32.2424,
              "lng": 77.1895
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Rohtang Pass & Solang Valley",
        "description": "Thrilling snow adventures at Rohtang Pass and paragliding in Solang Valley.",
        "places": [
          {
            "name": "Rohtang Pass",
            "location": {
              "lat": 32.3716,
              "lng": 77.2466
            }
          },
          {
            "name": "Solang Valley",
            "location": {
              "lat": 32.3168,
              "lng": 77.1575
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Spiti Valley Expedition",
        "description": "Drive across high-altitude deserts to reach the mesmerizing Spiti Valley.",
        "places": [
          {
            "name": "Kunzum Pass",
            "location": {
              "lat": 32.3995,
              "lng": 77.6256
            }
          },
          {
            "name": "Kaza",
            "location": {
              "lat": 32.223,
              "lng": 78.07
            }
          }
        ]
      },
      {
        "day": 4,
        "title": "Monasteries & Stargazing",
        "description": "Visit ancient Key Monastery and experience a night of crystal clear stargazing.",
        "places": [
          {
            "name": "Key Monastery",
            "location": {
              "lat": 32.2982,
              "lng": 78.0121
            }
          },
          {
            "name": "Kibber Village",
            "location": {
              "lat": 32.3331,
              "lng": 78.0069
            }
          }
        ]
      },
      {
        "day": 5,
        "title": "Chandratal Lake",
        "description": "Camp under the stars near the crescent shaped Chandratal Lake.",
        "places": [
          {
            "name": "Chandratal",
            "location": {
              "lat": 32.4824,
              "lng": 77.6157
            }
          }
        ]
      },
      {
        "day": 6,
        "title": "Return to Manali",
        "description": "Drive back to Manali tracing the wild Himalayan rivers.",
        "places": [
          {
            "name": "Manali",
            "location": {
              "lat": 32.2396,
              "lng": 77.1887
            }
          }
        ]
      },
      {
        "day": 7,
        "title": "Departure",
        "description": "Morning checkout and transfer for your onward journey.",
        "places": [
          {
            "name": "Bhuntar Airport",
            "location": {
              "lat": 31.8763,
              "lng": 77.1557
            }
          }
        ]
      }
    ]
  },
  {
    "id": "goa-coast",
    "title": "Goa Coastal Bliss",
    "subtitle": "Sun, surf & spice on the Konkan coast",
    "location": "North & South Goa",
    "region": "West",
    "type": "Party",
    "duration": "4 Days / 3 Nights",
    "basePriceAdult": 13999,
    "tags": [
      "Beach",
      "Nightlife",
      "Party"
    ],
    "glow": "#FF7A30",
    "glowRgb": "255,122,48",
    "badge": "HOT DEAL",
    "rating": 4.7,
    "reviewCount": 3412,
    "img": "/packages/goa.png",
    "highlights": [
      "Beach Shacks",
      "Water Sports",
      "Dudhsagar Falls",
      "Anjuna Market"
    ],
    "maxGroupSize": 20,
    "featured": true,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival in North Goa",
        "description": "Arrive at Dabolim Airport and check in to your beachfront resort. Evening at Baga Beach.",
        "places": [
          {
            "name": "Dabolim Airport",
            "location": {
              "lat": 15.3803,
              "lng": 73.8349
            }
          },
          {
            "name": "Baga Beach",
            "location": {
              "lat": 15.5528,
              "lng": 73.7516
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Heritage & Sunsets",
        "description": "Explore the churches of Old Goa and watch the sunset from Aguada Fort.",
        "places": [
          {
            "name": "Basilica of Bom Jesus",
            "location": {
              "lat": 15.5009,
              "lng": 73.9116
            }
          },
          {
            "name": "Aguada Fort",
            "location": {
              "lat": 15.4989,
              "lng": 73.7656
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Dudhsagar Excursion",
        "description": "Take a thrilling jeep safari to the majestic Dudhsagar Waterfalls.",
        "places": [
          {
            "name": "Dudhsagar Falls",
            "location": {
              "lat": 15.3144,
              "lng": 74.3143
            }
          }
        ]
      },
      {
        "day": 4,
        "title": "Leisure & Departure",
        "description": "Relax by the beach before transferring to the airport.",
        "places": [
          {
            "name": "Dabolim Airport",
            "location": {
              "lat": 15.3803,
              "lng": 73.8349
            }
          }
        ]
      }
    ]
  },
  {
    "id": "rajasthan-royal",
    "title": "Rajasthan Royale",
    "subtitle": "Desert forts, palace stays & camel safaris",
    "location": "Jaipur, Jodhpur & Jaisalmer",
    "region": "West",
    "type": "Heritage",
    "duration": "8 Days / 7 Nights",
    "basePriceAdult": 32999,
    "tags": [
      "Heritage",
      "Culture",
      "Luxury"
    ],
    "glow": "#B069FF",
    "glowRgb": "176,105,255",
    "badge": "PREMIUM",
    "rating": 4.9,
    "reviewCount": 1654,
    "img": "/packages/rajasthan.png",
    "highlights": [
      "Amber Fort",
      "Palace Hotel",
      "Camel Safari",
      "Desert Camp"
    ],
    "maxGroupSize": 10,
    "featured": true,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival in Jaipur",
        "description": "Welcome to the Pink City. Transfer to your royal heritage hotel.",
        "places": [
          {
            "name": "Jaipur Airport",
            "location": {
              "lat": 26.8288,
              "lng": 75.8055
            }
          },
          {
            "name": "Hawa Mahal",
            "location": {
              "lat": 26.9239,
              "lng": 75.8267
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Jaipur Pink City Tour",
        "description": "Ride to the majestic Amer Fort and explore the local Johari Bazaar.",
        "places": [
          {
            "name": "Amer Fort",
            "location": {
              "lat": 26.9855,
              "lng": 75.8513
            }
          },
          {
            "name": "Jal Mahal",
            "location": {
              "lat": 26.9535,
              "lng": 75.8466
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Jodhpur - The Blue City",
        "description": "Drive to Jodhpur and witness the sprawling view from Mehrangarh Fort.",
        "places": [
          {
            "name": "Jodhpur",
            "location": {
              "lat": 26.2389,
              "lng": 73.0243
            }
          },
          {
            "name": "Mehrangarh Fort",
            "location": {
              "lat": 26.2978,
              "lng": 73.0185
            }
          }
        ]
      },
      {
        "day": 4,
        "title": "Journey to Jaisalmer",
        "description": "Travel deeper into the desert to the Golden City of Jaisalmer.",
        "places": [
          {
            "name": "Jaisalmer Fort",
            "location": {
              "lat": 26.9124,
              "lng": 70.9126
            }
          }
        ]
      },
      {
        "day": 5,
        "title": "Thar Desert Safari",
        "description": "Experience a sunset camel ride and a cultural evening at the Sand Dunes.",
        "places": [
          {
            "name": "Sam Sand Dunes",
            "location": {
              "lat": 26.8256,
              "lng": 70.5222
            }
          }
        ]
      },
      {
        "day": 6,
        "title": "Return to Jodhpur",
        "description": "Travel back to Jodhpur and relax at Umaid Bhawan Palace.",
        "places": [
          {
            "name": "Umaid Bhawan",
            "location": {
              "lat": 26.2801,
              "lng": 73.047
            }
          }
        ]
      },
      {
        "day": 7,
        "title": "Pushkar Pilgrimage",
        "description": "Stop by the holy city of Pushkar for blessings by the serene lake.",
        "places": [
          {
            "name": "Pushkar Lake",
            "location": {
              "lat": 26.4886,
              "lng": 74.5518
            }
          }
        ]
      },
      {
        "day": 8,
        "title": "Departure from Jaipur",
        "description": "Drive back to Jaipur for your concluding flight.",
        "places": [
          {
            "name": "Jaipur Airport",
            "location": {
              "lat": 26.8288,
              "lng": 75.8055
            }
          }
        ]
      }
    ]
  },
  {
    "id": "andaman-escape",
    "title": "Andaman Escape",
    "subtitle": "Pristine reefs & untouched island paradise",
    "location": "Port Blair & Havelock",
    "region": "Islands",
    "type": "Nature",
    "duration": "6 Days / 5 Nights",
    "basePriceAdult": 28499,
    "tags": [
      "Island",
      "Diving",
      "Adventure"
    ],
    "glow": "#00FFA3",
    "glowRgb": "0,255,163",
    "badge": "EXCLUSIVE",
    "rating": 4.8,
    "reviewCount": 987,
    "img": "/packages/andaman.png",
    "highlights": [
      "Scuba Diving",
      "Radhanagar Beach",
      "Cellular Jail",
      "Glass Bottom Boat"
    ],
    "maxGroupSize": 6,
    "featured": false,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival in Port Blair",
        "description": "Arrive in Port Blair, visit the historic Cellular Jail and watch the evening light show.",
        "places": [
          {
            "name": "Port Blair",
            "location": {
              "lat": 11.6234,
              "lng": 92.7265
            }
          },
          {
            "name": "Cellular Jail",
            "location": {
              "lat": 11.6738,
              "lng": 92.748
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Ferry to Havelock Island",
        "description": "Cruise to Havelock Island and relax on the white sands of Radhanagar Beach.",
        "places": [
          {
            "name": "Havelock Island",
            "location": {
              "lat": 11.9761,
              "lng": 92.9876
            }
          },
          {
            "name": "Radhanagar Beach",
            "location": {
              "lat": 11.9832,
              "lng": 92.9506
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Elephant Beach Snorkeling",
        "description": "Explore the vibrant coral reefs off Elephant Beach via glass-bottom boat or snorkeling.",
        "places": [
          {
            "name": "Elephant Beach",
            "location": {
              "lat": 12.0084,
              "lng": 92.9461
            }
          }
        ]
      },
      {
        "day": 4,
        "title": "Neil Island",
        "description": "Ferry to Neil Island to see the spectacular natural rock formations and Bharatpur Beach.",
        "places": [
          {
            "name": "Neil Island",
            "location": {
              "lat": 11.8347,
              "lng": 93.0422
            }
          },
          {
            "name": "Bharatpur Beach",
            "location": {
              "lat": 11.8415,
              "lng": 93.0298
            }
          }
        ]
      },
      {
        "day": 5,
        "title": "Return to Port Blair",
        "description": "Take the cruise back to Port Blair. After settling in, enjoy some local shopping.",
        "places": [
          {
            "name": "Port Blair",
            "location": {
              "lat": 11.6234,
              "lng": 92.7265
            }
          }
        ]
      },
      {
        "day": 6,
        "title": "Departure",
        "description": "Transfer to Port Blair airport carrying island memories.",
        "places": [
          {
            "name": "Veer Savarkar Airport",
            "location": {
              "lat": 11.6441,
              "lng": 92.7265
            }
          }
        ]
      }
    ]
  },
  {
    "id": "varanasi-spiritual",
    "title": "Varanasi Spiritual",
    "subtitle": "Ancient ghats, river aarti & soul-deep India",
    "location": "Varanasi, UP",
    "region": "North",
    "type": "Culture",
    "duration": "3 Days / 2 Nights",
    "basePriceAdult": 9999,
    "tags": [
      "Spiritual",
      "Culture",
      "Heritage"
    ],
    "glow": "#FFD166",
    "glowRgb": "255,209,102",
    "badge": "CULTURAL",
    "rating": 4.6,
    "reviewCount": 1289,
    "img": "/packages/varanasi.png",
    "highlights": [
      "Ganga Aarti",
      "Boat Ride",
      "Sarnath",
      "Banaras Food Tour"
    ],
    "maxGroupSize": 15,
    "featured": false,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival & Evening Aarti",
        "description": "Check into your hotel. In the evening, witness the divine Ganga Aarti at Dashashwamedh Ghat.",
        "places": [
          {
            "name": "Varanasi Station",
            "location": {
              "lat": 25.334,
              "lng": 82.989
            }
          },
          {
            "name": "Dashashwamedh Ghat",
            "location": {
              "lat": 25.306,
              "lng": 83.0101
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Sunrise Boat Ride & Sarnath",
        "description": "Early morning boat ride on the Ganges. Later, visit Sarnath where Buddha gave his first sermon.",
        "places": [
          {
            "name": "Assi Ghat",
            "location": {
              "lat": 25.2891,
              "lng": 83.0051
            }
          },
          {
            "name": "Sarnath",
            "location": {
              "lat": 25.3789,
              "lng": 83.0232
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Kashi Vishwanath & Departure",
        "description": "Morning visit to Kashi Vishwanath Temple, followed by departure.",
        "places": [
          {
            "name": "Kashi Vishwanath",
            "location": {
              "lat": 25.3109,
              "lng": 83.0107
            }
          },
          {
            "name": "Varanasi Airport",
            "location": {
              "lat": 25.4497,
              "lng": 82.8596
            }
          }
        ]
      }
    ]
  },
  {
    "id": "meghalaya-clouds",
    "title": "Meghalaya Clouds",
    "subtitle": "Living root bridges and cascading waterfalls",
    "location": "Shillong & Cherrapunji",
    "region": "East",
    "type": "Nature",
    "duration": "6 Days / 5 Nights",
    "basePriceAdult": 21999,
    "tags": [
      "Nature",
      "Trekking",
      "Rainforest"
    ],
    "glow": "#3D9BFF",
    "glowRgb": "61,155,255",
    "badge": "NATURE",
    "rating": 4.8,
    "reviewCount": 843,
    "img": "/packages/meghalaya.png",
    "highlights": [
      "Root Bridges",
      "Dawki River",
      "Seven Sisters Falls",
      "Caves"
    ],
    "maxGroupSize": 10,
    "featured": false,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival in Guwahati to Shillong",
        "description": "Arrive in Guwahati, drive to the Scotland of the East, Shillong. Stop by Umiam Lake.",
        "places": [
          {
            "name": "Guwahati Airport",
            "location": {
              "lat": 26.1065,
              "lng": 91.5859
            }
          },
          {
            "name": "Umiam Lake",
            "location": {
              "lat": 25.6601,
              "lng": 91.8971
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Shillong to Cherrapunji",
        "description": "Drive to Cherrapunji viewing the majestic Nohkalikai Falls and Mawsmai Caves.",
        "places": [
          {
            "name": "Nohkalikai Falls",
            "location": {
              "lat": 25.2755,
              "lng": 91.6853
            }
          },
          {
            "name": "Cherrapunji",
            "location": {
              "lat": 25.2702,
              "lng": 91.7323
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Living Root Bridges Trek",
        "description": "Trek through lush rainforests to experience the miraculous Double Decker Living Root Bridge.",
        "places": [
          {
            "name": "Double Decker Bridge",
            "location": {
              "lat": 25.2505,
              "lng": 91.6702
            }
          }
        ]
      },
      {
        "day": 4,
        "title": "Crystal Clear Dawki",
        "description": "Boat ride on the glass-like waters of Umngot River in Dawki and visit the cleanest village in Asia, Mawlynnong.",
        "places": [
          {
            "name": "Dawki River",
            "location": {
              "lat": 25.1866,
              "lng": 92.0163
            }
          },
          {
            "name": "Mawlynnong",
            "location": {
              "lat": 25.203,
              "lng": 91.916
            }
          }
        ]
      },
      {
        "day": 5,
        "title": "Return to Shillong",
        "description": "Drive back to Shillong, visiting the Don Bosco Museum and Police Bazaar.",
        "places": [
          {
            "name": "Shillong",
            "location": {
              "lat": 25.5788,
              "lng": 91.8933
            }
          }
        ]
      },
      {
        "day": 6,
        "title": "Departure",
        "description": "Morning departure from Shillong back to Guwahati Airport.",
        "places": [
          {
            "name": "Guwahati Airport",
            "location": {
              "lat": 26.1065,
              "lng": 91.5859
            }
          }
        ]
      }
    ]
  },
  {
    "id": "ranthambore-wild",
    "title": "Ranthambore Wild",
    "subtitle": "Thrilling tiger safaris in the royal jungle",
    "location": "Sawai Madhopur, Rajasthan",
    "region": "West",
    "type": "Parks",
    "duration": "4 Days / 3 Nights",
    "basePriceAdult": 18499,
    "tags": [
      "Wildlife",
      "Safari",
      "Parks"
    ],
    "glow": "#FF7A30",
    "glowRgb": "255,122,48",
    "badge": "WILDLIFE",
    "rating": 4.7,
    "reviewCount": 1102,
    "img": "/packages/ranthambore.png",
    "highlights": [
      "Tiger Safari",
      "Ranthambore Fort",
      "Bird Watching",
      "Resort Stay"
    ],
    "maxGroupSize": 12,
    "featured": false,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival in Ranthambore",
        "description": "Arrive at Sawai Madhopur, check into your wilderness resort and relax.",
        "places": [
          {
            "name": "Sawai Madhopur",
            "location": {
              "lat": 25.9928,
              "lng": 76.3526
            }
          },
          {
            "name": "Ranthambore Resort",
            "location": {
              "lat": 26.0173,
              "lng": 76.3503
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "First Tiger Safari",
        "description": "Early morning jeep safari deep into the core zones of the national park.",
        "places": [
          {
            "name": "Ranthambore Park",
            "location": {
              "lat": 26.0173,
              "lng": 76.5026
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Ranthambore Fort & Safari",
        "description": "Visit the historic Ranthambore fort inside the park, followed by an evening safari.",
        "places": [
          {
            "name": "Ranthambore Fort",
            "location": {
              "lat": 26.0197,
              "lng": 76.455
            }
          }
        ]
      },
      {
        "day": 4,
        "title": "Departure",
        "description": "Enjoy a leisurely breakfast before departing for onward journey.",
        "places": [
          {
            "name": "Sawai Madhopur",
            "location": {
              "lat": 25.9928,
              "lng": 76.3526
            }
          }
        ]
      }
    ]
  },
  {
    "id": "coorg-coffee",
    "title": "Coorg Coffee Trails",
    "subtitle": "Mist, spice plantations and waterfalls",
    "location": "Coorg, Karnataka",
    "region": "South",
    "type": "Nature",
    "duration": "3 Days / 2 Nights",
    "basePriceAdult": 12499,
    "tags": [
      "Nature",
      "Leisure",
      "Hill Station"
    ],
    "glow": "#00FFA3",
    "glowRgb": "0,255,163",
    "badge": "WEEKEND",
    "rating": 4.7,
    "reviewCount": 2200,
    "img": "/packages/coorg.png",
    "highlights": [
      "Coffee Plantation",
      "Abbey Falls",
      "Raja Seat",
      "Dubare Camp"
    ],
    "maxGroupSize": 14,
    "featured": false,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival & Coffee Plantations",
        "description": "Arrive in Madikeri (Coorg). Indulge in a guided walk through aromatic coffee estates.",
        "places": [
          {
            "name": "Madikeri",
            "location": {
              "lat": 12.4244,
              "lng": 75.7382
            }
          },
          {
            "name": "Raja's Seat",
            "location": {
              "lat": 12.4187,
              "lng": 75.733
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Waterfalls & Elephants",
        "description": "Visit the beautiful Abbey Falls and interact with elephants at Dubare Elephant Camp.",
        "places": [
          {
            "name": "Abbey Falls",
            "location": {
              "lat": 12.4533,
              "lng": 75.7202
            }
          },
          {
            "name": "Dubare Elephant Camp",
            "location": {
              "lat": 12.3688,
              "lng": 75.908
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Tibetan Monastery & Departure",
        "description": "Visit the stunning Namdroling Monastery (Golden Temple) in Bylakuppe before leaving.",
        "places": [
          {
            "name": "Namdroling Monastery",
            "location": {
              "lat": 12.4249,
              "lng": 75.9679
            }
          }
        ]
      }
    ]
  },
  {
    "id": "darjeeling-tea",
    "title": "Darjeeling Tea Retreat",
    "subtitle": "Himalayan railways and endless tea gardens",
    "location": "Darjeeling, West Bengal",
    "region": "East",
    "type": "Leisure",
    "duration": "5 Days / 4 Nights",
    "basePriceAdult": 17999,
    "tags": [
      "Heritage",
      "Leisure",
      "Mountains"
    ],
    "glow": "#3D9BFF",
    "glowRgb": "61,155,255",
    "badge": "SCENIC",
    "rating": 4.6,
    "reviewCount": 1890,
    "img": "/packages/darjeeling.png",
    "highlights": [
      "Toy Train",
      "Tiger Hill Sunrise",
      "Tea Estate",
      "Peace Pagoda"
    ],
    "maxGroupSize": 12,
    "featured": false,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival in Bagdogra & Transfer",
        "description": "Arrive at Bagdogra/NJP and take the scenic winding roads up to Darjeeling.",
        "places": [
          {
            "name": "Bagdogra Airport",
            "location": {
              "lat": 26.6811,
              "lng": 88.3286
            }
          },
          {
            "name": "Darjeeling",
            "location": {
              "lat": 27.036,
              "lng": 88.2627
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Tiger Hill Sunrise",
        "description": "Early morning drive to Tiger Hill to watch the sunrise over Mt Kanchenjunga.",
        "places": [
          {
            "name": "Tiger Hill",
            "location": {
              "lat": 26.9749,
              "lng": 88.2721
            }
          },
          {
            "name": "Batasia Loop",
            "location": {
              "lat": 27.0142,
              "lng": 88.257
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Tea Estates & Toy Train",
        "description": "Tour Happy Valley Tea Estate. Experience the iconic Darjeeling Himalayan Railway.",
        "places": [
          {
            "name": "Happy Valley Tea Estate",
            "location": {
              "lat": 27.0494,
              "lng": 88.2619
            }
          },
          {
            "name": "Darjeeling Station",
            "location": {
              "lat": 27.0321,
              "lng": 88.2626
            }
          }
        ]
      },
      {
        "day": 4,
        "title": "Peace Pagoda & Zoo",
        "description": "Visit the Himalayan Mountaineering Institute and the Japanese Peace Pagoda.",
        "places": [
          {
            "name": "Peace Pagoda",
            "location": {
              "lat": 27.0305,
              "lng": 88.2622
            }
          },
          {
            "name": "Padmaja Naidu Zoo",
            "location": {
              "lat": 27.0583,
              "lng": 88.2547
            }
          }
        ]
      },
      {
        "day": 5,
        "title": "Departure",
        "description": "Bid farewell to the Queen of the Hills and descend to the plains for departure.",
        "places": [
          {
            "name": "Bagdogra Airport",
            "location": {
              "lat": 26.6811,
              "lng": 88.3286
            }
          }
        ]
      }
    ]
  },
  {
    "id": "hampi-ruins",
    "title": "Hampi Heritage",
    "subtitle": "Lost empires and boulder strewn landscapes",
    "location": "Hampi, Karnataka",
    "region": "South",
    "type": "Heritage",
    "duration": "4 Days / 3 Nights",
    "basePriceAdult": 11999,
    "tags": [
      "Heritage",
      "Culture",
      "Architecture"
    ],
    "glow": "#FFD166",
    "glowRgb": "255,209,102",
    "badge": "HISTORIC",
    "rating": 4.8,
    "reviewCount": 1540,
    "img": "/packages/hampi.png",
    "highlights": [
      "Vijayanagara Ruins",
      "Virupaksha Temple",
      "Coracle Ride",
      "Matanga Hill"
    ],
    "maxGroupSize": 15,
    "featured": false,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival in Hospet",
        "description": "Arrive at Hospet and transfer to Hampi. Evening sunset at Hemakuta Hill.",
        "places": [
          {
            "name": "Hospet",
            "location": {
              "lat": 15.2711,
              "lng": 76.3934
            }
          },
          {
            "name": "Hemakuta Hill",
            "location": {
              "lat": 15.3338,
              "lng": 76.4608
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Architectural Marvels",
        "description": "Explore the Vittala Temple with its iconic Stone Chariot and the Royal Enclosure.",
        "places": [
          {
            "name": "Vittala Temple",
            "location": {
              "lat": 15.3396,
              "lng": 76.4745
            }
          },
          {
            "name": "Lotus Mahal",
            "location": {
              "lat": 15.3211,
              "lng": 76.4633
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Hippie Island & Coracle",
        "description": "Cross the Tungabhadra River, experience the laid-back village vibe and a coracle boat ride.",
        "places": [
          {
            "name": "Tungabhadra River",
            "location": {
              "lat": 15.3353,
              "lng": 76.4678
            }
          },
          {
            "name": "Anjaneya Hill",
            "location": {
              "lat": 15.3524,
              "lng": 76.4716
            }
          }
        ]
      },
      {
        "day": 4,
        "title": "Departure",
        "description": "Morning hike to Matanga Hill for sunrise before departing Hospet.",
        "places": [
          {
            "name": "Matanga Hill",
            "location": {
              "lat": 15.3314,
              "lng": 76.4674
            }
          }
        ]
      }
    ]
  },
  {
    "id": "kasol-trek",
    "title": "Kasol Backpacker",
    "subtitle": "Pine forests, cafes and mountain trails",
    "location": "Parvati Valley, HP",
    "region": "North",
    "type": "Adventure",
    "duration": "5 Days / 4 Nights",
    "basePriceAdult": 14500,
    "tags": [
      "Trekking",
      "Mountains",
      "Youth"
    ],
    "glow": "#3D9BFF",
    "glowRgb": "61,155,255",
    "badge": "BACKPACKER",
    "rating": 4.5,
    "reviewCount": 899,
    "img": "/packages/kasol.png",
    "highlights": [
      "Kheerganga Trek",
      "Manikaran Hot Springs",
      "Israeli Cafes",
      "Tosh Village"
    ],
    "maxGroupSize": 20,
    "featured": false,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival in Kasol",
        "description": "Arrive in Kasol. Spend the day cafe-hopping along the Parvati river.",
        "places": [
          {
            "name": "Bhuntar",
            "location": {
              "lat": 31.8763,
              "lng": 77.1557
            }
          },
          {
            "name": "Kasol",
            "location": {
              "lat": 32.0098,
              "lng": 77.315
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Manikaran & Tosh",
        "description": "Visit the holy Manikaran Sahib hot springs and hike up to the serene Tosh village.",
        "places": [
          {
            "name": "Manikaran Sahib",
            "location": {
              "lat": 32.027,
              "lng": 77.3458
            }
          },
          {
            "name": "Tosh Village",
            "location": {
              "lat": 32.0227,
              "lng": 77.4479
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Kheerganga Trek - Ascent",
        "description": "Begin the thrilling trek through pine forests to reach Kheerganga.",
        "places": [
          {
            "name": "Barshaini",
            "location": {
              "lat": 32.0076,
              "lng": 77.4334
            }
          },
          {
            "name": "Kheerganga",
            "location": {
              "lat": 31.9928,
              "lng": 77.4747
            }
          }
        ]
      },
      {
        "day": 4,
        "title": "Kheerganga - Descent",
        "description": "Morning dip in the natural hot springs, then descend back to Kasol.",
        "places": [
          {
            "name": "Kheerganga",
            "location": {
              "lat": 31.9928,
              "lng": 77.4747
            }
          },
          {
            "name": "Kasol",
            "location": {
              "lat": 32.0098,
              "lng": 77.315
            }
          }
        ]
      },
      {
        "day": 5,
        "title": "Departure",
        "description": "Depart from Kasol taking back mountain memories.",
        "places": [
          {
            "name": "Kasol",
            "location": {
              "lat": 32.0098,
              "lng": 77.315
            }
          }
        ]
      }
    ]
  },
  {
    "id": "kaziranga-safari",
    "title": "Kaziranga Safari",
    "subtitle": "Home of the great Indian one-horned rhinoceros",
    "location": "Kaziranga, Assam",
    "region": "East",
    "type": "Parks",
    "duration": "4 Days / 3 Nights",
    "basePriceAdult": 16999,
    "tags": [
      "Wildlife",
      "Parks",
      "Nature"
    ],
    "glow": "#00FFA3",
    "glowRgb": "0,255,163",
    "badge": "SAFARI",
    "rating": 4.7,
    "reviewCount": 654,
    "img": "/packages/kaziranga.png",
    "highlights": [
      "Jeep Safari",
      "Elephant Ride",
      "Tea Estates",
      "Brahmaputra Cruise"
    ],
    "maxGroupSize": 10,
    "featured": false,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival in Guwahati to Kaziranga",
        "description": "Arrive at Guwahati Airport and drive to the UNESCO site of Kaziranga.",
        "places": [
          {
            "name": "Guwahati Airport",
            "location": {
              "lat": 26.1065,
              "lng": 91.5859
            }
          },
          {
            "name": "Kaziranga National Park",
            "location": {
              "lat": 26.5775,
              "lng": 93.1711
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Wildlife Safaris",
        "description": "Go for an early morning Elephant Safari followed by an afternoon Jeep Safari.",
        "places": [
          {
            "name": "Kaziranga Central Range",
            "location": {
              "lat": 26.5875,
              "lng": 93.1611
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Tea Gardens & River",
        "description": "Visit lush local Assam tea estates and take a sunset river cruise on the Brahmaputra.",
        "places": [
          {
            "name": "Assam Tea Estate",
            "location": {
              "lat": 26.6111,
              "lng": 93.2011
            }
          }
        ]
      },
      {
        "day": 4,
        "title": "Departure",
        "description": "Drive back to Guwahati for your departure flight.",
        "places": [
          {
            "name": "Guwahati Airport",
            "location": {
              "lat": 26.1065,
              "lng": 91.5859
            }
          }
        ]
      }
    ]
  },
  {
    "id": "ladakh-expedition",
    "title": "Ladakh Expedition",
    "subtitle": "High-altitude deserts and azure blue lakes",
    "location": "Leh & Pangong, Ladakh",
    "region": "North",
    "type": "Adventure",
    "duration": "7 Days / 6 Nights",
    "basePriceAdult": 35000,
    "tags": [
      "Adventure",
      "Mountains",
      "Scenic"
    ],
    "glow": "#B069FF",
    "glowRgb": "176,105,255",
    "badge": "EXPEDITION",
    "rating": 4.9,
    "reviewCount": 1622,
    "img": "/packages/ladakh.png",
    "highlights": [
      "Pangong Lake",
      "Khardung La Pass",
      "Nubra Valley",
      "Monasteries"
    ],
    "maxGroupSize": 12,
    "featured": false,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival in Leh",
        "description": "Arrive in Leh. The entire day is dedicated to acclimatization to the high altitude.",
        "places": [
          {
            "name": "Kushok Bakula Rimpochee Airport",
            "location": {
              "lat": 34.1362,
              "lng": 77.5469
            }
          },
          {
            "name": "Leh City",
            "location": {
              "lat": 34.1526,
              "lng": 77.5771
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Leh Local Sightseeing",
        "description": "Visit the ancient Thiksey Monastery and the Shanti Stupa.",
        "places": [
          {
            "name": "Thiksey Monastery",
            "location": {
              "lat": 34.056,
              "lng": 77.6675
            }
          },
          {
            "name": "Shanti Stupa",
            "location": {
              "lat": 34.1672,
              "lng": 77.5752
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Khardung La & Nubra Valley",
        "description": "Drive through Khardung La (highest motorable road) to the sand dunes of Nubra Valley.",
        "places": [
          {
            "name": "Khardung La",
            "location": {
              "lat": 34.2787,
              "lng": 77.6047
            }
          },
          {
            "name": "Hunder Sand Dunes",
            "location": {
              "lat": 34.5822,
              "lng": 77.4697
            }
          }
        ]
      },
      {
        "day": 4,
        "title": "Pangong Lake",
        "description": "Journey alongside the Shyok river to witness the shifting blues of Pangong Lake.",
        "places": [
          {
            "name": "Pangong Tso",
            "location": {
              "lat": 33.7595,
              "lng": 78.6674
            }
          }
        ]
      },
      {
        "day": 5,
        "title": "Sunrise at Pangong & Return",
        "description": "Catch a mesmerizing sunrise before driving back to Leh via Chang La pass.",
        "places": [
          {
            "name": "Chang La",
            "location": {
              "lat": 34.0456,
              "lng": 77.9304
            }
          },
          {
            "name": "Leh",
            "location": {
              "lat": 34.1526,
              "lng": 77.5771
            }
          }
        ]
      },
      {
        "day": 6,
        "title": "Magnetic Hill & Sangam",
        "description": "Experience the anti-gravity Magnetic hill and the confluence of Zanskar and Indus rivers.",
        "places": [
          {
            "name": "Magnetic Hill",
            "location": {
              "lat": 34.1724,
              "lng": 77.334
            }
          },
          {
            "name": "Sangam",
            "location": {
              "lat": 34.1666,
              "lng": 77.3333
            }
          }
        ]
      },
      {
        "day": 7,
        "title": "Departure",
        "description": "Fly out of Leh with memories of the majestic Himalayas.",
        "places": [
          {
            "name": "Leh Airport",
            "location": {
              "lat": 34.1362,
              "lng": 77.5469
            }
          }
        ]
      }
    ]
  },
  {
    "id": "mysore-royal",
    "title": "Mysore Royale",
    "subtitle": "Palaces, silk, and a rich cultural tapestry",
    "location": "Mysore, Karnataka",
    "region": "South",
    "type": "Heritage",
    "duration": "3 Days / 2 Nights",
    "basePriceAdult": 9500,
    "tags": [
      "Culture",
      "Heritage",
      "City"
    ],
    "glow": "#FFD166",
    "glowRgb": "255,209,102",
    "badge": "CULTURAL",
    "rating": 4.6,
    "reviewCount": 1400,
    "img": "/packages/mysore.png",
    "highlights": [
      "Mysore Palace",
      "Chamundi Hill",
      "Brindavan Gardens",
      "Silk Shopping"
    ],
    "maxGroupSize": 20,
    "featured": false,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival & City Lights",
        "description": "Arrive in Mysore. Evening visit to the beautifully illuminated Mysore Palace.",
        "places": [
          {
            "name": "Mysore Railway Station",
            "location": {
              "lat": 12.3155,
              "lng": 76.6417
            }
          },
          {
            "name": "Mysore Palace",
            "location": {
              "lat": 12.3051,
              "lng": 76.6551
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Hills & Gardens",
        "description": "Drive up to Chamundeshwari Temple and spend the evening watching the musical fountains at Brindavan Gardens.",
        "places": [
          {
            "name": "Chamundi Hill",
            "location": {
              "lat": 12.2743,
              "lng": 76.6713
            }
          },
          {
            "name": "Brindavan Gardens",
            "location": {
              "lat": 12.4211,
              "lng": 76.5714
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Market Tour & Departure",
        "description": "Explore the bustling Devaraja Market for sandalwood and silk, before departure.",
        "places": [
          {
            "name": "Devaraja Market",
            "location": {
              "lat": 12.3113,
              "lng": 76.6515
            }
          }
        ]
      }
    ]
  },
  {
    "id": "pondicherry-leisure",
    "title": "Pondicherry Charm",
    "subtitle": "French colonial quarters and serene ashrams",
    "location": "Pondicherry",
    "region": "South",
    "type": "Leisure",
    "duration": "4 Days / 3 Nights",
    "basePriceAdult": 13999,
    "tags": [
      "Leisure",
      "Beach",
      "Culture"
    ],
    "glow": "#B069FF",
    "glowRgb": "176,105,255",
    "badge": "RELAXING",
    "rating": 4.7,
    "reviewCount": 2031,
    "img": "/packages/pondicherry.png",
    "highlights": [
      "Auroville",
      "Promenade Beach",
      "French Quarter",
      "Cafe Hopping"
    ],
    "maxGroupSize": 15,
    "featured": false,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival & French Quarter",
        "description": "Arrive in Pondicherry and stroll the colorful streets of White Town.",
        "places": [
          {
            "name": "Aurobindo Ashram",
            "location": {
              "lat": 11.9348,
              "lng": 79.8351
            }
          },
          {
            "name": "French Quarter",
            "location": {
              "lat": 11.9318,
              "lng": 79.8335
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Auroville Exploration",
        "description": "Visit the experimental township of Auroville and view the Matrimandir.",
        "places": [
          {
            "name": "Matrimandir, Auroville",
            "location": {
              "lat": 12.0069,
              "lng": 79.8105
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Beach Leisure",
        "description": "Spend the day relaxing at Paradise Beach and enjoying local coastal cafes.",
        "places": [
          {
            "name": "Paradise Beach",
            "location": {
              "lat": 11.8596,
              "lng": 79.8174
            }
          },
          {
            "name": "Promenade Beach",
            "location": {
              "lat": 11.931,
              "lng": 79.836
            }
          }
        ]
      },
      {
        "day": 4,
        "title": "Departure",
        "description": "Collect some French bakery treats before heading back.",
        "places": [
          {
            "name": "White Town",
            "location": {
              "lat": 11.9318,
              "lng": 79.8335
            }
          }
        ]
      }
    ]
  },
  {
    "id": "sikkim-mystic",
    "title": "Sikkim Mystique",
    "subtitle": "Alpine lakes, monasteries and Himalayan serenity",
    "location": "Gangtok & Nathula, Sikkim",
    "region": "East",
    "type": "Mountains",
    "duration": "6 Days / 5 Nights",
    "basePriceAdult": 26000,
    "tags": [
      "Mountains",
      "Adventure",
      "Nature"
    ],
    "glow": "#00FFA3",
    "glowRgb": "0,255,163",
    "badge": "SCENIC",
    "rating": 4.8,
    "reviewCount": 1120,
    "img": "/packages/sikkim.png",
    "highlights": [
      "Tsomgo Lake",
      "Nathula Pass",
      "Rumtek Monastery",
      "MG Marg"
    ],
    "maxGroupSize": 10,
    "featured": false,
    "itinerary": [
      {
        "day": 1,
        "title": "Arrival in Gangtok",
        "description": "Arrive at Bagdogra/Pakyong and drive to Gangtok. Evening at the vibrant MG Marg.",
        "places": [
          {
            "name": "Pakyong Airport",
            "location": {
              "lat": 27.2341,
              "lng": 88.5878
            }
          },
          {
            "name": "MG Marg, Gangtok",
            "location": {
              "lat": 27.3292,
              "lng": 88.6124
            }
          }
        ]
      },
      {
        "day": 2,
        "title": "Tsomgo Lake & Baba Mandir",
        "description": "Drive up to the freezing alpine beauty of Tsomgo Lake at 12,400 ft.",
        "places": [
          {
            "name": "Tsomgo Lake",
            "location": {
              "lat": 27.3743,
              "lng": 88.7618
            }
          },
          {
            "name": "Baba Harbhajan Singh Temple",
            "location": {
              "lat": 27.3512,
              "lng": 88.8236
            }
          }
        ]
      },
      {
        "day": 3,
        "title": "Nathula Pass Excursion",
        "description": "Experience the historic Indo-China border at Nathula Pass.",
        "places": [
          {
            "name": "Nathula Pass",
            "location": {
              "lat": 27.3867,
              "lng": 88.8309
            }
          }
        ]
      },
      {
        "day": 4,
        "title": "Gangtok Sightseeing",
        "description": "Visit the serene Rumtek Monastery and local viewpoints.",
        "places": [
          {
            "name": "Rumtek Monastery",
            "location": {
              "lat": 27.3005,
              "lng": 88.523
            }
          },
          {
            "name": "Tashi View Point",
            "location": {
              "lat": 27.3687,
              "lng": 88.6186
            }
          }
        ]
      },
      {
        "day": 5,
        "title": "Leisure & Shopping",
        "description": "Free day for shopping local handicrafts and trying exquisite Sikkimese cuisine.",
        "places": [
          {
            "name": "Gangtok Town",
            "location": {
              "lat": 27.3292,
              "lng": 88.6124
            }
          }
        ]
      },
      {
        "day": 6,
        "title": "Departure",
        "description": "Drive down from the mountains for your onward journey.",
        "places": [
          {
            "name": "Pakyong Airport",
            "location": {
              "lat": 27.2341,
              "lng": 88.5878
            }
          }
        ]
      }
    ]
  }
];

export const HERO_PACKAGES = PACKAGES.filter(p => p.featured);
export const GRID_PACKAGES = PACKAGES.filter(p => !p.featured);

export const formatINR = (amount) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

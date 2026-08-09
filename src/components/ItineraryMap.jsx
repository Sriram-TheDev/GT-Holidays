import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Maximize2 } from 'lucide-react';

// Dark theme map style
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
];

const RoutePolyline = ({ places }) => {
  const map = useMap();
  const [polyline, setPolyline] = useState(null);
  
  useEffect(() => {
    if (!map || !places || places.length < 2) return;
    
    let currentLine = polyline;
    // Clear previous if active/re-rendering wildly
    if (currentLine) {
      currentLine.setMap(null);
    }
    
    const fetchOSRM = async () => {
      try {
        const coordString = places.map(p => `${p.location.lng},${p.location.lat}`).join(';');
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const path = data.routes[0].geometry.coordinates.map(c => new window.google.maps.LatLng(c[1], c[0]));
          
          const line = new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: '#3D9BFF', 
            strokeOpacity: 0.8,
            strokeWeight: 4,
            icons: [{
              icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, strokeOpacity: 1, fillOpacity: 1 },
              offset: '50px',
              repeat: '200px'
            }]
          });
          
          line.setMap(map);
          setPolyline(line);
        }
      } catch (err) {
        console.error("Free Routing API failed", err);
      }
    };
    
    fetchOSRM();
    
    return () => {
      // Intentionally not aggressively unmounting on place prop jitter, but handled in start of effect
    };
  }, [map, places]);

  useEffect(() => {
    return () => {
      if (polyline) polyline.setMap(null);
    }
  }, [polyline]);
  
  return null;
};

const MapController = ({ activeDay, itinerary }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !itinerary || itinerary.length === 0) return;
    
    const bounds = new window.google.maps.LatLngBounds();
    
    let placesToFocus = [];
    if (activeDay === null) {
      // Focus all places if no active day is selected
      placesToFocus = itinerary.flatMap(day => day.places);
    } else {
      // Focus specific day places
      const dayData = itinerary.find(d => d.day === activeDay);
      if (dayData) {
        placesToFocus = dayData.places;
      }
    }

    if (placesToFocus.length === 0) return;
    
    placesToFocus.forEach(p => {
      bounds.extend(new window.google.maps.LatLng(p.location.lat, p.location.lng));
    });

    // Animate map to the bounds
    if (placesToFocus.length === 1 && activeDay !== null) {
      map.panTo(bounds.getCenter());
      setTimeout(() => map.setZoom(13), 300); // Smooth snap zoom
    } else {
      map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });
    }
  }, [map, activeDay, itinerary]);

  return null;
};

export default function ItineraryMap({ itinerary, packageColor }) {
  // null means show all map bounds
  const [activeDay, setActiveDay] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  if (!itinerary || itinerary.length === 0) {
    return null;
  }

  // Flatten all places for rendering the polyline correctly
  const allPlaces = itinerary.flatMap(day => day.places);

  return (
    <div style={{ paddingTop: 40, paddingBottom: 40, borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600 }}>
          Itinerary & Route
        </h2>
        {activeDay !== null && (
          <button 
            onClick={() => setActiveDay(null)}
            style={{ 
              background: 'transparent',
              border: `1px solid rgba(${packageColor}, 0.3)`,
              color: `rgb(${packageColor})`,
              padding: '6px 16px',
              borderRadius: 99,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = `rgba(${packageColor}, 0.1)`}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Maximize2 size={14} /> Full Route
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: 30, alignItems: 'start' }}>
        
        {/* Left Column: Grid Timeline */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 16 
        }}>
          {itinerary.map((item) => {
            const isActive = activeDay === item.day;
            return (
              <motion.button
                key={item.day}
                onClick={() => setActiveDay(isActive ? null : item.day)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: isActive ? `rgba(${packageColor}, 0.1)` : 'var(--color-surface)',
                  border: `1px solid ${isActive ? `rgba(${packageColor}, 0.5)` : 'var(--color-border)'}`,
                  borderRadius: 16,
                  padding: 16,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  color: '#fff',
                  boxShadow: isActive ? `0 0 20px rgba(${packageColor}, 0.1)` : 'none'
                }}
              >
                {/* Active indicator bar */}
                <div style={{
                  position: 'absolute',
                  left: 0, top: 0, bottom: 0,
                  width: 4,
                  background: isActive ? `rgb(${packageColor})` : 'transparent',
                  transition: 'background 0.3s'
                }} />
                
                <span style={{ 
                  color: isActive ? `rgb(${packageColor})` : 'var(--color-text-muted)',
                  fontSize: '0.8rem', 
                  fontWeight: 700, 
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  Day {item.day}
                </span>
                <span style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 600, 
                  fontSize: '1rem',
                  lineHeight: 1.3
                }}>
                  {item.title}
                </span>
                
                {/* Description expanded if active */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}
                    >
                      {item.description}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {/* Right Column: Google Map */}
        <div style={{
          position: 'sticky',
          top: 100,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 20,
          overflow: 'hidden',
          height: 'clamp(400px, 60vh, 600px)',
          boxShadow: `0 20px 40px rgba(0,0,0,0.2), 0 0 40px rgba(${packageColor}, 0.05)`
        }}>
          <APIProvider apiKey={apiKey} loading="lazy">
            <Map 
              defaultZoom={10} 
              defaultCenter={itinerary[0].places[0].location}
              mapId={import.meta.env.VITE_GOOGLE_MAP_ID || "DEMO_MAP_ID"}
              styles={darkMapStyle}
              disableDefaultUI={true}
              gestureHandling={'cooperative'}
            >
              <MapController activeDay={activeDay} itinerary={itinerary} />
              
              {/* Plot polyline connecting all global places (Road snapped + Blue) */}
              <RoutePolyline places={allPlaces} />

              {/* Render all markers across all days */}
              {itinerary.flatMap(day => 
                day.places.map((place, idx) => {
                  const isPlaceActive = activeDay === null || activeDay === day.day;
                  
                  return (
                    <AdvancedMarker 
                      key={`${day.day}-${idx}`} 
                      position={place.location} 
                      title={place.name}
                      zIndex={isPlaceActive ? 10 : 1}
                    >
                      <motion.div 
                        initial={false}
                        animate={{ 
                          scale: isPlaceActive ? 1 : 0.7,
                          opacity: isPlaceActive ? 1 : 0.4
                        }}
                        style={{
                          background: `rgb(${packageColor})`,
                          color: '#000',
                          width: 32,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          boxShadow: isPlaceActive ? `0 0 20px rgba(${packageColor}, 0.6)` : 'none',
                          border: isPlaceActive ? '2px solid #fff' : '2px solid rgba(255,255,255,0.5)',
                        }}
                      >
                        <MapPin size={16} />
                      </motion.div>
                    </AdvancedMarker>
                  )
                })
              )}
            </Map>
          </APIProvider>

          {/* Place labels overlay floating at the bottom */}
          <AnimatePresence mode="popLayout">
            {(activeDay !== null) && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                style={{ 
                  position: 'absolute', bottom: 16, left: 16, right: 16, 
                  display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
                  scrollbarWidth: 'none' 
                }}
              >
                {itinerary.find(d => d.day === activeDay)?.places.map((place, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(11, 12, 16, 0.85)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 16px',
                    borderRadius: 99,
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <MapPin size={12} color={`rgb(${packageColor})`} />
                    {place.name}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

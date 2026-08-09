import { useState, useCallback, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '100%'
}

// Maps styles to match our UI (muted tones)
const mapStyles = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e9e9e9' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] }
]

export default function PackageMap({ itinerary, activeDayNumber }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  })

  const [map, setMap] = useState(null)
  const [activeMarker, setActiveMarker] = useState(null)

  // Extract all markers from the entire itinerary
  const allLocations = itinerary.flatMap(day => 
    (day.mapLocations || []).map(loc => ({
      ...loc,
      dayNumber: day.dayNumber
    }))
  )

  // Filter locations by active day, or show all if no specific day is active
  const visibleLocations = activeDayNumber 
    ? allLocations.filter(l => l.dayNumber === activeDayNumber)
    : allLocations

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance)
  }, [])

  const onUnmount = useCallback(function callback() {
    setMap(null)
  }, [])

  // Auto-fit bounds whenever visibleLocations changes
  useEffect(() => {
    if (map && visibleLocations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds()
      visibleLocations.forEach(loc => {
        bounds.extend({ lat: loc.lat, lng: loc.lng })
      })
      
      // If there's only 1 marker, zoom out slightly after fitting
      if (visibleLocations.length === 1) {
        map.setCenter({ lat: visibleLocations[0].lat, lng: visibleLocations[0].lng })
        map.setZoom(13)
      } else {
        map.fitBounds(bounds, 50) // 50px padding
      }
    }
  }, [map, visibleLocations])

  if (!isLoaded) return <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-body">Loading map...</div>

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      // Provide a generic fallback center/zoom until bounds fit happens
      center={{ lat: 20, lng: 0 }}
      zoom={2}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        styles: mapStyles,
        disableDefaultUI: true, // cleaner look
        zoomControl: true,
      }}
    >
      {visibleLocations.map((loc, i) => (
        <MarkerF
          key={`${loc.name}-${i}`}
          position={{ lat: loc.lat, lng: loc.lng }}
          onClick={() => setActiveMarker(loc)}
          icon={{
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${loc.dayNumber === activeDayNumber ? '#f08920' : '#14314c'}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
              </svg>
            `)}`,
            scaledSize: isLoaded ? new window.google.maps.Size(32, 32) : null,
            anchor: isLoaded ? new window.google.maps.Point(16, 32) : null
          }}
        >
          {activeMarker === loc && (
            <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
              <div className="p-1 max-w-[200px]">
                <h4 className="font-display font-semibold text-ink-900 m-0 leading-tight">{loc.name}</h4>
                <p className="text-xs text-slate-500 m-0 mt-1 font-body">{loc.description}</p>
                <div className="text-[10px] font-bold text-monsoon-600 uppercase tracking-wider mt-2">Day {loc.dayNumber}</div>
              </div>
            </InfoWindowF>
          )}
        </MarkerF>
      ))}
    </GoogleMap>
  )
}

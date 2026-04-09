'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Map, { Marker, NavigationControl, GeolocateControl, type MapRef } from 'react-map-gl'
import { useRouter } from 'next/navigation'
import type { SkateSpot } from '@/lib/types'
import 'mapbox-gl/dist/mapbox-gl.css'

interface SpotMapProps {
  spots: SkateSpot[]
  onSpotSelect?: (spot: SkateSpot) => void
  selectedSpotId?: string
}

export function SpotMap({ spots, onSpotSelect, selectedSpotId }: SpotMapProps) {
  const mapRef = useRef<MapRef>(null)
  const router = useRouter()
  const [viewState, setViewState] = useState({
    longitude: -79.3832,
    latitude: 43.6532,
    zoom: 12,
  })
  const [hasGeolocated, setHasGeolocated] = useState(false)

  // Auto-center on user's location when component mounts
  useEffect(() => {
    if (hasGeolocated) return
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewState({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            zoom: 13,
          })
          setHasGeolocated(true)
        },
        (error) => {
          console.log('Geolocation denied or unavailable:', error.message)
          setHasGeolocated(true)
        },
        { enableHighAccuracy: true, timeout: 5000 }
      )
    }
  }, [hasGeolocated])

  const handleMarkerClick = useCallback((spot: SkateSpot) => {
    if (onSpotSelect) {
      onSpotSelect(spot)
    } else {
      router.push(`/spots/${spot.id}`)
    }
  }, [onSpotSelect, router])

  useEffect(() => {
    if (selectedSpotId && mapRef.current) {
      const spot = spots.find(s => s.id === selectedSpotId)
      if (spot) {
        mapRef.current.flyTo({
          center: [spot.longitude, spot.latitude],
          zoom: 15,
          duration: 1000,
        })
      }
    }
  }, [selectedSpotId, spots])

  return (
    <Map
      ref={mapRef}
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      style={{ width: '100%', height: '100%' }}
      attributionControl={false}
    >
      <GeolocateControl
        position="top-right"
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation
        showUserHeading
        style={{
          backgroundColor: 'var(--card)',
          borderRadius: '8px',
        }}
      />
      <NavigationControl position="top-right" showCompass={false} />
      
      {spots.map((spot) => (
        <Marker
          key={spot.id}
          longitude={spot.longitude}
          latitude={spot.latitude}
          anchor="bottom"
          onClick={() => handleMarkerClick(spot)}
        >
          <button
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
              selectedSpotId === spot.id
                ? 'scale-125 bg-primary text-primary-foreground'
                : 'bg-primary/90 text-primary-foreground hover:scale-110'
            }`}
            aria-label={`View ${spot.name}`}
          >
            <SpotIcon type={spot.spot_type} />
          </button>
        </Marker>
      ))}
    </Map>
  )
}

function SpotIcon({ type }: { type: string }) {
  switch (type) {
    case 'street':
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19h16M4 15h16M7 11h10M9 7h6" />
        </svg>
      )
    case 'park':
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3L2 12h3v9h6v-6h2v6h6v-9h3L12 3z" />
        </svg>
      )
    case 'plaza':
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      )
    case 'diy':
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    default:
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        </svg>
      )
  }
}

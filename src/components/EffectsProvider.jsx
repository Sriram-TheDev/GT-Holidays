import { createContext, useContext, useState, useEffect } from 'react'
import BlobCursor from './BlobCursor'
// Aurora for the global subtle background — using dark-mode accent colors
import Aurora from './ui/Aurora'

const EffectsContext = createContext()

export function useEffects() {
  return useContext(EffectsContext)
}

export default function EffectsProvider({ children }) {
  const [cursorEnabled, setCursorEnabled] = useState(true)
  const [backgroundEnabled, setBackgroundEnabled] = useState(true)

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) setCursorEnabled(false)

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches) { setCursorEnabled(false); setBackgroundEnabled(false) }

    const handleChange = (e) => {
      if (e.matches) { setCursorEnabled(false); setBackgroundEnabled(false) }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <EffectsContext.Provider value={{ cursorEnabled, backgroundEnabled }}>
      <div className="relative">
        {/* Subtle global aurora — dark, low opacity */}
        {backgroundEnabled && (
          <div className="fixed inset-0 -z-10" style={{ opacity: 0.15 }}>
            <Aurora
              colorStops={['#001A10', '#00FFA3', '#001030']}
              amplitude={0.6}
              blend={0.5}
              speed={0.5}
            />
          </div>
        )}

        {/* Custom blob cursor — neon green theme */}
        {cursorEnabled && (
          <div className="fixed inset-0 pointer-events-none z-[9999]">
            <BlobCursor
              blobType="circle"
              fillColor="#00FFA3"
              trailCount={3}
              sizes={[36, 72, 44]}
              innerSizes={[12, 22, 16]}
              innerColor="rgba(0, 255, 163, 0.2)"
              opacities={[0.35, 0.22, 0.12]}
              shadowColor="rgba(0, 255, 163, 0.25)"
              shadowBlur={10}
              shadowOffsetX={0}
              shadowOffsetY={0}
              filterId="blob-cursor"
              filterStdDeviation={18}
              useFilter={true}
              fastDuration={0.12}
              slowDuration={0.35}
              fastEase="power3.out"
              slowEase="power1.out"
              zIndex={9999}
            />
          </div>
        )}

        {children}
      </div>
    </EffectsContext.Provider>
  )
}

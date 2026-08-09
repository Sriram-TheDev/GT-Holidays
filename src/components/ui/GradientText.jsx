// src/components/ui/GradientText.jsx
// Source: ReactBits (DavidHDev/react-bits)
// Deps:   motion (already in package.json)
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, useMotionValue, useAnimationFrame, useTransform } from 'motion/react'

export default function GradientText({
  children,
  className = '',
  colors = ['#00FFA3', '#3D9BFF', '#B069FF', '#00FFA3'],
  animationSpeed = 8,
  showBorder = false,
  direction = 'horizontal',
  pauseOnHover = false,
  yoyo = true,
}) {
  const [isPaused, setIsPaused] = useState(false)
  const progress = useMotionValue(0)
  const elapsedRef = useRef(0)
  const lastTimeRef = useRef(null)
  const animationDuration = animationSpeed * 1000

  useAnimationFrame(time => {
    if (isPaused) { lastTimeRef.current = null; return }
    if (lastTimeRef.current === null) { lastTimeRef.current = time; return }
    const deltaTime = time - lastTimeRef.current
    lastTimeRef.current = time
    elapsedRef.current += deltaTime

    if (yoyo) {
      const fullCycle = animationDuration * 2
      const cycleTime = elapsedRef.current % fullCycle
      progress.set(cycleTime < animationDuration
        ? (cycleTime / animationDuration) * 100
        : 100 - ((cycleTime - animationDuration) / animationDuration) * 100)
    } else {
      progress.set((elapsedRef.current / animationDuration) * 100)
    }
  })

  useEffect(() => { elapsedRef.current = 0; progress.set(0) }, [animationSpeed, progress, yoyo])

  const backgroundPosition = useTransform(progress, p =>
    direction === 'horizontal' ? `${p}% 50%` : `50% ${p}%`
  )

  const handleMouseEnter = useCallback(() => { if (pauseOnHover) setIsPaused(true) }, [pauseOnHover])
  const handleMouseLeave = useCallback(() => { if (pauseOnHover) setIsPaused(false) }, [pauseOnHover])

  const gradientAngle = direction === 'horizontal' ? 'to right' : 'to bottom'
  const gradientColors = [...colors, colors[0]].join(', ')
  const gradientStyle = {
    backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
    backgroundSize: direction === 'horizontal' ? '300% 100%' : '100% 300%',
    backgroundRepeat: 'repeat',
  }

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center font-medium overflow-hidden ${showBorder ? 'py-1 px-2 rounded-xl' : ''} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showBorder && (
        <motion.div className="absolute inset-0 z-0 pointer-events-none rounded-xl" style={{ ...gradientStyle, backgroundPosition }}>
          <div className="absolute rounded-xl z-[-1]" style={{ background: '#0B0C10', width: 'calc(100% - 2px)', height: 'calc(100% - 2px)', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
        </motion.div>
      )}
      <motion.div
        className="inline-block relative z-[2] text-transparent bg-clip-text"
        style={{ ...gradientStyle, backgroundPosition, WebkitBackgroundClip: 'text' }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

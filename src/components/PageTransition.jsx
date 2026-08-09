import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export default function PageTransition({ children }) {
  const containerRef = useRef(null)

  useGSAP(() => {
    // Page entrance animation
    gsap.fromTo(containerRef.current.children,
      {
        opacity: 0,
        y: 20
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        force3D: true,
        clearProps: "transform"
      }
    )
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="page-transition">
      {children}
    </div>
  )
}

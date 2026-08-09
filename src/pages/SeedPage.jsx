import { useEffect, useState } from 'react'
import { seedFirestore } from '../backend/services/seederService'

export default function SeedPage() {
  const [status, setStatus] = useState('Seeding...')
  
  useEffect(() => {
    seedFirestore()
      .then(() => setStatus('✅ Done seeding new premium packages!'))
      .catch(err => setStatus(`❌ Error: ${err.message}`))
  }, [])

  return (
    <div className="p-10 font-mono">
      <h2>Database Seed</h2>
      <p>{status}</p>
    </div>
  )
}

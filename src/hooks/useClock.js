import { useEffect, useState } from 'react'
import { useClockFormat } from '../utils/time'

export default function useClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return useClockFormat(now)
}

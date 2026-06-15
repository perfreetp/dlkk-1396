import { useState, useEffect, useCallback, useRef } from 'react'
import { clamp } from '../utils/scoring'

interface UseHeatControlOptions {
  initial?: number
  driftRate?: number
  safeZone?: [number, number]
}

export const useHeatControl = (options: UseHeatControlOptions = {}) => {
  const { 
    initial = 50, driftRate = 0.4, safeZone = [35, 70] } = options
  const [heat, setHeat] = useState(initial)
  const [autoDrift, setAutoDrift] = useState(false)
  const driftRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!autoDrift) {
      if (driftRef.current) clearInterval(driftRef.current)
      return
    }
    driftRef.current = setInterval(() => {
      setHeat(prev => {
        const drift = (Math.random() - 0.3) * driftRate * 10
        return clamp(prev + drift, 0, 100)
      })
    }, 500)
    return () => {
      if (driftRef.current) clearInterval(driftRef.current)
    }
  }, [autoDrift, driftRate])

  const startDrift = useCallback(() => setAutoDrift(true), [])
  const stopDrift = useCallback(() => setAutoDrift(false), [])

  const increase = useCallback((amount = 10) => {
    setHeat(prev => clamp(prev + amount, 0, 100))
  }, [])
  const decrease = useCallback((amount = 10) => {
    setHeat(prev => clamp(prev - amount, 0, 100))
  }, [])
  const reset = useCallback((value?: number) => {
    setHeat(value ?? initial)
  }, [initial])

  const inSafeZone = heat >= safeZone[0] && heat <= safeZone[1]
  const zone = heat < safeZone[0] ? 'too_low' : heat > safeZone[1] ? 'too_high' : 'safe'

  const status = (() => {
    if (heat < 20) return { label: '火候太小', color: 'text-sky-500', emoji: '❄️' }
    if (heat < safeZone[0]) return { label: '温度偏低', color: 'text-sky-400', emoji: '🥶' }
    if (heat <= safeZone[1]) return { label: '火候刚好', color: 'text-mint-500', emoji: '✅' }
    if (heat < 85) return { label: '温度偏高', color: 'text-warm-500', emoji: '⚠️' }
    return { label: '要糊了！', color: 'text-tomato-500', emoji: '🔥' }
  })()

  return {
    heat,
    inSafeZone,
    zone,
    status,
    safeZone,
    startDrift,
    stopDrift,
    increase,
    decrease,
    reset,
  }
}

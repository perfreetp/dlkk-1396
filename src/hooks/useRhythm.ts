import { useState, useEffect, useCallback, useRef } from 'react'
import { clamp } from '../utils/scoring'

export interface RhythmZone {
  start: number
  end: number
  bonus?: boolean
}

export type AccuracyLevel = 'perfect' | 'great' | 'good' | 'ok' | 'miss'

interface UseRhythmOptions {
  durationMs?: number
  hitZones?: RhythmZone[]
  onHit?: (score: number, accuracy: AccuracyLevel) => void
}

export const useRhythm = (options: UseRhythmOptions = {}) => {
  const { 
    durationMs = 4000,
    hitZones = [{ start: 0.4, end: 0.6, bonus: true }],
    onHit
  } = options

  const [position, setPosition] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [lastScore, setLastScore] = useState<number | null>(null)
  const [lastAccuracy, setLastAccuracy] = useState<AccuracyLevel | null>(null)
  const animRef = useRef<number | null>(null)
  const startTimeRef = useRef(0)
  const directionRef = useRef(1)
  const onHitRef = useRef(onHit)

  useEffect(() => { onHitRef.current = onHit }, [onHit])

  const tick = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current
    let pos = (elapsed % durationMs) / durationMs
    if (directionRef.current === -1) {
      pos = 1 - pos
    }
    if (Math.floor(elapsed / durationMs) > 0 && Math.floor(elapsed / durationMs) % 2 === 1) {
      pos = 1 - (elapsed % durationMs) / durationMs
    } else {
      pos = (elapsed % durationMs) / durationMs
    }
    setPosition(pos)
    animRef.current = requestAnimationFrame(tick)
  }, [durationMs])

  const start = useCallback(() => {
    setIsPlaying(true)
    setLastScore(null)
    setLastAccuracy(null)
    startTimeRef.current = Date.now()
    animRef.current = requestAnimationFrame(tick)
  }, [tick])

  const stop = useCallback(() => {
    setIsPlaying(false)
    if (animRef.current) cancelAnimationFrame(animRef.current)
  }, [])

  const handleHit = useCallback((): { score: number; accuracy: AccuracyLevel } => {
    if (!isPlaying) return { score: 0, accuracy: 'miss' }
    
    const pos = position
    let score = 0
    let accuracy: AccuracyLevel = 'miss'
    
    for (const zone of hitZones) {
      const center = (zone.start + zone.end) / 2
      const width = zone.end - zone.start
      if (pos >= zone.start && pos <= zone.end) {
        const distFromCenter = Math.abs(pos - center) / (width / 2)
        if (distFromCenter < 0.15) {
          score = 100
          accuracy = 'perfect'
        } else if (distFromCenter < 0.5) {
          score = 80
          accuracy = 'great'
        } else {
          score = 60
          accuracy = 'good'
        }
        break
      }
    }
    
    if (score === 0) {
      const nearest = Math.min(...hitZones.map(z => 
        Math.min(Math.abs(pos - z.start), Math.abs(pos - z.end))
      ))
      if (nearest < 0.1) {
        score = 40
        accuracy = 'ok'
      } else {
        score = 10
        accuracy = 'miss'
      }
    }
    
    setLastScore(score)
    setLastAccuracy(accuracy)
    onHitRef.current?.(score, accuracy)
    return { score, accuracy }
  }, [isPlaying, position, hitZones])

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  return {
    position: clamp(position, 0, 1),
    isPlaying,
    lastScore,
    lastAccuracy,
    hitZones,
    start,
    stop,
    handleHit,
  }
}

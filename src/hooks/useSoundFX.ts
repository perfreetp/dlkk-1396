import { useCallback, useRef, useEffect } from 'react'

let audioCtx: AudioContext | null = null

const getCtx = () => {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioCtx = new Ctx()
  }
  return audioCtx
}

interface ToneOptions {
  frequency?: number
  duration?: number
  type?: OscillatorType
  volume?: number
  attack?: number
  decay?: number
}

export const useSoundFX = () => {
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {})
    }
  }, [])

  const playTone = useCallback((opts: ToneOptions = {}) => {
    const ctx = getCtx()
    if (!ctx) return
    const {
      frequency = 440,
      duration = 0.15,
      type = 'sine',
      volume = 0.15,
      attack = 0.01,
      decay = 0.1,
    } = opts

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(frequency, ctx.currentTime)
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attack)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration + decay)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duration + decay + 0.02)
    } catch {
      // ignore
    }
  }, [])

  const playChop = useCallback(() => {
    playTone({ frequency: 300, duration: 0.08, type: 'square', volume: 0.12 })
    setTimeout(() => playTone({ frequency: 200, duration: 0.06, type: 'triangle', volume: 0.1 }), 40)
  }, [playTone])

  const playChopPerfect = useCallback(() => {
    playTone({ frequency: 880, duration: 0.1, type: 'sine', volume: 0.18 })
    setTimeout(() => playTone({ frequency: 1100, duration: 0.12, type: 'sine', volume: 0.15 }), 60)
  }, [playTone])

  const playSeason = useCallback(() => {
    playTone({ frequency: 520, duration: 0.12, type: 'sine', volume: 0.15 })
  }, [playTone])

  const playDing = useCallback(() => {
    playTone({ frequency: 1200, duration: 0.25, type: 'sine', volume: 0.2 })
    setTimeout(() => playTone({ frequency: 800, duration: 0.3, type: 'sine', volume: 0.15 }), 100)
  }, [playTone])

  const playWarn = useCallback(() => {
    playTone({ frequency: 200, duration: 0.15, type: 'sawtooth', volume: 0.12 })
  }, [playTone])

  const playSuccess = useCallback(() => {
    const notes = [523, 659, 784, 1047]
    notes.forEach((f, i) => {
      setTimeout(() => playTone({ frequency: f, duration: 0.18, type: 'sine', volume: 0.18 }), i * 90)
    })
  }, [playTone])

  const playClick = useCallback(() => {
    playTone({ frequency: 600, duration: 0.04, type: 'sine', volume: 0.1 })
  }, [playTone])

  const playFail = useCallback(() => {
    playTone({ frequency: 200, duration: 0.2, type: 'sawtooth', volume: 0.12 })
    setTimeout(() => playTone({ frequency: 150, duration: 0.3, type: 'sawtooth', volume: 0.1 }), 120)
  }, [playTone])

  const playStir = useCallback(() => {
    playTone({ frequency: 180 + Math.random() * 40, duration: 0.03, type: 'triangle', volume: 0.06 })
  }, [playTone])

  return {
    playTone,
    playChop,
    playChopPerfect,
    playSeason,
    playDing,
    playWarn,
    playSuccess,
    playClick,
    playFail,
    playStir,
  }
}

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseTimerOptions {
  autoStart?: boolean
  onTick?: (remaining: number) => void
  onComplete?: () => void
}

export const useTimer = (
  initialSeconds: number,
  options: UseTimerOptions = {}
) => {
  const { autoStart = false, onTick, onComplete } = options
  const [remaining, setRemaining] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onTickRef = useRef(onTick)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => { onTickRef.current = onTick }, [onTick])
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    if (!isRunning) {
      if (tickRef.current) clearInterval(tickRef.current)
      return
    }
    tickRef.current = setInterval(() => {
      setRemaining(prev => {
        const next = Math.max(0, prev - 1)
        onTickRef.current?.(next)
        if (next === 0) {
          setIsRunning(false)
          onCompleteRef.current?.()
        }
        return next
      })
    }, 1000)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [isRunning])

  const start = useCallback(() => setIsRunning(true), [])
  const pause = useCallback(() => setIsRunning(false), [])
  const reset = useCallback((newSeconds?: number) => {
    setRemaining(newSeconds ?? initialSeconds)
    setIsRunning(false)
  }, [initialSeconds])

  const progress = initialSeconds > 0 ? 1 - (remaining / initialSeconds) : 0

  return { remaining, isRunning, start, pause, reset, progress }
}

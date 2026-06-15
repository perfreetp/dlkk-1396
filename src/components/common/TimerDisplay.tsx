import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatTime } from '../../utils/scoring'

interface TimerDisplayProps {
  remaining: number
  total: number
  isRunning?: boolean
  size?: 'sm' | 'md' | 'lg'
  warnThreshold?: number
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  remaining,
  total,
  isRunning = false,
  size = 'md',
  warnThreshold = 10,
}) => {
  const isWarning = remaining <= warnThreshold && remaining > 0
  const isDanger = remaining <= 5 && remaining > 0
  const progress = total > 0 ? remaining / total : 0
  const circumference = 2 * Math.PI * 45
  
  const sizeClasses = {
    sm: 'w-20 h-20 text-xl',
    md: 'w-32 h-32 text-3xl',
    lg: 'w-44 h-44 text-5xl',
  }

  return (
    <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#FFEED9"
          strokeWidth="8"
        />
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={isDanger ? '#FF6B6B' : isWarning ? '#FFD93D' : '#7FD1AE'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 0.3 }}
        />
      </svg>
      <AnimatePresence mode="wait">
        <motion.div
          key={remaining}
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`
            font-happy font-bold relative z-10
            ${isDanger ? 'text-tomato-500' : isWarning ? 'text-yolk-500' : 'text-warm-500'}
            ${isRunning && isWarning ? 'animate-pulse' : ''}
          `}
        >
          {formatTime(remaining)}
        </motion.div>
      </AnimatePresence>
      {isRunning && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1 -right-1 text-lg"
        >
          ⏰
        </motion.div>
      )}
    </div>
  )
}

export default TimerDisplay

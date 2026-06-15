import React from 'react'
import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  showLabel?: boolean
  label?: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color,
  showLabel = false,
  label,
  size = 'md',
  animated = true,
  className,
}) => {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  const heightClass = size === 'sm' ? 'h-3' : size === 'lg' ? 'h-8' : 'h-5'

  const bgColor = color || '#FFB366'

  return (
    <div className={`w-full ${className || ''}`}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-1 text-sm font-bold text-gray-600">
          <span>{label}</span>
          {showLabel && <span>{Math.round(percent)}%</span>}
        </div>
      )}
      <div className={`w-full bg-cream-200 rounded-full overflow-hidden ${heightClass}`}>
        <motion.div
          className={`${heightClass} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: animated ? `${percent}%` : `${percent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            background: `linear-gradient(90deg, ${bgColor}, ${bgColor}dd)`,
            boxShadow: `inset 0 -3px 6px rgba(0,0,0,0.1), 0 2px 4px ${bgColor}44`,
          }}
        />
      </div>
    </div>
  )
}

export default ProgressBar

import React from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  padded?: boolean
  color?: string
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padded = true,
  color,
  hover = true,
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        rounded-3xl shadow-soft bg-white/95 backdrop-blur-sm
        border-4 border-cream-200
        ${padded ? 'p-6' : ''}
        ${className}
      `}
      style={color ? { borderColor: color + '60', boxShadow: `0 8px 32px ${color}22` } : undefined}
    >
      {children}
    </motion.div>
  )
}

export default Card

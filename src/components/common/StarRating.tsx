import React from 'react'
import { motion } from 'framer-motion'

interface StarRatingProps {
  stars: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
}

export const StarRating: React.FC<StarRatingProps> = ({
  stars,
  maxStars = 5,
  size = 'md',
  animated = true,
}) => {
  const sizeMap = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-6xl',
  }

  return (
    <div className="flex gap-1 justify-center items-center">
      {Array.from({ length: maxStars }).map((_, i) => (
        <motion.span
          key={i}
          initial={animated ? { scale: 0, rotate: -180 } : undefined}
          animate={animated ? { 
            scale: 1, 
            rotate: 0,
            transition: { delay: i * 0.15, type: 'spring', stiffness: 300 }
          } : undefined}
          className={`${sizeMap[size]} drop-shadow-md select-none`}
        >
          {i < stars ? (
            <motion.span
              animate={animated && i < stars ? { 
                y: [0, -8, 0],
                transition: { delay: i * 0.15 + 0.6, repeat: Infinity, repeatDelay: 2, duration: 1 }
              } : undefined}
              className="inline-block"
            >
              ⭐
            </motion.span>
          ) : (
            <span className="opacity-25 grayscale">⭐</span>
          )}
        </motion.span>
      ))}
    </div>
  )
}

export default StarRating

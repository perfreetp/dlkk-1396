// @ts-nocheck
import React from 'react'
import { motion } from 'framer-motion'

type Variant = 'primary' | 'success' | 'danger' | 'info' | 'ghost'
type Size = 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-warm-400 hover:bg-warm-500 text-white shadow-candy',
  success: 'bg-mint-400 hover:bg-mint-500 text-white shadow-candy',
  danger: 'bg-tomato-500 hover:bg-tomato-600 text-white shadow-candy',
  info: 'bg-lavender-400 hover:bg-lavender-300 text-gray-700 shadow-candy',
  ghost: 'bg-white/80 hover:bg-white text-gray-700 border-2 border-cream-200',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-2xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
  xl: 'px-10 py-5 text-xl rounded-3xl',
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth,
  className = '',
  children,
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.96, y: 3 } : undefined}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`
        inline-flex items-center justify-center gap-2 font-happy
        transition-all duration-150 select-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="text-xl">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="text-xl">{rightIcon}</span>}
    </motion.button>
  )
}

export default Button

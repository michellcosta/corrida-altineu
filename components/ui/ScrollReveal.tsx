'use client'

import { motion } from 'framer-motion'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  once?: boolean
  amount?: number
}

const directionOffset = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  once = true,
  amount = 0.1,
}: ScrollRevealProps) {
  const offset = directionOffset[direction]
  const isVertical = direction === 'up' || direction === 'down'
  const offsetVal = isVertical ? (offset as { y: number }).y : (offset as { x: number }).x

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...(isVertical ? { y: offsetVal } : { x: offsetVal }),
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
      }}
      viewport={{ once, amount }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

'use client'

import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'subtle'
}

function Card({ className, variant = 'default', ...props }: CardProps) {
  const variants = {
    default:
      'bg-white border border-gray-100 shadow-card rounded-xl transition-shadow duration-200 hover:shadow-card-hover',
    elevated:
      'bg-white shadow-lg rounded-xl border border-gray-100/80 transition-shadow duration-200 hover:shadow-xl',
    outlined:
      'bg-white border border-gray-200 rounded-xl transition-colors duration-200 hover:border-gray-300',
    subtle:
      'bg-gray-50/80 border border-gray-100 rounded-xl transition-colors duration-200 hover:bg-gray-50',
  }

  return <div className={cn('p-6', variants[variant], className)} {...props} />
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4', className)} {...props} />
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props} />
  )
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-gray-500 mt-1', className)} {...props} />
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-100', className)} {...props} />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }

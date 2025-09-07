/**
 * Loading Spinner - Reusable loading component
 * 
 * Provides consistent loading states across the application
 */

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8'
}

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text = 'Loading...' 
}: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className={cn(sizeClasses[size], 'animate-spin mx-auto mb-4', className)} />
        {text && (
          <p className="text-sm text-gray-600">{text}</p>
        )}
      </div>
    </div>
  )
}
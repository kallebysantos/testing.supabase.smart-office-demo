'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface DemoAuthGuardProps {
  children: React.ReactNode
}

const publicPaths = ['/', '/login']

export default function DemoAuthGuard({ children }: DemoAuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && !publicPaths.includes(pathname)) {
      router.push('/login')
    }
  }, [user, loading, pathname, router])

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // If on a protected route and no user, don't render anything (redirect is happening)
  if (!user && !publicPaths.includes(pathname)) {
    return null
  }

  return <>{children}</>
}

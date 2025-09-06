'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Building2, Mail, Lock, Eye, EyeOff, User, Wrench, ChevronDown, ChevronUp } from 'lucide-react'

const demoUser = {
  id: 'facilities-demo',
  email: 'hermione.granger@company.com',
  full_name: 'Hermione Granger',
  department: 'Facilities Management', 
  role: 'facilities' as const,
  floor_access: [1, 2, 3, 4],
  description: 'Analytics, alerts, all bookings, full sensor data access'
}

export default function SignUpPage() {
  const router = useRouter()
  const [showDemoAccounts, setShowDemoAccounts] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const handleDemoLogin = async () => {
    setIsLoggingIn(true)
    
    // Simulate login process
    setTimeout(() => {
      // Store the demo user in localStorage for the demo
      localStorage.setItem('demo-user', JSON.stringify(demoUser))
      
      // Redirect to rooms
      router.push('/rooms')
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Company Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Smart Office Dashboard</h1>
          </div>
          <p className="text-lg font-semibold text-gray-700">Dewey, Cheatham & Howe</p>
          <p className="text-sm text-gray-500">Conference Room Management System</p>
        </div>

        {/* Sign Up Form (Supabase UI Mockup) */}
        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Sign up for access to the conference room dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  disabled
                />
              </div>
            </div>

            <Button className="w-full" disabled>
              Create Account
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-100 px-2 text-gray-500">Or use demo access</span>
          </div>
        </div>

        {/* Demo Access Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Demo
              </Badge>
              <span>Quick Access</span>
            </CardTitle>
            <CardDescription className="text-blue-700">
              Skip the signup form and explore the dashboard immediately
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              disabled={isLoggingIn}
            >
              <span>Show Demo Account</span>
              {showDemoAccounts ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showDemoAccounts && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-orange-100">
                      <Wrench className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{demoUser.full_name}</p>
                      <p className="text-xs text-gray-500">{demoUser.email}</p>
                      <Badge 
                        variant="outline" 
                        className="mt-1 text-xs bg-orange-100 text-orange-800 border-orange-200"
                      >
                        Facilities Manager
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1 max-w-48">
                        {demoUser.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleDemoLogin}
                    disabled={isLoggingIn}
                    className="shrink-0"
                  >
                    {isLoggingIn ? 'Signing In...' : 'Enter Dashboard'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Demo Application - No real registration required</p>
          <p className="mt-1">Built for enterprise tradeshow demonstrations</p>
        </div>
      </div>
    </div>
  )
}
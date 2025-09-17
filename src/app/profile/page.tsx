'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, User, Building, Users, Wrench, Shield, CheckCircle } from 'lucide-react'
import NavigationMenu from '@/components/navigation/NavigationMenu'

export default function ProfilePage() {
  const { user, userProfile, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(userProfile?.full_name || '')
  const [department, setDepartment] = useState(userProfile?.department || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const { error } = await (supabase as any)
        .from('user_profiles')
        .update({
          full_name: fullName,
          department: department,
        })
        .eq('id', user.id)
      /* eslint-enable @typescript-eslint/no-explicit-any */

      if (error) {
        throw error
      }

      await refreshProfile()
      setMessage('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage('Error updating profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const initials = userProfile.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'

  const roleConfig = {
    employee: { label: 'Employee', icon: Users, color: 'bg-green-100 text-green-800' },
    facilities: { label: 'Facilities Staff', icon: Wrench, color: 'bg-orange-100 text-orange-800' },
    admin: { label: 'Administrator', icon: Shield, color: 'bg-red-100 text-red-800' }
  }

  const roleInfo = roleConfig[userProfile.role as keyof typeof roleConfig]
  const RoleIcon = roleInfo?.icon || User

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationMenu />
      
      <main className="md:ml-64">
        <div className="px-4 py-8 md:px-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </div>

            {/* Profile Overview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xl font-semibold">{userProfile.full_name || 'User'}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Role */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Role</Label>
                    <div className="mt-1">
                      <Badge className={`text-sm ${roleInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                        <RoleIcon className="h-4 w-4 mr-2" />
                        {roleInfo?.label || 'Unknown'}
                      </Badge>
                    </div>
                  </div>

                  {/* Department */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Department</Label>
                    <p className="mt-1 text-sm text-gray-900">
                      {userProfile.department || 'Not specified'}
                    </p>
                  </div>

                  {/* Floor Access */}
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Floor Access</Label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {userProfile.floor_access?.map((floor) => (
                        <Badge key={floor} variant="outline" className="text-xs">
                          <Building className="h-3 w-3 mr-1" />
                          Floor {floor}
                        </Badge>
                      )) || (
                        <span className="text-sm text-gray-500">No floor access configured</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>
                  Update your personal information. Role and floor access are managed by administrators.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed. Contact an administrator if needed.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Enter your department"
                      className="mt-1"
                    />
                  </div>

                  {message && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Read-only account details and system information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium text-gray-700">User ID</Label>
                    <p className="mt-1 font-mono text-xs text-gray-600 break-all">{user.id}</p>
                  </div>
                  <div>
                    <Label className="font-medium text-gray-700">Account Created</Label>
                    <p className="mt-1 text-gray-600">
                      {userProfile.created_at ? 
                        new Date(userProfile.created_at).toLocaleDateString() : 
                        'Unknown'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium text-gray-700">Account Created</Label>
                    <p className="mt-1 text-gray-600">
                      {userProfile.created_at ?
                        new Date(userProfile.created_at).toLocaleString() :
                        'Unknown'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
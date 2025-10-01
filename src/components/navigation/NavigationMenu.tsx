'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { UserSwitcherDialog } from '@/components/auth/UserSwitcherDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Building2,
  BarChart3,
  Calendar,
  AlertTriangle,
  User,
  LogOut,
  Menu,
  Home,
  Users,
  Wrench,
  Shield,
  ArrowRightLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: ('employee' | 'facilities' | 'admin')[]
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['employee', 'facilities', 'admin'],
    description: 'Overview and quick stats'
  },
  {
    title: 'Rooms',
    href: '/rooms',
    icon: Building2,
    roles: ['employee', 'facilities', 'admin'],
    description: 'Live room occupancy and booking'
  },
  {
    title: 'My Bookings',
    href: '/bookings',
    icon: Calendar,
    roles: ['employee'],
    description: 'Your scheduled meetings'
  },
  {
    title: 'Bookings',
    href: '/bookings',
    icon: Calendar,
    roles: ['facilities', 'admin'],
    description: 'All room reservations'
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['facilities', 'admin'],
    description: 'Usage patterns and insights'
  },
  {
    title: 'Alerts',
    href: '/alerts',
    icon: AlertTriangle,
    roles: ['facilities', 'admin'],
    description: 'Capacity violations and service tickets'
  }
]

function NavigationLink({ item, pathname, onClick }: {
  item: NavigationItem
  pathname: string
  onClick?: () => void
}) {
  const isActive = pathname === item.href
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.title}</span>
    </Link>
  )
}

function RoleBadge({ role }: { role: string }) {
  const roleConfig = {
    employee: { label: 'Employee', icon: Users, color: 'bg-green-100 text-green-800' },
    facilities: { label: 'Facilities', icon: Wrench, color: 'bg-orange-100 text-orange-800' },
    admin: { label: 'Admin', icon: Shield, color: 'bg-red-100 text-red-800' }
  }

  const config = roleConfig[role as keyof typeof roleConfig]
  if (!config) return null

  const Icon = config.icon

  return (
    <Badge className={cn('text-xs', config.color)}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}

export default function NavigationMenu() {
  const { user, userProfile, signOut } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false)

  if (!user || !userProfile) {
    return null
  }

  const allowedItems = navigationItems.filter(item =>
    item.roles.includes(userProfile.role)
  )

  const initials = userProfile.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'

  const handleSignOut = async () => {
    await signOut()
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center flex-shrink-0 px-4">
            <Building2 className="h-8 w-8 text-primary" />
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">Smart Office</h1>
              <p className="text-xs text-gray-500">Dewey, Cheatham & Howe</p>
            </div>
          </div>

          {/* User Info - Clickable for user switching */}
          <div className="px-4 mt-6">
            <button
              onClick={() => setIsUserSwitcherOpen(true)}
              className="w-full group hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="flex items-center">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-primary">
                    {userProfile.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userProfile.department || 'Department'}
                  </p>
                  <div className="mt-1">
                    <RoleBadge role={userProfile.role} />
                  </div>
                </div>
                <ArrowRightLeft className="h-4 w-4 text-gray-400 group-hover:text-primary" />
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {allowedItems.map((item) => (
              <NavigationLink
                key={item.href}
                item={item}
                pathname={pathname}
              />
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="flex-shrink-0 px-2 py-4 space-y-2">
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="ml-2 text-lg font-semibold">Smart Office</h1>
            </div>

            <div className="flex items-center space-x-3">
              <RoleBadge role={userProfile.role} />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{userProfile.full_name}</p>
                    <p className="text-xs text-gray-500">{userProfile.department}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-4 py-6">
                      <div className="flex items-center">
                        <Building2 className="h-8 w-8 text-primary" />
                        <div className="ml-3">
                          <h1 className="text-lg font-semibold">Smart Office</h1>
                          <p className="text-xs text-gray-500">Dewey, Cheatham & Howe</p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-2 space-y-1">
                      {allowedItems.map((item) => (
                        <NavigationLink
                          key={item.href}
                          item={item}
                          pathname={pathname}
                          onClick={closeMobileMenu}
                        />
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Padding for Desktop */}
      <div className="hidden md:block md:pl-64">
        {/* This div provides padding for the fixed sidebar */}
      </div>

      {/* User Switcher Dialog */}
      <UserSwitcherDialog
        open={isUserSwitcherOpen}
        onOpenChange={setIsUserSwitcherOpen}
      />
    </>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Plus, User, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  isAdmin?: boolean
  isAuthenticated?: boolean
}

export function BottomNav({ isAdmin = false, isAuthenticated = false }: BottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/',
      icon: Map,
      label: 'Explore',
      active: pathname === '/',
    },
    {
      href: isAuthenticated ? '/submit' : '/auth/login',
      icon: Plus,
      label: 'Submit',
      active: pathname === '/submit',
    },
    ...(isAdmin ? [{
      href: '/admin',
      icon: Shield,
      label: 'Admin',
      active: pathname.startsWith('/admin'),
    }] : []),
    {
      href: isAuthenticated ? '/profile' : '/auth/login',
      icon: User,
      label: isAuthenticated ? 'Profile' : 'Login',
      active: pathname === '/profile' || pathname.startsWith('/auth'),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-pb">
      <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors',
              item.active
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

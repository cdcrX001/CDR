'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export function NavBar() {
  const pathname = usePathname()
  const [userEmail, setUserEmail] = useState('')
  const { setUser, setIsAuthenticated } = useAuth();

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    supabase.auth.signOut()
    // Optionally, redirect to the home page
    window.location.href = '/'
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link 
            href="/" 
            className="text-lg font-semibold"
          >
            Data Clean Rooms
          </Link>
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard" 
              className={`${pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
            >
              Dashboard
            </Link>
            <Link 
              href="/explore" 
              className={`${pathname === '/explore' ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
            >
              Explore
            </Link>
            <Link 
              href="/history" 
              className={`${pathname === '/history' ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
            >
              History
            </Link>
          </div>
        </div>
        <div>
          {!isAuthenticated ? (
            <>
              <Link href="/auth/sign-in">
                <Button className="mr-2">Sign In</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="outline">Sign Up</Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">{userEmail}</span>
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}


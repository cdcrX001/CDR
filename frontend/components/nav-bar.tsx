'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWallet } from '@/context/wallet-context'

export function NavBar() {
  const pathname = usePathname()
  const { address, connect, disconnect } = useWallet()

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
              href="/" 
              className={`${pathname === '/' ? 'text-primary' : 'text-muted-foreground'} hover:text-primary transition-colors`}
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
          {!address ? (
            <Button onClick={connect}>
              Connect Wallet
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {address}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={disconnect}>
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}


"use client"

import { NavBar } from '@/components/nav-bar'
import "@/app/globals.css"
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {



  return (
    <AuthProvider>
      <html lang="en">
        <body>
          <NavBar />
          {children}
          <Toaster />
        </body>
      </html>
    </AuthProvider>
  )
}


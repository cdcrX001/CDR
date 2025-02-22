"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SignInForm } from "@/components/SignInForm"
import { SignUpForm } from "@/components/SignUpForm"
import { CreateRoomDialog } from "@/components/create-room-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {showSignUp ? 'Create an account' : 'Welcome back'}
          </CardTitle>
          <CardDescription>
            {showSignUp 
              ? 'Enter your email to create your account' 
              : 'Enter your email to sign in to your account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showSignUp ? <SignUpForm /> : <SignInForm />}
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => setShowSignUp(!showSignUp)}
            >
              {showSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </Button>
          </div>
        </CardContent>
      </Card>
      <CreateRoomDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </main>
  )
}


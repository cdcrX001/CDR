"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { SignInForm } from "@/components/SignInForm"
import { SignUpForm } from "@/components/SignUpForm"
import { CreateRoomDialog } from "@/components/create-room-dialog"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Import the Supabase client
import { signInSchema, signUpSchema } from '@/lib/validation'; // Import the validation schemas
import { z } from 'zod';
// import { useSetRecoilState } from 'recoil';
import { authState } from '@/lib/atoms'; // Import the auth atom
// import { useRecoilValue } from 'recoil';
export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  // const setAuthState = useSetRecoilState(authState); // Get the setter for auth state
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log(user)
      if (user) {
        if (!user.email_confirmed_at) {
          // If email is not confirmed, redirect to confirmation page
          router.push('/confirm-email');
        } else {
          // If authenticated and email is confirmed, redirect to the dashboard
          router.push('/dashboard');
        }
      } else {
        setLoading(false);
        console.log("user is not authenticated")
        router.push('/auth/sign-in')
        // and set the user object in the recoil state
        // setAuthState({ isAuthenticated: false, user: null });
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }


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
          {showSignUp ? (
            <SignUpForm  />
          ) : (
            <SignInForm />
          )}
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </CardContent>
      </Card>
      {/* <CreateRoomDialog open={dialogOpen} onOpenChange={setDialogOpen} /> */}
    </main>
  )
}


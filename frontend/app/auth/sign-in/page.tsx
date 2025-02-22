"use client"

import { SignInForm } from "@/components/SignInForm";
import { useState } from "react"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
export default function SignInPage() {
  const [error, setError] = useState("");
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  if (isAuthenticated) {
    router.push('/dashboard')
  } 
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          Welcome Back
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SignInForm />
        <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => router.push('/auth/sign-up')}
            >

                 "Don't have an account? Sign up"
    
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
      </CardContent>
    </Card>
  );
} 


{/* <Card className="w-full max-w-md">
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
</Card> */}
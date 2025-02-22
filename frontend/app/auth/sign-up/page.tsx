"use client"

import { SignUpForm } from "@/components/SignUpForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";

export default function SignUpPage() {
  const [error, setError] = useState('')
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    router.push('/dashboard')
  }
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          Create an Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SignUpForm />
        <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => router.push('/auth/sign-in')}
            >
          
              'Already have an account? Sign in' 
                
         
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
      </CardContent>
    </Card>
  );
} 
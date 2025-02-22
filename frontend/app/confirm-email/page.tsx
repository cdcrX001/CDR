"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ConfirmEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  useEffect(() => {
    // Check if the user has confirmed their email
    const token = localStorage.getItem('token');
    if (token) {
      // Here you would typically check the token validity or confirmation status
      // For now, we'll simulate that the email is confirmed after a certain time
      setTimeout(() => {
        setEmailConfirmed(true);
        setLoading(false);
      }, 5000); // Simulate a delay for confirmation
    } else {
      // If no token, redirect to the login page
      router.push('/');
    }
  }, [router]);

  const handleResendConfirmation = async () => {
    // Logic to resend confirmation email
    // This would typically involve calling your backend API
    alert("Confirmation email resent!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <h1 className="text-2xl font-bold">Checking your email confirmation...</h1>
      </div>
    );
  }

  if (emailConfirmed) {
    // Redirect to the dashboard or another page after confirmation
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <h1 className="text-2xl font-bold">Please confirm your email</h1>
      <p className="mt-2">Check your inbox for a confirmation link.</p>
      <Button onClick={handleResendConfirmation} className="mt-4">
        Resend Confirmation Email
      </Button>
    </div>
  );
}

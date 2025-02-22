'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { useRouter } from 'next/navigation'; // Changed from 'next/router'

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to sign up');
      }

      // Show success message and redirect to sign in
      alert('Please check your email to verify your account');
      router.push('/signin');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full">Sign Up</Button>
    </form>
  );
} 
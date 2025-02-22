'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Import the Supabase client
import { signInSchema } from '@/lib/validation'; // Import the validation schema
import { z } from 'zod';
import { useAuth } from '@/lib/AuthContext'; // Import the useAuth hook
import { Eye, EyeOff } from 'lucide-react'; // Import eye icons

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useAuth(); // Get setters from context
  const [loading, setLoading] = useState(false); // Loading state
  const [showPassword, setShowPassword] = useState(false); // State for showing password

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Set loading to true

    // Validate input
    try {
      signInSchema.parse({ email, password }); // Validate using Zod
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors.map(e => e.message).join(", "));
        return;
      }
    }

    try {
      const { user, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw new Error(signInError.message);

      // Update context state
      setUser(user);
      setIsAuthenticated(true);
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"} // Toggle password visibility
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing In..." : "Sign In"} {/* Show loading text */}
      </Button>
    </form>
  );
} 
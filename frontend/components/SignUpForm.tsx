'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { useRouter } from 'next/navigation'; // Changed from 'next/router'
import { supabase } from '@/lib/supabaseClient'; // Import the Supabase client
import { signUpSchema } from '@/lib/validation'; // Import the validation schema
import { z } from 'zod';
import { useAuth } from '@/lib/AuthContext'; // Import the useAuth hook
// import { useSetRecoilState } from 'recoil';
import { authState } from '@/lib/atoms'; // Import the auth atom
import { Eye, EyeOff } from 'lucide-react'; // Import eye icons

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const [showPassword, setShowPassword] = useState(false); // State for showing password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for showing confirm password
  const router = useRouter();
  const { setUser, setIsAuthenticated } = useAuth(); // Get setters from context

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate input
    try {
      signUpSchema.parse({ email, password }); // Validate using Zod

      // Check if passwords match
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors.map(e => e.message).join(", "));
        return;
      }
    }

    setLoading(true); // Set loading to true

    try {
      const { user, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw new Error(signUpError.message);

      // Update context state
      setUser(user);
      setIsAuthenticated(true);
      // Redirect to confirmation email page
      router.push('/confirm-email');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false); // Reset loading state
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
      <div className="relative">
        <Input
          type={showConfirmPassword ? "text" : "password"} // Toggle confirm password visibility
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing Up..." : "Sign Up"} {/* Show loading text */}
      </Button>
    </form>
  );
} 
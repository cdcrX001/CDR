import { z } from 'zod';

export const emailSchema = z.string().email("Invalid email address").nonempty("Email is required");
export const passwordSchema = z.string().min(6, "Password must be at least 6 characters long").nonempty("Password is required");

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
}); 
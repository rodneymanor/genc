'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation'; 
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/login-form"; // Import the new AuthForm

export default function SignupPage() { // Renamed component for clarity
  const router = useRouter();
  const { signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      // The signup function from AuthContext now handles Firestore profile creation
      await signup(email, password, firstName, lastName);
      router.push('/'); // Redirect to a dashboard or home page after successful signup
    } catch (err: any) {
      console.error('Signup Page handleSubmit Error:', err);
      let errorMessage = "Failed to create an account. Please try again.";
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please login or use a different email.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "The password is too weak. Please choose a stronger password.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthForm 
      mode="signup"
      onSubmit={handleSignupSubmit}
      error={error}
      loading={loading}
      // Logo props are handled by AuthForm defaults
    />
  );
}

'use client';

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/login-form"; // Import the new AuthForm

export default function LoginPage() { // Renamed component for clarity
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Added isMounted state

  useEffect(() => {
    setIsMounted(true); // Set to true after component mounts
  }, []);

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      router.push('/'); 
    } catch (err: any) {
      console.error('Login Page handleSubmit Error:', err);
      // Check for specific Firebase error codes if needed, e.g., err.code === 'auth/user-not-found'
      let errorMessage = "Failed to login. Please check your credentials.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (!isMounted) {
    // Return null or a basic loader on the server and initial client render
    return null; 
  }

  return (
    <AuthForm 
      mode="login"
      onSubmit={handleLoginSubmit}
      error={error}
      loading={loading}
      // Logo props are handled by AuthForm defaults unless overridden here
    />
  );
}

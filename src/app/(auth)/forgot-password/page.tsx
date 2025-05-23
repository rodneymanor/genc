'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/login-form"; // Import the AuthForm
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For success message
import { CheckCircle } from "lucide-react"; // For success icon

export default function ForgotPasswordPage() {
  const { sendPasswordResetEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // To gate client-side only rendering

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleForgotPasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    if (!email) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(email);
      setSuccessMessage("Password reset email sent! Please check your inbox (and spam folder).");
    } catch (err: any) {
      console.error('Forgot Password Page handleSubmit Error:', err);
      let errorMessage = "Failed to send password reset email. Please try again.";
      if (err.code === 'auth/user-not-found') {
        errorMessage = "No user found with this email address.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (!isMounted) {
    // Render nothing or a placeholder on the server and initial client render before hydration
    // This ensures the server and initial client render match.
    // AuthForm itself is designed to be centered, so it should be fine as the sole top-level element after mount.
    return null; // Or a basic loading spinner that doesn't involve complex conditional structures
  }

  return (
    <>
      {successMessage && (
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-4 z-50">
          <Alert variant="default" className="bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-500/50 text-green-700 dark:text-green-300">
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
            <AlertTitle className="font-semibold">Success!</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        </div>
      )}
      <AuthForm 
        mode="forgot-password"
        onSubmit={handleForgotPasswordSubmit}
        error={error}
        loading={loading}
        // The AuthForm itself has a wrapper div that centers it, so no extra div here unless needed for the Alert
      />
    </>
  );
} 
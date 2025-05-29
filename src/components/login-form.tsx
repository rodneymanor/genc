import Link from "next/link";
import Image from "next/image"; // For the logo
import { cn } from "@/lib/utils"; // Corrected path for cn
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons"; // For spinner
import React from "react"; // Import React for types like FormEvent

export type AuthFormMode = "login" | "signup" | "forgot-password";

interface AuthFormProps {
  className?: string; // Make className optional, as it's for the div wrapper
  mode: AuthFormMode;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>; // This is for the form element
  error?: string | null;
  loading?: boolean;
  logoSrc?: string;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;
  // Any other specific props for the AuthForm itself, not for the div
}

export function AuthForm({
  className, // This className is for the root div
  mode,
  onSubmit, // This onSubmit is for the form
  error,
  loading,
  logoSrc = "/scribo-logo.png", 
  logoAlt = "Scribo Logo",
  logoWidth = 120,
  logoHeight = 30,
  // Removed ...props as we are not extending HTMLAttributes directly for AuthFormProps
}: AuthFormProps) {
  let title = "Login";
  let description = "Enter your email below to login to your account";
  let submitButtonText = "Login";
  let showForgotPasswordLink = true;
  let showEmailField = true;
  let showPasswordField = true;
  let showConfirmPasswordField = false;
  let showFirstNameField = false;
  let showLastNameField = false;
  let bottomLinkText = "Don't have an account?";
  let bottomLinkHref = "/signup";
  let bottomLinkActionText = "Sign up";
  let showGoogleLogin = true;

  if (mode === "signup") {
    title = "Create an account";
    description = "Enter your information to create an account";
    submitButtonText = "Create account";
    showForgotPasswordLink = false;
    showConfirmPasswordField = true;
    showFirstNameField = true;
    showLastNameField = true;
    bottomLinkText = "Already have an account?";
    bottomLinkHref = "/login";
    bottomLinkActionText = "Login";
    showGoogleLogin = false; // Or keep true if you implement Google Sign Up
  } else if (mode === "forgot-password") {
    title = "Reset your password";
    description = "Enter your email to receive a password reset link";
    submitButtonText = "Send reset link";
    showPasswordField = false;
    showForgotPasswordLink = false;
    bottomLinkText = "Remembered your password?";
    bottomLinkHref = "/login";
    bottomLinkActionText = "Login";
    showGoogleLogin = false;
  }

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-screen py-6 md:py-10", className)} /* Removed {...props} */ >
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          {logoSrc && (
            <div className="flex justify-center mb-4">
              <Image 
                src={logoSrc}
                alt={logoAlt}
                width={logoWidth}
                height={logoHeight}
                priority
              />
            </div>
          )}
          <CardTitle className="text-2xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}> {/* onSubmit prop is correctly used on the <form> element */}
            <div className="flex flex-col gap-4">
              {error && (
                 <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-md flex items-center gap-x-2 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/50">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <p>{error}</p>
                  </div>
              )}
              {showFirstNameField && (
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Your first name"
                    required
                    disabled={loading}
                  />
                </div>
              )}
              {showLastNameField && (
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Your last name"
                    required
                    disabled={loading}
                  />
                </div>
              )}
              {showEmailField && (
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email" // Add name attribute for form handling
                    type="email"
                    placeholder="name@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              )}
              {showPasswordField && (
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {showForgotPasswordLink && (
                      <Link
                        href="/forgot-password" // Corrected link for forgot password
                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-primary hover:text-primary/80"
                      >
                        Forgot your password?
                      </Link>
                    )}
                  </div>
                  <Input 
                    id="password" 
                    name="password" // Add name attribute
                    type="password" 
                    required 
                    disabled={loading} 
                    placeholder="••••••••"
                  />
                </div>
              )}
              {showConfirmPasswordField && (
                 <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" // Add name attribute
                      type="password" 
                      required 
                      disabled={loading}
                      placeholder="••••••••"
                    />
                  </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> 
                    Processing...
                  </>
                ) : (
                  submitButtonText
                )}
              </Button>
              {showGoogleLogin && mode === 'login' && (
                <Button variant="outline" className="w-full" type="button" disabled={loading}>
                  <Icons.google className="mr-2 h-4 w-4" /> {/* Assuming Icons.google exists */}
                  Login with Google
                </Button>
              )}
            </div>
            {bottomLinkHref && bottomLinkText && bottomLinkActionText && (
              <div className="mt-4 text-center text-sm">
                {bottomLinkText}{" "}
                <Link href={bottomLinkHref} className="underline underline-offset-4 text-primary hover:text-primary/80">
                  {bottomLinkActionText}
                </Link>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

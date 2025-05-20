'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from 'next/navigation'; // For redirecting after signup

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
import { useAuth } from "@/contexts/AuthContext";
import { createDocument } from "@/lib/firestore"; // Import createDocument
import { Icons } from "@/components/icons"; // Assuming you have an AlertTriangle icon here
import type { Timestamp } from 'firebase/firestore'; // Import Timestamp if not already

// Interface for common data structure (mirroring BaseDocument for clarity or extending it)
interface BaseDocument {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Define a type for user data to be stored in Firestore
interface UserProfileData extends BaseDocument { // Explicitly extend BaseDocument
  uid: string;
  firstName: string;
  lastName: string;
  email: string; // Ensure this doesn't conflict with a potential email in BaseDocument if generalized
  role: string;
}

export default function SignupForm() { // Renamed component for clarity
  const router = useRouter();
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signup(email, password);
      const user = userCredential.user;

      // Store additional user data in Firestore
      await createDocument<UserProfileData>('users', {
        uid: user.uid,
        firstName,
        lastName,
        email: user.email!, 
        role: 'creator', 
      });

      router.push('/'); // Redirect to a dashboard or home page after successful signup
    } catch (err: any) {
      console.error('Signup Page handleSubmit Error:', err); // Log the full error object
      setError(err.message || 'Failed to create an account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
              {/* <Icons.alertTriangle className="h-4 w-4" /> Removed for now, add if available */}
              <p>{error}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First name</Label>
              <Input 
                id="first-name" 
                placeholder="Max" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input 
                id="last-name" 
                placeholder="Robinson" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required 
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required // Added required for password
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create an account'}
          </Button>
          {/* Optionally, keep or modify social sign up buttons */}
          {/* <Button variant="outline" className="w-full" disabled={loading}>
            <Icons.google className="mr-2 h-4 w-4" />
            Sign up with Google
          </Button>
          <Button variant="outline" className="w-full" disabled={loading}>
             <Icons.github className="mr-2 h-4 w-4" />
            Sign up with GitHub
          </Button> */}
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

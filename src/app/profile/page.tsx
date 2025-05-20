'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
  const { currentUser, userProfile, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser) {
    // You can show a loading spinner here
    return <p>Loading...</p>;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login'); // Redirect to login after logout
    } catch (error) {
      console.error("Failed to logout:", error);
      // Handle logout error (e.g., show a notification)
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">User Profile</CardTitle>
          <CardDescription>
            View and manage your profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {userProfile ? (
            <>
              <div className="grid gap-1">
                <Label>Full Name</Label>
                <p className="text-sm font-medium">
                  {userProfile.firstName} {userProfile.lastName}
                </p>
              </div>
              <div className="grid gap-1">
                <Label>Email</Label>
                <p className="text-sm font-medium">{userProfile.email}</p>
              </div>
              <div className="grid gap-1">
                <Label>Role</Label>
                <p className="text-sm font-medium">{userProfile.role}</p>
              </div>
              {userProfile.createdAt && (
                <div className="grid gap-1">
                  <Label>Joined On</Label>
                  <p className="text-sm font-medium">
                    {new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString()}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p>Loading profile information...</p>
          )}
          <Button onClick={handleLogout} className="w-full mt-4" variant="outline">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 
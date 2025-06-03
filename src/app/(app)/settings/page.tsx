'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const { currentUser, userProfile, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Loading...</p>
      </div>
    );
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
    <div className="space-y-6 max-w-2xl">
      {/* Profile Section */}
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          View and manage your profile information.
        </p>
      </div>
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your account details and subscription status.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {userProfile ? (
            <>
              <div className="grid gap-1">
                <Label>Full Name</Label>
                <p className="text-sm font-medium">
                  {userProfile.displayName || 'Not provided'}
                </p>
              </div>
              <div className="grid gap-1">
                <Label>Email</Label>
                <p className="text-sm font-medium">{userProfile.email}</p>
              </div>
              <div className="grid gap-1">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={userProfile.subscriptionStatus === 'premium' ? 'default' : 'secondary'}>
                    {userProfile.subscriptionStatus || 'Free'}
                  </Badge>
                </div>
              </div>
              {userProfile.credits !== undefined && (
                <div className="grid gap-1">
                  <Label>Credits</Label>
                  <p className="text-sm font-medium">{userProfile.credits}</p>
                </div>
              )}
              {userProfile.createdAt && (
                <div className="grid gap-1">
                  <Label>Member Since</Label>
                  <p className="text-sm font-medium">
                    {new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString()}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p>Loading profile information...</p>
          )}
        </CardContent>
      </Card>

      {/* Account Actions Section */}
      <div>
        <h3 className="text-lg font-medium">Account</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>
            Manage your account settings and security.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button onClick={handleLogout} variant="outline" className="w-fit">
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Additional Settings Sections */}
      <div>
        <h3 className="text-lg font-medium">Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Customize your experience.
        </p>
      </div>
      <Separator />
      
      <Card>
        <CardHeader>
          <CardTitle>Application Preferences</CardTitle>
          <CardDescription>
            Configure how the application behaves.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-sm text-muted-foreground">
            Additional preference settings will be added here in future updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 
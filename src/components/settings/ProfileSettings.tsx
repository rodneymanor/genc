'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateDocument, COLLECTIONS } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit2, Save, X, Loader2, Check } from 'lucide-react';

export default function ProfileSettings() {
  const { currentUser, userProfile, logout, fetchUserProfile } = useAuth();
  const { toast } = useToast();
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [nameError, setNameError] = useState('');

  // Load current full name when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || userProfile.displayName || '');
    }
  }, [userProfile]);

  const handleEditName = () => {
    setIsEditingName(true);
    setNameError('');
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setFullName(userProfile?.fullName || userProfile?.displayName || '');
    setNameError('');
  };

  const handleSaveName = async () => {
    if (!currentUser) return;

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setNameError('Full name is required.');
      return;
    }

    if (trimmedName.length < 2) {
      setNameError('Full name must be at least 2 characters.');
      return;
    }

    setIsSaving(true);
    setNameError('');

    try {
      await updateDocument(COLLECTIONS.USERS, currentUser.uid, {
        fullName: trimmedName,
        displayName: trimmedName, // Also update displayName for consistency
      });

      // Refresh user profile to show updated data
      await fetchUserProfile(currentUser.uid);
      setIsEditingName(false);
      
      // Show brief success state
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
      
      // Show success toast
      toast({
        title: "Profile updated",
        description: "Your full name has been saved successfully.",
        duration: 3000,
      });
      
      console.log('Full name updated successfully!');
    } catch (error) {
      console.error('Error updating full name:', error);
      setNameError('Failed to update name. Please try again.');
      
      // Show error toast
      toast({
        title: "Update failed",
        description: "Failed to update your name. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // The overlay will close automatically when the user state changes
    } catch (error) {
      console.error("Failed to logout:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Please log in to access profile settings.</p>
      </div>
    );
  }

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
              <div className="grid gap-2">
                <Label>Full Name</Label>
                {isEditingName ? (
                  <div className="space-y-2">
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={isSaving}
                      className={nameError ? 'border-red-500' : ''}
                    />
                    {nameError && (
                      <p className="text-sm text-red-500">{nameError}</p>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSaveName} 
                        disabled={isSaving || justSaved}
                        size="sm"
                        className={`h-8 ${justSaved ? 'bg-green-600 hover:bg-green-600' : ''}`}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Saving...
                          </>
                        ) : justSaved ? (
                          <>
                            <Check className="mr-1 h-3 w-3" />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Save className="mr-1 h-3 w-3" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={handleCancelEdit} 
                        variant="outline" 
                        size="sm"
                        disabled={isSaving}
                        className="h-8"
                      >
                        <X className="mr-1 h-3 w-3" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {userProfile.fullName || userProfile.displayName || 'Not provided'}
                    </p>
                    <Button 
                      onClick={handleEditName} 
                      variant="ghost" 
                      size="sm"
                      className="h-8 px-2"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
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
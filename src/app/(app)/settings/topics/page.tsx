'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateDocument, COLLECTIONS } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, Check } from 'lucide-react';

export default function TopicsPage() {
  const { currentUser, userProfile, fetchUserProfile } = useAuth();
  const { toast } = useToast();
  const [overview, setOverview] = useState('');
  const [topicsDescription, setTopicsDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load existing data when component mounts or userProfile changes
  useEffect(() => {
    if (userProfile) {
      setOverview(userProfile.overview || '');
      // Handle both old array format and new string format
      if (userProfile.topics) {
        if (Array.isArray(userProfile.topics)) {
          // Convert old array format to description for backward compatibility
          setTopicsDescription(userProfile.topics.join(', '));
        } else if (typeof userProfile.topics === 'string') {
          setTopicsDescription(userProfile.topics);
        }
      }
    }
  }, [userProfile]);

  // Track changes
  useEffect(() => {
    const originalOverview = userProfile?.overview || '';
    const originalTopics = userProfile?.topics || '';
    // Handle both old array format and new string format for comparison
    const originalTopicsString = Array.isArray(originalTopics) ? originalTopics.join(', ') : originalTopics;

    const overviewChanged = overview !== originalOverview;
    const topicsChanged = topicsDescription !== originalTopicsString;

    setHasChanges(overviewChanged || topicsChanged);
  }, [overview, topicsDescription, userProfile]);

  const handleSave = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    try {
      await updateDocument(COLLECTIONS.USERS, currentUser.uid, {
        overview: overview.trim() || undefined,
        topics: topicsDescription.trim() || undefined,
      });

      // Refresh user profile
      await fetchUserProfile(currentUser.uid);
      
      // Show success toast
      toast({
        title: "Topics updated",
        description: "Your overview and topics have been saved successfully.",
        duration: 3000,
      });
      
      console.log('Topics and overview saved successfully!');
      setHasChanges(false);
      
      // Show brief success state
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (error) {
      console.error('Error saving topics:', error);
      
      // Show error toast
      toast({
        title: "Save failed",
        description: "Failed to save your topics. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      
      // Keep alert as backup for critical errors
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium">Topics & Overview</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about yourself and the topics you create content about. This helps us generate better, more personalized trending ideas for you.
        </p>
      </div>
      <Separator />

      {/* Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Overview</CardTitle>
          <CardDescription>
            A brief description of you - think of it as your elevator pitch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="overview">Overview</Label>
            <Textarea
              id="overview"
              placeholder="e.g., I'm a productivity coach who helps busy professionals optimize their workflows and achieve work-life balance..."
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              rows={4}
              className="resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {overview.length}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Topics Section */}
      <Card>
        <CardHeader>
          <CardTitle>Topics You Speak About</CardTitle>
          <CardDescription>
            Describe in plain English what topics you create content about. Our AI will extract relevant keywords and trending topics for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topics">Topics Description</Label>
            <Textarea
              id="topics"
              placeholder="e.g., I create content about productivity tips for remote workers, time management strategies, work-life balance, digital minimalism, and automation tools that help people get more done with less stress. I also talk about entrepreneurship, building habits, and personal development."
              value={topicsDescription}
              onChange={(e) => setTopicsDescription(e.target.value)}
              rows={6}
              className="resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {topicsDescription.length}/1000 characters • Be specific about your niche, audience, and content style
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || isSaving || justSaved}
          className={`min-w-[120px] ${justSaved ? 'bg-green-600 hover:bg-green-600' : ''}`}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : justSaved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 
"use client";

import React, { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { getUserScripts } from '@/lib/firestoreService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Timestamp } from 'firebase/firestore';
import { Loader2, BookOpen } from 'lucide-react';

const MyScriptsPage = () => {
  const [scripts, setScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userProfile } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (userProfile?.uid) {
      setIsLoading(true);
      getUserScripts(userProfile.uid)
        .then((fetchedScripts) => {
          setScripts(fetchedScripts);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching scripts:", err);
          setError("Failed to load scripts. Please try again later.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (userProfile === null) { // Explicitly check for null to know auth state is determined
      setIsLoading(false);
      // Potentially redirect to login or show a message
      // For now, just shows empty state if no user
      setError("Please log in to view your scripts.");
    }
    // Not waiting for userProfile being undefined (initial auth check state)
  }, [userProfile]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="ml-4 text-lg">Loading your scripts...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Scripts</h1>
        <Link href="/" passHref>
          <Button>Create New Script</Button>
        </Link>
      </div>

      {error && (
        <Card className="mb-6 bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && scripts.length === 0 && (
        <div className="text-center py-10">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Scripts Yet</h2>
          <p className="text-muted-foreground mb-6">
            It looks like you haven\'t saved any scripts. Get started by creating one!
          </p>
        </div>
      )}

      {scripts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scripts.map((script) => (
            <Card key={script.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="truncate">{script.title || 'Untitled Script'}</CardTitle>
                <CardDescription>
                  Last updated: {formatDate(script.updatedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {script.finalScriptText || script.videoIdea || 'No content yet.'}
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/?loadScriptId=${script.id}`)}
                >
                  Open Script
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyScriptsPage; 
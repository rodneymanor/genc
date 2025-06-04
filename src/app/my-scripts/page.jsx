"use client";

import React, { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { getUserScripts } from '@/lib/firestoreService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Timestamp } from 'firebase/firestore';
import { 
  Loader2, 
  BookOpen, 
  FileText, 
  TrendingUp, 
  Play, 
  ExternalLink,
  Calendar,
  User,
  BarChart3
} from 'lucide-react';

const LibraryPage = () => {
  const [scripts, setScripts] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, userProfile, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  // Fetch user scripts
  useEffect(() => {
    if (currentUser?.uid) {
      setIsLoadingScripts(true);
      getUserScripts(currentUser.uid)
        .then((fetchedScripts) => {
          setScripts(fetchedScripts);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching scripts:", err);
          setError("Failed to load scripts. Please try again later.");
        })
        .finally(() => {
          setIsLoadingScripts(false);
        });
    } else if (!authLoading) {
      setIsLoadingScripts(false);
    }
  }, [currentUser, authLoading]);

  // Fetch user analyses
  useEffect(() => {
    if (currentUser?.uid) {
      setIsLoadingAnalyses(true);
      fetch(`/api/get-user-analyses?userId=${currentUser.uid}`)
        .then(response => response.json())
        .then(data => {
          if (data.analyses) {
            setAnalyses(data.analyses);
    }
        })
        .catch((err) => {
          console.error("Error fetching analyses:", err);
          // Don't set error for analyses, just log it
        })
        .finally(() => {
          setIsLoadingAnalyses(false);
        });
    } else if (!authLoading) {
      setIsLoadingAnalyses(false);
    }
  }, [currentUser, authLoading]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="ml-4 text-lg">Checking authentication...</p>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!currentUser) {
    return null;
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 8) return "default";
    if (score >= 6) return "secondary";
    return "destructive";
  };

  return (
    <div className="w-full px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Library</h1>
          <p className="text-muted-foreground">Your created scripts and analyzed videos</p>
        </div>
        <div className="flex gap-2">
          <Link href="/analyze" passHref>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analyze Video
            </Button>
          </Link>
        <Link href="/" passHref>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Create Script
            </Button>
        </Link>
        </div>
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

      <Tabs defaultValue="scripts" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="scripts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Scripts ({scripts.length})
          </TabsTrigger>
          <TabsTrigger value="analyses" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analyses ({analyses.length})
          </TabsTrigger>
        </TabsList>

        {/* Scripts Tab */}
        <TabsContent value="scripts" className="space-y-6">
          {isLoadingScripts ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-4">Loading your scripts...</p>
            </div>
          ) : scripts.length === 0 ? (
        <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Scripts Yet</h2>
          <p className="text-muted-foreground mb-6">
                It looks like you haven&apos;t created any scripts. Get started by creating one!
          </p>
              <Link href="/" passHref>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Your First Script
                </Button>
              </Link>
        </div>
          ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scripts.map((script) => (
            <Card key={script.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="truncate">{script.title || 'Untitled Script'}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(script.updatedAt)}
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
                      onClick={() => router.push(`/ai-writer/${script.id}?loadScript=true`)}
                >
                      <Play className="h-4 w-4 mr-2" />
                  Open Script
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
        </TabsContent>

        {/* Analyses Tab */}
        <TabsContent value="analyses" className="space-y-6">
          {isLoadingAnalyses ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-4">Loading your analyses...</p>
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-10">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Analyses Yet</h2>
              <p className="text-muted-foreground mb-6">
                Start analyzing videos to see detailed script breakdowns and improvement suggestions.
              </p>
              <Link href="/analyze" passHref>
                <Button>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analyze Your First Video
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="truncate text-lg">
                        {analysis.metadata?.title ? 
                          (analysis.metadata.title.length > 50 ? 
                            `${analysis.metadata.title.substring(0, 50)}...` : 
                            analysis.metadata.title
                          ) : 
                          'Video Analysis'
                        }
                      </CardTitle>
                      {analysis.overallScore && (
                        <Badge variant={getScoreBadgeVariant(analysis.overallScore)}>
                          {analysis.overallScore}/10
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(analysis.createdAt)}
                      </div>
                      {analysis.metadata?.author && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {analysis.metadata.author}
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {analysis.metadata?.src_url && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Source:</p>
                        <a 
                          href={analysis.metadata.src_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1 truncate"
                        >
                          {analysis.metadata.src_url.replace(/^https?:\/\//, '')}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </div>
                    )}
                    {analysis.metadata?.duration && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground">
                          Duration: {Math.round(analysis.metadata.duration)}s
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/analyze/${analysis.id}`)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analysis
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LibraryPage; 
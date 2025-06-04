"use client";

import { useState, useEffect, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/AuthContext";
import { useTopBar } from "@/components/layout/TopBarProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Play, 
  FileText, 
  Target, 
  Zap, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  Share2,
  Copy,
  Edit,
  Wand2,
  BarChart3,
  Info,
  User,
  Clock
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const tabsData = [
  { name: "Video Info", value: "info", icon: Info },
  { name: "Transcript", value: "transcript", icon: FileText },
  { name: "Analysis", value: "analysis", icon: BarChart3 },
  { name: "Outline", value: "outline", icon: Target },
];

export default function AnalysisResultPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser, userProfile, loading: authLoading } = useContext(AuthContext);
  const { setTitle, setContextualButtons } = useTopBar();
  const analysisId = params.analysisId;
  
  const [analysis, setAnalysis] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Outline editing state
  const [editedComponents, setEditedComponents] = useState({});
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);
  const [generatedVariations, setGeneratedVariations] = useState(null);

  // Check authentication status
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (analysisId && currentUser) {
      loadAnalysis();
    }
  }, [analysisId, currentUser]);

  // Set up contextual buttons for this page
  useEffect(() => {
    setTitle('Analysis Result');
    setContextualButtons(
      <>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="px-2 py-1 h-8"
        >
          <Share2 size={14} className="mr-1" />
          Share
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {/* Add chat functionality */}}
          className="px-2 py-1 h-8"
        >
          <MessageSquare size={14} className="mr-1" />
          Chat
        </Button>
      </>
    );

    // Cleanup when component unmounts
    return () => {
      setTitle(undefined);
      setContextualButtons(undefined);
    };
  }, [setTitle, setContextualButtons]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated
  if (!currentUser) {
    return null;
  }

  const loadAnalysis = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/get-analysis/${analysisId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load analysis');
      }

      setAnalysis(data.analysis);
      setTranscript(data.transcript);
      setMetadata(data.metadata);
      
      // Initialize edited components with current analysis
      if (data.analysis?.components) {
        setEditedComponents({
          hook: data.analysis.components.hook.content || "",
          goldenNugget: data.analysis.components.goldenNugget.content || "",
          callToAction: data.analysis.components.callToAction.content || "",
          bridge: data.analysis.components.bridge.content || ""
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Video Script Analysis',
          text: `Check out this video script analysis - scored ${analysis?.overallScore}/10`,
          url: window.location.href,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  const handleGenerateVariations = async () => {
    try {
      setIsGeneratingVariations(true);
      const response = await fetch('/api/generate-script-variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalTranscript: transcript,
          editedComponents,
          originalAnalysis: analysis
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate variations');
      }

      setGeneratedVariations(data.variations);
    } catch (err) {
      alert(`Error generating variations: ${err.message}`);
    } finally {
      setIsGeneratingVariations(false);
    }
  };

  const copyScriptToClipboard = (script) => {
    navigator.clipboard.writeText(script).then(() => {
      alert("Script copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy script: ", err);
      alert("Failed to copy script.");
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/analyze')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Analyzer
        </Button>
      </div>
    );
  }

  const videoTitle = metadata?.title || 'Video Analysis';

  return (
    <TooltipProvider>
      <div className="flex flex-col w-full space-y-4 md:space-y-6 pb-12">
        {/* Simple Header with Back Button */}
        <div className="max-w-6xl mx-auto relative isolate z-20 sticky-header">
          <div className="relative z-10 header-content-wrapper">
            <div className="pt-3 flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/analyze')}
                className="hover:bg-muted/50"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="hover:bg-muted/50"
                >
                  <Share2 size={16} className="mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-pretty text-lg lg:text-2xl font-semibold text-foreground break-words text-left overflow-hidden line-clamp-3">
              {videoTitle}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analysis ID: {analysisId}
            </p>
          </div>
        </div>
        
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-8">
          {/* Tabs */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full p-0 bg-background justify-start border-b rounded-none">
              {tabsData.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none bg-background h-full data-[state=active]:shadow-none border-b-4 border-transparent data-[state=active]:border-primary px-4 py-2.5"
                >
                  <tab.icon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">{tab.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Video Info Tab */}
            <TabsContent value="info" className="pt-6">
              {metadata ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Video Information
                    </CardTitle>
                    <CardDescription>
                      Details about the analyzed video content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Title:</p>
                          <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                            {metadata.title || 'No title available'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-2">Source URL:</p>
                          <a 
                            href={metadata.src_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-2 p-3 bg-muted/30 rounded-lg"
                          >
                            <ExternalLink className="h-4 w-4 flex-shrink-0" />
                            {metadata.src_url?.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {metadata.author && (
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Creator:
                            </p>
                            <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                              {metadata.author}
                            </p>
                          </div>
                        )}
                        
                        {metadata.duration && (
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Duration:
                            </p>
                            <p className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                              {Math.round(metadata.duration)} seconds
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-medium mb-2 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Overall Score:
                          </p>
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${getScoreColor(analysis?.overallScore || 0)}`}>
                                {analysis?.overallScore || 'N/A'}/10
                              </span>
                              {analysis?.overallScore && (
                                <Badge variant={getScoreBadgeVariant(analysis.overallScore)}>
                                  {analysis.overallScore >= 8 ? "Excellent" : 
                                   analysis.overallScore >= 6 ? "Good" : "Needs Improvement"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-10">
                  <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No video information available</p>
                </div>
              )}
            </TabsContent>

            {/* Transcript Tab */}
            <TabsContent value="transcript" className="pt-6">
              {transcript ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Transcript
                    </CardTitle>
                    <CardDescription>
                      Actual spoken words from the video
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 w-full border rounded-lg p-4 bg-muted/30">
                      <pre className="text-sm whitespace-pre-wrap font-sans">{transcript}</pre>
                    </ScrollArea>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => copyScriptToClipboard(transcript)} variant="outline">
                        <Copy className="mr-2 h-4 w-4" /> Copy Transcript
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-10">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No transcript available</p>
                </div>
              )}
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="pt-6">
              {analysis ? (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Overall Script Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="text-4xl font-bold">
                          <span className={getScoreColor(analysis.overallScore)}>
                            {analysis.overallScore}/10
                          </span>
                        </div>
                        <div className="flex-grow">
                          <Badge variant={getScoreBadgeVariant(analysis.overallScore)} className="mb-2">
                            {analysis.overallScore >= 8 ? "Excellent" : 
                             analysis.overallScore >= 6 ? "Good" : "Needs Improvement"}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            {analysis.overallFeedback}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Component Analysis */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Hook Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-yellow-500" />
                          Hook Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Score:</span>
                          <Badge variant={getScoreBadgeVariant(analysis.components.hook.score)}>
                            {analysis.components.hook.score}/10
                          </Badge>
                        </div>
                        
                        {analysis.components.hook.found && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Original Hook
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm italic">&quot;{analysis.components.hook.content}&quot;</p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Feedback</div>
                          <p className="text-sm text-muted-foreground">
                            {analysis.components.hook.feedback}
                          </p>
                        </div>

                        {analysis.components.hook.suggestion && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-blue-600">Suggested Improvement</div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm italic">&quot;{analysis.components.hook.suggestion}&quot;</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Golden Nugget Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-amber-500" />
                          Golden Nugget Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Score:</span>
                          <Badge variant={getScoreBadgeVariant(analysis.components.goldenNugget.score)}>
                            {analysis.components.goldenNugget.score}/10
                          </Badge>
                        </div>
                        
                        {analysis.components.goldenNugget.found && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Original Value Content
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm italic">&quot;{analysis.components.goldenNugget.content}&quot;</p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Feedback</div>
                          <p className="text-sm text-muted-foreground">
                            {analysis.components.goldenNugget.feedback}
                          </p>
                        </div>

                        {analysis.components.goldenNugget.suggestion && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-blue-600">Suggested Improvement</div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm italic">&quot;{analysis.components.goldenNugget.suggestion}&quot;</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Call to Action Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-blue-500" />
                          Call to Action Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Score:</span>
                          <Badge variant={getScoreBadgeVariant(analysis.components.callToAction.score)}>
                            {analysis.components.callToAction.score}/10
                          </Badge>
                        </div>
                        
                        {analysis.components.callToAction.found && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Original Call to Action
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm italic">&quot;{analysis.components.callToAction.content}&quot;</p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Feedback</div>
                          <p className="text-sm text-muted-foreground">
                            {analysis.components.callToAction.feedback}
                          </p>
                        </div>

                        {analysis.components.callToAction.suggestion && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-blue-600">Suggested Improvement</div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm italic">&quot;{analysis.components.callToAction.suggestion}&quot;</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Bridge Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="h-5 w-5 text-purple-500" />
                          Bridge/Transition Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Score:</span>
                          <Badge variant={getScoreBadgeVariant(analysis.components.bridge.score)}>
                            {analysis.components.bridge.score}/10
                          </Badge>
                        </div>
                        
                        {analysis.components.bridge.found && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Original Transitions
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm italic">&quot;{analysis.components.bridge.content}&quot;</p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Feedback</div>
                          <p className="text-sm text-muted-foreground">
                            {analysis.components.bridge.feedback}
                          </p>
                        </div>

                        {analysis.components.bridge.suggestion && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-blue-600">Suggested Improvement</div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-sm italic">&quot;{analysis.components.bridge.suggestion}&quot;</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Improved Script */}
                  {analysis.improvedScript && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-green-600" />
                          Optimized Script
                        </CardTitle>
                        <CardDescription>
                          A rewritten version that better follows the proven script structure
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-60 w-full border rounded-lg p-4 bg-green-50/50">
                          <pre className="text-sm whitespace-pre-wrap font-sans">{analysis.improvedScript}</pre>
                        </ScrollArea>
                        <div className="mt-4 flex justify-end">
                          <Button onClick={() => copyScriptToClipboard(analysis.improvedScript)} variant="outline">
                            <Copy className="mr-2 h-4 w-4" /> Copy Optimized Script
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Key Insights */}
                  {analysis.insights && analysis.insights.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Key Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.insights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No analysis data available</p>
                </div>
              )}
            </TabsContent>

            {/* Outline Tab */}
            <TabsContent value="outline" className="pt-6">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5" />
                      Generate Script Variations
                    </CardTitle>
                    <CardDescription>
                      Edit the components below and generate new script variations based on your changes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Editable Components */}
                    <div className="grid gap-6">
                      <div>
                        <Label htmlFor="hook" className="text-sm font-medium">Hook</Label>
                        <Textarea
                          id="hook"
                          value={editedComponents.hook || ""}
                          onChange={(e) => setEditedComponents(prev => ({ ...prev, hook: e.target.value }))}
                          placeholder="Enter your hook..."
                          className="mt-2"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="goldenNugget" className="text-sm font-medium">Golden Nugget (Value Content)</Label>
                        <Textarea
                          id="goldenNugget"
                          value={editedComponents.goldenNugget || ""}
                          onChange={(e) => setEditedComponents(prev => ({ ...prev, goldenNugget: e.target.value }))}
                          placeholder="Enter your main value content..."
                          className="mt-2"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label htmlFor="callToAction" className="text-sm font-medium">Call to Action</Label>
                        <Textarea
                          id="callToAction"
                          value={editedComponents.callToAction || ""}
                          onChange={(e) => setEditedComponents(prev => ({ ...prev, callToAction: e.target.value }))}
                          placeholder="Enter your call to action..."
                          className="mt-2"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="bridge" className="text-sm font-medium">Bridge/Transitions</Label>
                        <Textarea
                          id="bridge"
                          value={editedComponents.bridge || ""}
                          onChange={(e) => setEditedComponents(prev => ({ ...prev, bridge: e.target.value }))}
                          placeholder="Enter transition phrases..."
                          className="mt-2"
                          rows={2}
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleGenerateVariations}
                      disabled={isGeneratingVariations || !editedComponents.hook}
                      className="w-full"
                      size="lg"
                    >
                      {isGeneratingVariations ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Variations...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Generate Script Variations
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Generated Variations */}
                {generatedVariations && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Generated Script Variations</h3>
                    {generatedVariations.map((variation, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>Variation {index + 1}</span>
                            <Button onClick={() => copyScriptToClipboard(variation.script)} variant="outline" size="sm">
                              <Copy className="mr-2 h-3 w-3" /> Copy
                            </Button>
                          </CardTitle>
                          {variation.description && (
                            <CardDescription>{variation.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-40 w-full border rounded-lg p-4 bg-muted/30">
                            <pre className="text-sm whitespace-pre-wrap font-sans">{variation.script}</pre>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  );
} 
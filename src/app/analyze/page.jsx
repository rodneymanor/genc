"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Play, 
  FileText, 
  Loader2, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  TrendingUp
} from "lucide-react";

export default function AnalyzePage() {
  const router = useRouter();
  const { currentUser, userProfile, loading: authLoading } = useContext(AuthContext);
  const [videoUrl, setVideoUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(""); // "transcribing", "analyzing", "saving"

  // Check authentication status
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, authLoading, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
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

  const analyzeVideo = async () => {
    if (!videoUrl.trim()) {
      setError("Please enter a video URL");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      
      // Step 1: Transcribe the video
      setCurrentStep("transcribing");
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const transcribeData = await transcribeResponse.json();

      if (!transcribeResponse.ok) {
        throw new Error(transcribeData.error || 'Failed to transcribe video');
      }

      const { transcript, metadata } = transcribeData;

      // Step 2: Analyze the transcript
      setCurrentStep("analyzing");
      const analysisResponse = await fetch('/api/analyze-video-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok) {
        throw new Error(analysisData.error || 'Failed to analyze script');
      }

      // Step 3: Save the complete analysis
      setCurrentStep("saving");
      const saveResponse = await fetch('/api/save-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis: analysisData,
          transcript,
          metadata,
          userId: currentUser.uid // Add user ID for later retrieval
        }),
      });

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveData.error || 'Failed to save analysis');
      }

      // Redirect to the analysis results page
      router.push(`/analyze/${saveData.analysisId}`);

    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
      setCurrentStep("");
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "transcribing":
        return "Extracting and transcribing audio from video...";
      case "analyzing":
        return "Analyzing script structure and components...";
      case "saving":
        return "Saving analysis results...";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Video Script Analyzer</h1>
        <p className="text-xl text-muted-foreground">
          Analyze any video script against proven viral content structure
        </p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Enter a video URL from TikTok, Instagram, YouTube, or other platforms. 
          We&apos;ll transcribe the audio and analyze the script structure including hook, 
          golden nugget, call-to-action, and transitions.
        </p>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analyze Video Script
          </CardTitle>
          <CardDescription>
            Get instant feedback on your video&apos;s script structure and performance potential
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="video-url" className="text-sm font-medium">
              Video URL
            </label>
            <Input
              id="video-url"
              type="url"
              placeholder="https://www.tiktok.com/@username/video/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isProcessing}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isProcessing && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Processing your video...</div>
                  <div className="text-sm">{getStepDescription()}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={analyzeVideo}
            disabled={isProcessing || !videoUrl.trim()}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {currentStep === "transcribing" && "Transcribing..."}
                {currentStep === "analyzing" && "Analyzing..."}
                {currentStep === "saving" && "Saving..."}
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Analyze Script
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2 text-center">
              <FileText className="h-8 w-8 mx-auto text-blue-500" />
              <h3 className="font-medium">Transcription</h3>
              <p className="text-sm text-muted-foreground">
                Extract actual spoken words from video audio
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-green-500" />
              <h3 className="font-medium">Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Score script components against viral content patterns
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2 text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-purple-500" />
              <h3 className="font-medium">Optimization</h3>
              <p className="text-sm text-muted-foreground">
                Get specific suggestions to improve performance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
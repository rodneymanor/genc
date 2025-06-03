"use client";

import { useState } from 'react';
import { PlayCircle, Lightbulb, Save, FileText, Bookmark, MessageSquare, Edit3, Sparkles, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from 'next/image'; // For optimized images
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// ActionButton component (can be shared)
const ActionButton = ({ children, onClick, variant = "default", className = "", icon: Icon, size = "default" }) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      className={`font-semibold shadow-sm hover:shadow-md transition-shadow ${className}`}
      size={size}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  );
};

// Placeholder data for a video breakdown
const placeholderVideoData = {
  videoTitle: "Mastering Short-Form Video Hooks",
  videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Example YouTube embed URL
  thumbnailUrl: "https://picsum.photos/seed/vidbreakdown/1280/720", // Larger placeholder
  analysis: {
    sevenLaws: {
      hook: {
        text: "The video opens with a surprising statistic about viewer attention spans, immediately piquing interest.",
        analysis: "Effective use of a &apos;Pattern Interrupt&apos; and &apos;Intrigue&apos;. The statistic is relatable and shocking.",
        rating: "Strong"
      },
      bridge: {
        text: "It then smoothly transitions by promising to reveal the &apos;3 secrets&apos; top creators use.",
        analysis: "Creates a clear value proposition and a curiosity gap, leading the viewer into the main content.",
        rating: "Excellent"
      },
      goldenNuggets: [
        { point: "Secret 1: The 0.5s Flash Cut - Show, don&apos;t just tell, within the first half-second.", analysis: "Visually demonstrated, easy to grasp." },
        { point: "Secret 2: The Open Loop Question - Pose a question that will only be answered later.", analysis: "Keeps viewers engaged for longer." },
        { point: "Secret 3: The Unexpected Visual - Use an out-of-context visual to make them pause.", analysis: "Memorable and effective for scroll-stopping." },
      ],
      wta: { // What To Action
        text: "The video ends with a challenge: &apos;Try one of these hook techniques in your next video and tag us!&apos;",
        analysis: "Clear, engaging, and encourages user-generated content. Could be stronger by adding a direct subscribe nudge.",
        rating: "Good"
      },
    },
    coreMessageStyle: {
      coreMessages: [
        "Grabbing attention early is crucial for short-form video.",
        "Simple, actionable techniques can drastically improve hook effectiveness.",
        "Creativity in the first few seconds pays off.",
      ],
      tone: "Energetic, Confident, Educational",
      pacing: "Fast-paced with quick cuts, matching the short-form video theme.",
      stylisticElements: ["Dynamic text overlays", "Sound effects for emphasis", "Use of popular meme formats"],
    },
    adaptationRecommendations: [
      "Apply the &apos;Open Loop Question&apos; technique to your product demo videos to maintain viewer interest through feature explanations.",
      "Incorporate &apos;Flash Cuts&apos; into your educational content to visually summarize key concepts quickly.",
      "Experiment with &apos;Unexpected Visuals&apos; in your marketing ads to make them more memorable on crowded feeds.",
      "When presenting data, use a surprising statistic as a hook, similar to this video.",
    ],
  },
};

const AnalysisDetailCard = ({ title, content, icon: Icon, rating }) => (
  <Card className="shadow-lg">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-xl flex items-center">
          {Icon && <Icon className="h-5 w-5 mr-2 text-primary" />}
          {title}
        </CardTitle>
        {rating && <Badge variant={rating === "Excellent" ? "default" : rating === "Strong" ? "secondary" : "outline"}>{rating}</Badge>}
      </div>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground space-y-2">
      <p className="font-medium text-foreground">Identified Text/Segment: <span className="italic">&quot;{content.text}&quot;</span></p>
      <p>Analysis: {content.analysis}</p>
    </CardContent>
  </Card>
);


export default function VideoBreakdownPage() {
  // In a real app, videoId would come from route params, and data would be fetched
  const [videoData] = useState(placeholderVideoData);

  const handleSaveInsights = () => console.log("Saving insights for:", videoData.videoTitle);
  const handleGenerateOutline = () => console.log("Generating outline based on:", videoData.videoTitle);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/10 py-8 px-4 md:px-6">
      <div className="container mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            11. Discover - Video Breakdown
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            <span className="font-semibold text-primary">{videoData.videoTitle}</span>
          </p>
        </div>

        {/* Video Player/Thumbnail Placeholder */}
        <Card className="overflow-hidden shadow-xl">
          <AspectRatio ratio={16 / 9} className="bg-muted">
            {/* In a real scenario, you might use an iframe for YouTube/Vimeo or a video component */}
            <Image 
                src={videoData.thumbnailUrl} 
                alt={`Video thumbnail for ${videoData.videoTitle}`} 
                fill 
                className="object-cover"
                priority // Prioritize loading LCP image
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group">
                <PlayCircle className="h-16 w-16 text-white/70 group-hover:text-white transition-colors cursor-pointer" />
            </div>
          </AspectRatio>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
          {/* Section 1: Analysis Details (takes 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center"><Zap className="h-6 w-6 mr-2 text-primary"/>Seven Laws Deconstruction</CardTitle>
                <CardDescription>How this video leverages core principles of engaging content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnalysisDetailCard title="Hook" content={videoData.analysis.sevenLaws.hook} icon={Sparkles} rating={videoData.analysis.sevenLaws.hook.rating} />
                <AnalysisDetailCard title="Bridge" content={videoData.analysis.sevenLaws.bridge} icon={Edit3} rating={videoData.analysis.sevenLaws.bridge.rating} />
                
                <Card className="shadow-lg">
                  <CardHeader><CardTitle className="text-xl flex items-center"><CheckCircle className="h-5 w-5 mr-2 text-primary"/>Golden Nuggets</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {videoData.analysis.sevenLaws.goldenNuggets.map((nugget, index) => (
                      <div key={index} className="p-3 border rounded-md bg-muted/20">
                        <p className="font-semibold text-foreground leading-snug">{nugget.point}</p>
                        <p className="text-xs text-muted-foreground mt-1">Analysis: {nugget.analysis}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <AnalysisDetailCard title="What To Action (WTA)" content={videoData.analysis.sevenLaws.wta} icon={MessageSquare} rating={videoData.analysis.sevenLaws.wta.rating} />
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center"><Bookmark className="h-6 w-6 mr-2 text-primary"/>Core Message & Style</CardTitle>
                <CardDescription>Understanding the video&apos;s essence and delivery.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                    <h4 className="font-semibold text-md text-muted-foreground mb-1">Core Messages:</h4>
                    <ul className="list-disc list-inside pl-4 space-y-1">
                        {videoData.analysis.coreMessageStyle.coreMessages.map((msg, i) => <li key={i}>{msg}</li>)}
                    </ul>
                </div>
                <p><strong>Tone:</strong> <Badge variant="secondary">{videoData.analysis.coreMessageStyle.tone}</Badge></p>
                <p><strong>Pacing:</strong> <Badge variant="secondary">{videoData.analysis.coreMessageStyle.pacing}</Badge></p>
                 <div>
                    <h4 className="font-semibold text-md text-muted-foreground mb-1">Key Stylistic Elements:</h4>
                    <ul className="list-disc list-inside pl-4 space-y-1">
                        {videoData.analysis.coreMessageStyle.stylisticElements.map((style, i) => <li key={i}>{style}</li>)}
                    </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Recommendations & Actions (takes 1 column on large screens) */}
          <div className="space-y-6 lg:sticky lg:top-24"> {/* Sticky for long content scrolling */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center"><Lightbulb className="h-6 w-6 mr-2 text-primary"/>Adaptation Recommendations</CardTitle>
                <CardDescription>How you can apply these insights to your own content.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 list-decimal list-inside text-sm">
                  {videoData.analysis.adaptationRecommendations.map((rec, index) => (
                    <li key={index} className="leading-relaxed">{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <div className="space-y-3">
              <ActionButton 
                onClick={handleSaveInsights} 
                variant="default" 
                icon={Save} 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                Save These Insights
              </ActionButton>
              <ActionButton 
                onClick={handleGenerateOutline} 
                variant="secondary" 
                icon={FileText} 
                className="w-full"
                size="lg"
              >
                Generate Starting Outline
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
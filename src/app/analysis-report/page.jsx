"use client";

import { useState } from 'react'; // Though not strictly needed for this static display, good for future enhancements
import { ArrowLeft, RefreshCw, CheckCircle, AlertTriangle, MessageSquare, Edit3, Sparkles, BookOpen, Smile, Meh, Frown, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

// Placeholder data for the Analysis Report
const placeholderReportData = {
  scriptIdentifier: "My Awesome Video Script - v1",
  structureAdherence: {
    hook: {
      analysis: "The hook grabs attention but could be more concise.",
      strengths: ["Intriguing question", "Relatable premise"],
      weaknesses: ["Slightly too long", "Could create more urgency"],
    },
    bridge: {
      analysis: "The bridge effectively connects the hook to the main content.",
      strengths: ["Clear transition", "Maintains viewer interest"],
      weaknesses: ["A bit generic, could be more specific to the topic"],
    },
    goldenNuggets: {
      analysis: "Golden nuggets deliver substantial value and are well-placed.",
      strengths: ["Actionable advice", "Clear explanations"],
      weaknesses: ["Could add one more key takeaway for deeper impact"],
    },
    wta: { // What To Action
      analysis: "The call to action is clear but could be stronger.",
      strengths: ["Direct and understandable"],
      weaknesses: ["Lacks a sense of urgency or unique benefit for acting now"],
    },
  },
  hemingwayFeedback: {
    overallReadabilityScore: "Grade 7 (Good)",
    highlightedSentences: [
      { text: "This very long and somewhat convoluted sentence could potentially be simplified for better clarity and easier understanding by a wider audience.", highlightClass: "bg-yellow-200/70 dark:bg-yellow-700/50", type: "complex" },
      { text: "The decision was made by the team (passive).", highlightClass: "bg-orange-200/70 dark:bg-orange-700/50", type: "passive" },
      { text: "He ran very quickly (adverb).", highlightClass: "bg-purple-200/70 dark:bg-purple-700/50", type: "adverb" },
    ],
    passiveVoiceCount: 3,
    adverbCount: 5,
    complexWordSuggestions: [
      { original: "utilize", suggestion: "use" },
      { original: "ameliorate", suggestion: "improve" },
    ],
  },
  actionableRecommendations: [
    {
      id: "rec1",
      before: "Hook: 'Are you tired of long, boring videos that don't get to the point quickly enough for your busy schedule?'",
      after: "Hook: 'Tired of boring videos? Learn the 3-second hook trick!'",
      reasoning: "The revised hook is shorter, more direct, and creates a stronger curiosity gap.",
    },
    {
      id: "rec2",
      before: "WTA: 'So, if you want, you can subscribe.'",
      after: "WTA: 'Hit subscribe now to never miss game-changing insights like these!'",
      reasoning: "The new WTA is more energetic, provides a benefit, and includes a stronger call to action verb.",
    },
  ],
};

// AnalysisReportPanel Component
const AnalysisReportPanel = ({ analysisData }) => {
  const { structureAdherence, hemingwayFeedback, actionableRecommendations } = analysisData;

  const renderCritique = (data) => (
    <div className="space-y-2 text-sm">
      <p>{data.analysis}</p>
      {data.strengths && data.strengths.length > 0 && (
        <div>
          <strong className="text-green-600 dark:text-green-400">Strengths:</strong>
          <ul className="list-disc list-inside pl-4">
            {data.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      )}
      {data.weaknesses && data.weaknesses.length > 0 && (
        <div>
          <strong className="text-red-600 dark:text-red-400">Weaknesses:</strong>
          <ul className="list-disc list-inside pl-4">
            {data.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
    </div>
  );

  const SectionCard = ({ title, icon: Icon, children, defaultOpen = false }) => (
     <Accordion type="single" collapsible defaultValue={defaultOpen ? "item-1" : undefined} className="w-full">
      <AccordionItem value="item-1" className="border bg-card rounded-lg shadow-md">
        <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline">
          <div className="flex items-center">
            {Icon && <Icon className="h-6 w-6 mr-3 text-primary" />}
            {title}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-6 pb-6 pt-0">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return (
    <div className="space-y-6">
      <SectionCard title="Structure Adherence" icon={Sparkles} defaultOpen={true}>
        <div className="space-y-4">
          <div><h4 className="font-semibold text-md text-muted-foreground">Hook:</h4>{renderCritique(structureAdherence.hook)}</div>
          <Separator />
          <div><h4 className="font-semibold text-md text-muted-foreground">Bridge:</h4>{renderCritique(structureAdherence.bridge)}</div>
          <Separator />
          <div><h4 className="font-semibold text-md text-muted-foreground">Golden Nuggets:</h4>{renderCritique(structureAdherence.goldenNuggets)}</div>
          <Separator />
          <div><h4 className="font-semibold text-md text-muted-foreground">What To Action (WTA):</h4>{renderCritique(structureAdherence.wta)}</div>
        </div>
      </SectionCard>

      <SectionCard title="Readability & Style (Hemingway)" icon={BookOpen}>
        <div className="space-y-4 text-sm">
          <p><strong>Overall Readability:</strong> <Badge variant="outline">{hemingwayFeedback.overallReadabilityScore}</Badge></p>
          <div>
            <strong>Highlighted Sentences:</strong>
            <div className="p-3 border rounded-md bg-muted/30 my-2 space-y-1">
              {hemingwayFeedback.highlightedSentences.map((s, i) => (
                <p key={i}><span className={`${s.highlightClass} px-1 py-0.5 rounded`}>{s.text}</span> <Badge variant="secondary" className="ml-1 text-xs">{s.type}</Badge></p>
              ))}
            </div>
          </div>
          <p><strong>Passive Voice Sentences:</strong> {hemingwayFeedback.passiveVoiceCount}</p>
          <p><strong>Adverbs Used:</strong> {hemingwayFeedback.adverbCount}</p>
          {hemingwayFeedback.complexWordSuggestions.length > 0 && (
            <div>
              <strong>Complex Word Suggestions:</strong>
              <ul className="list-disc list-inside pl-4">
                {hemingwayFeedback.complexWordSuggestions.map((cw, i) => (
                  <li key={i}>"{cw.original}" → "{cw.suggestion}"</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Actionable Recommendations" icon={Lightbulb}>
        <div className="space-y-4">
          {actionableRecommendations.map((rec, i) => (
            <div key={rec.id} className="p-4 border rounded-md bg-muted/20">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Recommendation {i + 1}</p>
              <p><strong>Before:</strong> <span className="italic text-red-700 dark:text-red-400">"{rec.before}"</span></p>
              <p><strong>After:</strong> <span className="italic text-green-700 dark:text-green-400">"{rec.after}"</span></p>
              <p><strong>Reasoning:</strong> {rec.reasoning}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};


export default function AnalysisReportPage() {
  const [reportData] = useState(placeholderReportData); // In a real app, this would be fetched or passed as prop

  const handleBackToEditor = () => {
    console.log("Navigate back to editor (if applicable)");
    // router.push('/create-script/editor/SCRIPT_ID'); // Example navigation
  };

  const handleAnalyzeAnother = () => {
    console.log("Navigate to analyze another script");
    // router.push('/analyze-script'); // Example navigation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/10 py-8 px-4 md:px-6">
      <div className="container mx-auto space-y-8 max-w-4xl">
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            9. Script Analysis Report
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
            Analysis for: <span className="font-semibold text-primary">{reportData.scriptIdentifier}</span>
            </p>
        </div>
        
        <AnalysisReportPanel analysisData={reportData} />

        <Separator className="my-10" />

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <ActionButton
            onClick={handleBackToEditor}
            variant="default"
            icon={ArrowLeft}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            Back to Editor
          </ActionButton>
          <ActionButton
            onClick={handleAnalyzeAnother}
            variant="secondary"
            icon={RefreshCw}
            className="w-full sm:w-auto"
            size="lg"
          >
            Analyze Another Script
          </ActionButton>
        </div>
      </div>
    </div>
  );
} 
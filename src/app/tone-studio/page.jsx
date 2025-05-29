"use client";

import { useState } from 'react';
import { MicVocal, Users, Sparkles, UserCheck, Search, Link as LinkIcon, BarChart3, Palette, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// It's highly recommended to move StandardizedInputGroup and ActionButton
// to a shared components directory (e.g., src/components/common/)

// StandardizedInputGroup component (can be shared)
const StandardizedInputGroup = ({
  label,
  id,
  placeholder,
  value,
  onChange,
  inputType = "text", // 'text', 'textarea'
  icon: Icon,
  className = "",
  inputClassName = "",
  rows = 3 // default rows for textarea
}) => {
  const commonInputClass = "border-2 border-border focus:border-primary transition-colors rounded-lg shadow-sm hover:shadow-md";
  
  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && <label htmlFor={id} className="text-sm font-medium text-muted-foreground flex items-center">{Icon && <Icon className="h-4 w-4 mr-2 text-primary" />}{label}</label>}
      {inputType === 'textarea' ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${commonInputClass} min-h-[80px] text-base p-3 ${inputClassName}`}
          rows={rows}
        />
      ) : (
        <Input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${commonInputClass} h-12 text-base px-3 ${inputClassName}`}
        />
      )}
    </div>
  );
};

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

// Tab 1: My Channel Tone Content
const MyChannelToneContent = () => {
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [keywords, setKeywords] = useState("");

  const handleAnalyzeChannelTone = () => {
    console.log("Analyzing Channel Tone:", { niche, audience, keywords });
    // Placeholder: Trigger analysis and then show suggestions
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground mb-1">Define Your Channel Tone</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Help us understand your brand and audience to suggest the perfect communication style.
      </p>
      <StandardizedInputGroup
        id="channelNiche"
        label="Channel/Business Niche"
        placeholder="e.g., Sustainable Fashion, SaaS for Small Businesses, Home Cooking"
        value={niche}
        onChange={(e) => setNiche(e.target.value)}
        icon={Palette}
      />
      <StandardizedInputGroup
        id="targetAudience"
        label="Target Audience Description"
        inputType="textarea"
        placeholder="Describe your ideal viewer/customer: their age, interests, pain points, aspirations..."
        value={audience}
        onChange={(e) => setAudience(e.target.value)}
        rows={4}
        icon={Users}
      />
      <StandardizedInputGroup
        id="brandValues"
        label="Brand Values / Keywords"
        placeholder="e.g., Authentic, Innovative, Eco-friendly, Humorous, Trustworthy"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        icon={Sparkles}
      />
      <ActionButton
        onClick={handleAnalyzeChannelTone}
        icon={BarChart3}
        className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
        size="lg"
      >
        Analyze & Suggest Tones
      </ActionButton>

      {/* Placeholder for Tone Suggestions View (G2B) */}
      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Tone Suggestions (G2B Placeholder)</h3>
        <div className="p-6 bg-muted/30 rounded-lg text-center text-muted-foreground">
          <Info className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p>After analysis, suggested tone cards will appear here.</p>
          <p className="text-xs mt-1">Each card will offer a "Select as Default" option.</p>
          {/* Example of how a card might look (very basic) */}
          <div className="mt-4 p-3 border border-dashed border-primary/50 rounded text-left text-xs max-w-xs mx-auto">
            <p className="font-semibold">Example Tone: "Witty & Engaging"</p>
            <p>Keywords: Humorous, Smart, Relatable</p>
            <Button variant="outline" size="sm" className="mt-2 w-full">Select as Default</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab 2: Famous Person Tone Library Content
const FamousPersonToneLibraryContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const popularChoices = ["David Attenborough", "Ryan Reynolds", "Morgan Freeman", "Joanna Gaines", "Neil deGrasse Tyson"];

  const handleSetInspiration = () => {
    console.log("Setting inspiration:", searchTerm || "Selected from popular");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground mb-1">Famous Person Tone Library</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Select a famous person whose communication style you admire. We'll use their tone as inspiration.
      </p>
      <StandardizedInputGroup
        id="famousPersonSearch"
        label="Search or Select Famous Person"
        placeholder="e.g., David Attenborough, Michelle Obama"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        icon={Search}
      />
      <div className="mt-4">
        <h4 className="text-md font-medium text-muted-foreground mb-2">Popular Choices:</h4>
        <div className="flex flex-wrap gap-2">
          {popularChoices.map(name => (
            <Button key={name} variant="outline" size="sm" onClick={() => setSearchTerm(name)}>
              {name}
            </Button>
          ))}
        </div>
      </div>
      <ActionButton
        onClick={handleSetInspiration}
        icon={UserCheck}
        className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
        size="lg"
      >
        Set as Inspiration for Next Script
      </ActionButton>
    </div>
  );
};

// Tab 3: Analyze Influencer Style Content
const AnalyzeInfluencerStyleContent = () => {
  const [influencerHandle, setInfluencerHandle] = useState("");
  const handleAnalyzeInfluencer = () => {
    console.log("Analyzing Influencer:", influencerHandle);
    // Placeholder: Trigger analysis and display report
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground mb-1">Analyze Influencer Style</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Enter an influencer's channel URL or social media handle to analyze their content style.
      </p>
      <StandardizedInputGroup
        id="influencerHandle"
        label="Influencer's Channel URL or Handle"
        placeholder="e.g., @mkbhd or youtube.com/c/mkbhd"
        value={influencerHandle}
        onChange={(e) => setInfluencerHandle(e.target.value)}
        icon={LinkIcon}
      />
      <ActionButton
        onClick={handleAnalyzeInfluencer}
        icon={BarChart3}
        className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
        size="lg"
      >
        Analyze Influencer
      </ActionButton>

      {/* Placeholder for Influencer Analysis Report (G3B) */}
      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-3">Influencer Analysis Report (G3B Placeholder)</h3>
        <div className="p-6 bg-muted/30 rounded-lg text-center text-muted-foreground">
          <Info className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p>After analysis, a detailed report on the influencer's style will appear here.</p>
          <p className="text-xs mt-1">Includes common themes, structure, tone, engagement strategies, taglines, actionable suggestions, etc.</p>
        </div>
      </div>
    </div>
  );
};


export default function ToneStudioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/10 py-8 px-4 md:px-6">
      <div className="container mx-auto space-y-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Tone Studio
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Personalize your content's voice and style.
          </p>
        </div>

        <Tabs defaultValue="myChannelTone" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 h-auto sm:h-12">
            <TabsTrigger value="myChannelTone" className="text-sm sm:text-base py-2 sm:py-0 h-full data-[state=active]:shadow-md">
              <MicVocal className="mr-2 h-5 w-5" /> My Channel Tone
            </TabsTrigger>
            <TabsTrigger value="famousPerson" className="text-sm sm:text-base py-2 sm:py-0 h-full data-[state=active]:shadow-md">
              <UserCheck className="mr-2 h-5 w-5" /> Famous Person Library
            </TabsTrigger>
            <TabsTrigger value="analyzeInfluencer" className="text-sm sm:text-base py-2 sm:py-0 h-full data-[state=active]:shadow-md">
              <Search className="mr-2 h-5 w-5" /> Analyze Influencer Style
            </TabsTrigger>
          </TabsList>
          
          <Card className="shadow-xl">
            <CardContent className="p-6">
              <TabsContent value="myChannelTone">
                <MyChannelToneContent />
              </TabsContent>
              <TabsContent value="famousPerson">
                <FamousPersonToneLibraryContent />
              </TabsContent>
              <TabsContent value="analyzeInfluencer">
                <AnalyzeInfluencerStyleContent />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
} 
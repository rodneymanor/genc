"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, PlayCircle, ExternalLink, Link, Type, FileText, BarChart3, Compass, Zap, UploadCloud } from "lucide-react"; // Added UploadCloud for webhook section
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AspectRatio } from "@/components/ui/aspect-ratio"; // For video thumbnails
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Using ShadCN Tabs
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from 'next/image'; // For optimized images
import { SocialMediaCard } from "@/components/common/SocialMediaCard"; // Import SocialMediaCard
import { getAnalyzedVideos } from '@/lib/firestoreService'; // Fixed import path

// Enhanced StandardizedInputGroup component for multiple input types
const StandardizedInputGroup = ({
  label,
  id,
  value,
  onChange,
  inputType = "select", // 'select', 'text', 'url', 'textarea'
  options = [],
  placeholder,
  icon: Icon,
  className = "",
  inputClassName = "",
  rows = 8 // for textarea
}) => {
  const commonInputClass = "border-2 border-border focus:border-primary transition-colors rounded-lg shadow-sm hover:shadow-md";
  
  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {label && <label htmlFor={id} className="text-sm font-medium text-muted-foreground flex items-center">{Icon && <Icon className="h-4 w-4 mr-2 text-primary" />}{label}</label>}
      {inputType === 'select' ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={id} className={`${commonInputClass} h-12 text-base ${inputClassName}`}>
            {Icon && <Icon className="h-5 w-5 mr-2 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2" />}
            <SelectValue placeholder={placeholder} className={Icon ? "pl-8" : ""} />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : inputType === 'textarea' ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${commonInputClass} min-h-[150px] text-base p-3 ${inputClassName}`}
          rows={rows}
        />
      ) : (
        <Input
          id={id}
          type={inputType} // 'text', 'url', etc.
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${commonInputClass} h-12 text-base px-3 ${inputClassName}`}
        />
      )}
    </div>
  );
};

// Helper function to map platform values to valid SocialMediaCard platforms
const mapPlatformType = (platform) => {
  const platformMap = {
    'instagram': 'instagram',
    'tiktok': 'tiktok', 
    'youtube': 'youtube',
    'facebook': 'facebook',
    'unknown': 'instagram' // Default fallback to instagram
  };
  return platformMap[platform?.toLowerCase()] || 'instagram';
};

// ActionButton component for analyze functionality
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

// Social media content data for discovery
const socialMediaContent = [
  {
    id: "tiktok1",
    platform: 'tiktok',
    thumbnailUrl: "https://picsum.photos/seed/tiktok1/350/620",
    username: "@marketingguru",
    userAvatar: "https://picsum.photos/seed/avatar1/100/100",
    description: "Mastering Short-Form Video Hooks 🎯 How to capture attention in the first 3 seconds #marketing #hooks #viral",
    likes: 125000,
    comments: 3400,
    shares: 890,
    duration: "0:45",
    isFollowing: false,
    hashtags: ["marketing", "hooks", "viral", "content"],
    category: "Marketing",
  },
  {
    id: "instagram1",
    platform: 'instagram',
    thumbnailUrl: "https://picsum.photos/seed/instagram1/350/620",
    username: "@scienceexplained",
    userAvatar: "https://picsum.photos/seed/avatar2/100/100",
    description: "The Science of Storytelling in Educational Content ✨ Making complex topics engaging and memorable",
    likes: 89000,
    comments: 1200,
    shares: 450,
    views: 250000,
    duration: "1:30",
    isFollowing: true,
    hashtags: ["education", "storytelling", "science", "learning"],
    category: "Educational",
  },
  {
    id: "youtube1",
    platform: 'youtube',
    thumbnailUrl: "https://picsum.photos/seed/youtube1/350/620",
    username: "ProductDemoMaster",
    userAvatar: "https://picsum.photos/seed/avatar3/100/100",
    description: "Viral Product Demo Case Study 📱 Breaking down structure, pacing, and call-to-action strategies",
    likes: 45000,
    comments: 2100,
    views: 890000,
    duration: "3:45",
    isFollowing: false,
    hashtags: ["product", "demo", "marketing", "viral"],
    category: "Marketing",
  },
  {
    id: "tiktok2",
    platform: 'tiktok',
    thumbnailUrl: "https://picsum.photos/seed/tiktok2/350/620",
    username: "@quantumteacher",
    userAvatar: "https://picsum.photos/seed/avatar4/100/100",
    description: "Explaining Quantum Physics Simply 🔬 Making the impossible understandable #physics #education #science",
    likes: 78000,
    comments: 1800,
    shares: 520,
    duration: "0:58",
    isFollowing: false,
    hashtags: ["physics", "education", "science", "quantum"],
    category: "Educational",
  },
  {
    id: "facebook1",
    platform: 'facebook',
    thumbnailUrl: "https://picsum.photos/seed/facebook1/350/620",
    username: "ComedyAdsAgency",
    userAvatar: "https://picsum.photos/seed/avatar5/100/100",
    description: "Comedy Techniques in Ad Campaigns 😂 How humor creates memorable and shareable content for brands",
    likes: 32000,
    comments: 890,
    shares: 1200,
    duration: "2:15",
    isFollowing: true,
    hashtags: ["comedy", "advertising", "marketing", "humor"],
    category: "Marketing",
  },
  {
    id: "instagram2",
    platform: 'instagram',
    thumbnailUrl: "https://picsum.photos/seed/instagram2/350/620",
    username: "@techexplainer",
    userAvatar: "https://picsum.photos/seed/avatar6/100/100",
    description: "AI Explained in 60 Seconds 🤖 Breaking down artificial intelligence for everyone to understand",
    likes: 156000,
    comments: 2800,
    shares: 670,
    views: 420000,
    duration: "1:00",
    isFollowing: false,
    hashtags: ["AI", "technology", "education", "explained"],
    category: "Tech Explainers",
  },
];

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "Educational", label: "Educational" },
  { value: "Marketing", label: "Marketing" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Tech Explainers", label: "Tech Explainers" },
];

// Content for "Analyze by URL" tab
const AnalyzeURLContent = () => {
  const [url, setUrl] = useState("");
  const handleAnalyzeURL = () => console.log("Analyzing URL:", url);

  return (
    <div className="space-y-6 p-1">
      <StandardizedInputGroup
        id="urlInput"
        label="Enter URL of an article or video page:"
        placeholder="e.g., https://www.example.com/article"
        inputType="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        icon={Link}
      />
      <ActionButton
        onClick={handleAnalyzeURL}
        variant="default"
        icon={Search}
        className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
        size="lg"
      >
        Analyze URL
      </ActionButton>
    </div>
  );
};

// Content for "Analyze Direct Text" tab
const AnalyzeDirectTextContent = () => {
  const [scriptText, setScriptText] = useState("");
  const handleAnalyzeText = () => console.log("Analyzing Script Text:", scriptText.substring(0, 100) + "...");

  return (
    <div className="space-y-6 p-1">
      <StandardizedInputGroup
        id="textInput"
        label="Paste your script text here:"
        placeholder="Start typing or paste your script content..."
        inputType="textarea"
        value={scriptText}
        onChange={(e) => setScriptText(e.target.value)}
        rows={12} // Larger textarea
        icon={FileText}
      />
      <ActionButton
        onClick={handleAnalyzeText}
        variant="default"
        icon={BarChart3}
        className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
        size="lg"
      >
        Analyze My Script
      </ActionButton>
    </div>
  );
};

export default function DiscoverPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("discover");
  const [webhookVideos, setWebhookVideos] = useState([]); // Added state for webhook videos
  const [isLoadingWebhookVideos, setIsLoadingWebhookVideos] = useState(true); // Added loading state
  const searchParams = useSearchParams();

  // Handle URL parameters for direct navigation to analyze tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'analyze') {
      setActiveTab('analyze');
    }
  }, [searchParams]);

  // Fetch webhook-processed videos from Firestore
  const fetchWebhookVideos = async () => {
    try {
      setIsLoadingWebhookVideos(true);
      const videos = await getAnalyzedVideos(10); // Fetch latest 10 videos
      setWebhookVideos(videos);
      console.log('[Discover] Fetched webhook videos:', videos.length);
    } catch (error) {
      console.error('[Discover] Error fetching webhook videos:', error);
    } finally {
      setIsLoadingWebhookVideos(false);
    }
  };

  useEffect(() => {
    fetchWebhookVideos();
  }, []);

  // Manual refresh function
  const handleRefreshWebhookVideos = () => {
    console.log('[Discover] Manually refreshing webhook videos...');
    fetchWebhookVideos();
  };

  const handleCardClick = (contentId, username) => {
    console.log(`Navigate to breakdown for content: ${username} (ID: ${contentId})`);
    // Example navigation: router.push(`/discover/breakdown/${contentId}`);
  };

  const handleQuickAnalyze = (content, event) => {
    event.stopPropagation(); // Prevent card click
    console.log(`Quick analyze for: ${content.username}`);
    // Switch to analyze tab and potentially pre-fill with content URL or description
    setActiveTab("analyze");
  };

  const filteredContent = selectedCategory === "all"
    ? socialMediaContent
    : socialMediaContent.filter(content => content.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/10 py-8 px-4 md:px-6">
      <div className="container mx-auto space-y-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Discover & Analyze
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            Explore Viral Social Media Content & Analyze What Makes It Work
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-14 max-w-md mx-auto">
            <TabsTrigger value="discover" className="text-base h-full">
              <Compass className="mr-2 h-5 w-5" /> Discover Content
            </TabsTrigger>
            <TabsTrigger value="analyze" className="text-base h-full">
              <BarChart3 className="mr-2 h-5 w-5" /> Analyze Content
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="discover" className="space-y-8">
            <div className="mb-8 max-w-sm mx-auto md:max-w-md">
              <StandardizedInputGroup
                id="categoryFilter"
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={categoryOptions}
                placeholder="Filter by category..."
              />
            </div>

            {/* Recently Processed via Webhook Section */}
            {webhookVideos.length > 0 ? (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <UploadCloud className="h-6 w-6 mr-3 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Recently Processed via Webhook</h2>
                  </div>
                  <Button
                    onClick={handleRefreshWebhookVideos}
                    variant="outline"
                    size="sm"
                    disabled={isLoadingWebhookVideos}
                    className="ml-4"
                  >
                    {isLoadingWebhookVideos ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>
                {isLoadingWebhookVideos ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading webhook videos...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {webhookVideos.map(video => (
                      <div key={video.id} className="relative group">
                        <div onClick={() => handleCardClick(video.id, video.authorUsername || 'Unknown')} className="cursor-pointer">
                          <SocialMediaCard
                            platform={mapPlatformType(video.platform)}
                            thumbnailUrl={video.thumbnailUrl}
                            username={video.authorUsername || 'Unknown'}
                            userAvatar={video.thumbnailUrl || "/placeholder.svg"} // Use thumbnail as avatar fallback
                            description={video.title || video.description || 'No description available'}
                            likes={0} // Webhook videos don't have social metrics
                            comments={0} // Webhook videos don't have social metrics
                            shares={0} // Webhook videos don't have social metrics
                            duration={video.duration}
                            isFollowing={false}
                            hashtags={[]} // Webhook videos don't have hashtags in our current structure
                            className="hover:scale-105 transition-transform duration-300 border-2 border-primary/20"
                          />
                        </div>
                        {/* Quick Analyze Button */}
                        <Button
                          onClick={(e) => handleQuickAnalyze(video, e)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg"
                          size="sm"
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          View Analysis
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : !isLoadingWebhookVideos && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <UploadCloud className="h-6 w-6 mr-3 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Recently Processed via Webhook</h2>
                  </div>
                  <Button
                    onClick={handleRefreshWebhookVideos}
                    variant="outline"
                    size="sm"
                    disabled={isLoadingWebhookVideos}
                    className="ml-4"
                  >
                    {isLoadingWebhookVideos ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>
                <Card className="p-8 text-center border-dashed border-2 border-muted-foreground/30">
                  <CardContent className="space-y-4">
                    <UploadCloud className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">No Webhook Videos Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Send a social media video URL to our webhook endpoint to automatically analyze and display videos here.
                    </p>
                    <div className="bg-muted p-4 rounded-lg text-sm text-left max-w-lg mx-auto">
                      <p className="font-mono text-xs mb-2">POST http://localhost:3000/api/webhook</p>
                      <p className="font-mono text-xs">{"{ \"videoUrl\": \"https://instagram.com/reel/...\" }"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Original Social Media Content Section */}
            <div>
              <div className="flex items-center mb-6">
                <Compass className="h-6 w-6 mr-3 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Curated Content Examples</h2>
              </div>
              {filteredContent.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {filteredContent.map(content => (
                    <div key={content.id} className="relative group">
                      <div onClick={() => handleCardClick(content.id, content.username)} className="cursor-pointer">
                        <SocialMediaCard
                          platform={content.platform}
                          thumbnailUrl={content.thumbnailUrl}
                          username={content.username}
                          userAvatar={content.userAvatar}
                          description={content.description}
                          likes={content.likes}
                          comments={content.comments}
                          shares={content.shares}
                          views={content.views}
                          duration={content.duration}
                          isFollowing={content.isFollowing}
                          hashtags={content.hashtags}
                          className="hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {/* Quick Analyze Button */}
                      <Button
                        onClick={(e) => handleQuickAnalyze(content, e)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg"
                        size="sm"
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Analyze
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-xl text-muted-foreground">No social media content found for "{selectedCategory}".</p>
                  {selectedCategory !== "all" && (
                       <Button variant="link" onClick={() => setSelectedCategory("all")} className="mt-2">
                         Show all categories
                       </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="analyze" className="max-w-4xl mx-auto">
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                <TabsTrigger value="url" className="text-base h-full">
                  <Link className="mr-2 h-5 w-5" /> Analyze by URL
                </TabsTrigger>
                <TabsTrigger value="directText" className="text-base h-full">
                  <Type className="mr-2 h-5 w-5" /> Analyze Direct Text
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="url" className="p-6 bg-card rounded-lg shadow-lg border border-border">
                <AnalyzeURLContent />
              </TabsContent>
              
              <TabsContent value="directText" className="p-6 bg-card rounded-lg shadow-lg border border-border">
                <AnalyzeDirectTextContent />
              </TabsContent>
            </Tabs>
            
            <p className="text-center text-sm text-muted-foreground mt-8">
              Our AI will analyze your content based on the Seven Laws of Virality to provide actionable insights.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
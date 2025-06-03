"use client";

import { useState, useEffect } from 'react';
// import { useSearchParams } from 'next/navigation'; // Commented out as analyze tab is removed
import { Search, Filter, PlayCircle, ExternalLink, Link, Type, FileText, BarChart3, Compass, Zap, UploadCloud, Sparkles } from "lucide-react"; // Added Sparkles for Inspiration
import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"; // Commented out if not used after removing analyze
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Commented out, will use Button group for categories
// import { AspectRatio } from "@/components/ui/aspect-ratio"; // Commented out if not used
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Commented out, removing tabs
// import { Input } from "@/components/ui/input"; // Commented out if not used
// import { Textarea } from "@/components/ui/textarea"; // Commented out if not used
import Image from 'next/image'; // For optimized images
import { SocialMediaCard } from "@/components/common/SocialMediaCard"; // Import SocialMediaCard
import { getAnalyzedVideos } from '@/lib/firestoreService'; // Keep for webhook videos for now, might be refactored

// StandardizedInputGroup might not be needed if analyze is fully removed
// const StandardizedInputGroup = (...) => { ... };

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

// ActionButton might not be needed if analyze is fully removed
// const ActionButton = (...) => { ... };

// Social media content data for discovery/inspiration
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
    category: "marketing", // Matched to inspirationCategories value
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
    category: "educational", // Matched to inspirationCategories value
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
    category: "marketing", // Matched to inspirationCategories value
  },
  {
    id: "tiktok2",
    platform: 'tiktok',
    thumbnailUrl: "https://picsum.photos/seed/tiktok2/350/620",
    username: "@comedyCentral",
    userAvatar: "https://picsum.photos/seed/avatar4/100/100",
    description: "Funniest sketch of the week! You won't believe what happens next... 🤣 #comedy #funny #sketch",
    likes: 250000,
    comments: 5500,
    shares: 12000,
    duration: "0:58",
    isFollowing: false,
    hashtags: ["comedy", "funny", "sketch"],
    category: "comedy", // Matched to inspirationCategories value
  },
  {
    id: "facebook1",
    platform: 'facebook',
    thumbnailUrl: "https://picsum.photos/seed/facebook1/350/620",
    username: "TutorialMaster",
    userAvatar: "https://picsum.photos/seed/avatar5/100/100",
    description: "Learn how to code your first website in 10 minutes! 💻 #coding #tutorial #webdev",
    likes: 32000,
    comments: 890,
    shares: 1200,
    duration: "10:00",
    isFollowing: true,
    hashtags: ["coding", "tutorial", "webdev"],
    category: "tutorials", // Matched to inspirationCategories value
  },
  {
    id: "instagram2",
    platform: 'instagram',
    thumbnailUrl: "https://picsum.photos/seed/instagram2/350/620",
    username: "@trendingNow",
    userAvatar: "https://picsum.photos/seed/avatar6/100/100",
    description: "This new dance trend is taking over! 🔥 #trending #dance #viral",
    likes: 156000,
    comments: 2800,
    shares: 670,
    views: 420000,
    duration: "0:30",
    isFollowing: false,
    hashtags: ["trending", "dance", "viral"],
    category: "trending", // Matched to inspirationCategories value
  },
  {
    id: "youtubeShort1",
    platform: 'youtube',
    thumbnailUrl: "https://picsum.photos/seed/youtubeshort1/350/620",
    username: "QuickTipsDaily",
    userAvatar: "https://picsum.photos/seed/avatar7/100/100",
    description: "Life hack you NEED to know! #shorts #lifehack #tips",
    likes: 500000,
    comments: 1200,
    views: 2000000,
    duration: "0:15",
    isFollowing: true,
    hashtags: ["shorts", "lifehack", "tips"],
    category: "shorts", // Matched to inspirationCategories value
  },
];

const inspirationCategories = [
  { value: "all", label: "All" },
  { value: "trending", label: "Trending" },
  { value: "shorts", label: "Shorts" },
  { value: "tutorials", label: "Tutorials" },
  { value: "comedy", label: "Comedy" },
  { value: "marketing", label: "Marketing" },
  { value: "educational", label: "Educational" },
];

// // Content for "Analyze by URL" tab - REMOVING
// const AnalyzeURLContent = () => { ... };

// // Content for "Analyze Direct Text" tab - REMOVING
// const AnalyzeDirectTextContent = () => { ... };

export default function InspirationPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  // const [activeTab, setActiveTab] = useState("discover"); // Removing tabs
  const [webhookVideos, setWebhookVideos] = useState([]); 
  const [isLoadingWebhookVideos, setIsLoadingWebhookVideos] = useState(true);
  // const searchParams = useSearchParams(); // Removing as analyze tab is gone

  // useEffect(() => { // Removing as analyze tab is gone
  //   const tab = searchParams.get('tab');
  //   if (tab === 'analyze') {
  //     setActiveTab('analyze');
  //   }
  // }, [searchParams]);

  const fetchWebhookVideos = async () => {
    try {
      setIsLoadingWebhookVideos(true);
      const videos = await getAnalyzedVideos(10);
      setWebhookVideos(videos);
      console.log('[InspirationPage] Fetched webhook videos:', videos.length);
    } catch (error) {
      console.error('[InspirationPage] Error fetching webhook videos:', error);
    } finally {
      setIsLoadingWebhookVideos(false);
    }
  };

  useEffect(() => {
    fetchWebhookVideos();
  }, []);

  const handleRefreshWebhookVideos = () => {
    console.log('[InspirationPage] Manually refreshing webhook videos...');
    fetchWebhookVideos();
  };

  const handleCardClick = (contentId, username) => {
    console.log(`Navigate to breakdown for content: ${username} (ID: ${contentId})`);
    // Example navigation: router.push(`/inspiration/breakdown/${contentId}`);
  };

  // const handleQuickAnalyze = (content, event) => { // Removing Analyze functionality
  //   event.stopPropagation(); 
  //   console.log(`Quick analyze for: ${content.username}`);
  //   setActiveTab("analyze"); 
  // };

  const filteredMockContent = selectedCategory === "all"
    ? socialMediaContent
    : socialMediaContent.filter(content => content.category.toLowerCase() === selectedCategory.toLowerCase());

  // Combine webhook videos and mock content for display, ensuring webhook videos are distinct
  const displayedContent = [
    ...webhookVideos.map(v => ({ ...v, id: v.id || v.sourceUrl, isWebhook: true })),
    ...filteredMockContent.filter(fc => !webhookVideos.some(wv => (wv.id || wv.sourceUrl) === fc.id))
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/10 py-8 px-4 md:px-6">
      <div className="container mx-auto space-y-8">
        {/* Updated Header Section - Left Aligned */}
        <div className="mb-10 md:mb-16 text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground flex items-center justify-start">
            <Sparkles className="w-10 h-10 mr-3 text-primary" />
            Find Your Inspiration
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-4 max-w-3xl">
            Browse through trending topics, popular video formats, and successful content to spark your next viral idea.
          </p>
        </div>

        {/* Category Filters - Left Aligned */}
        <div className="flex flex-wrap justify-start gap-2 md:gap-3 mb-10 md:mb-12">
          {inspirationCategories.map(category => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 text-sm md:text-base rounded-full font-medium transition-all duration-150 ease-in-out 
                ${selectedCategory === category.value 
                  ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                  : 'text-foreground bg-background hover:bg-muted/50 border-border'}`}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Removed Tabs Component */}
        {/* <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full"> ... </Tabs> */}
        
        {/* Content Display Area - Directly showing videos */}
        <div className="space-y-8">
          {/* Webhook Processed Videos Section - Can be integrated or kept separate */}
          {webhookVideos.length > 0 && !isLoadingWebhookVideos && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <UploadCloud className="h-6 w-6 mr-3 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">Recently Processed</h2>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {webhookVideos.map(video => (
                  <div key={video.id || video.sourceUrl} className="relative group">
                    <div onClick={() => handleCardClick(video.id || video.sourceUrl, video.authorUsername || 'Unknown')} className="cursor-pointer">
                      <SocialMediaCard
                        platform={mapPlatformType(video.platform || video.sourceSite)}
                        thumbnailUrl={video.thumbnailUrl}
                        username={video.authorUsername || 'Unknown'}
                        userAvatar={video.thumbnailUrl || "/placeholder.svg"} 
                        description={video.title || video.description || 'No description available'}
                        likes={0} 
                        comments={0}
                        shares={0}
                        duration={video.duration}
                        isFollowing={false}
                        hashtags={[]}
                        className="hover:scale-105 transition-transform duration-300 border-2 border-primary/20"
                      />
                    </div>
                    {/* Quick Analyze Button - REMOVED */}
                    {/* <Button onClick={(e) => handleQuickAnalyze(video, e)} ...> */}
                  </div>
                ))}
              </div>
            </div>
          )}
          {isLoadingWebhookVideos && webhookVideos.length === 0 && (
            <div className="text-center py-10">
                <p className="text-muted-foreground">Loading recently processed videos...</p>
            </div>
          )}

          {/* Curated/Mock Content Section */}
          <div>
            <div className="flex items-center mb-6">
              <Compass className="h-6 w-6 mr-3 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Explore Content</h2>
            </div>
            {displayedContent.filter(c => !c.isWebhook).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {displayedContent.filter(c => !c.isWebhook).map(content => (
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
                    {/* Quick Analyze Button - REMOVED */}
                    {/* <Button onClick={(e) => handleQuickAnalyze(content, e)} ... > */}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No content found for &quot;{selectedCategory}&quot;.</p>
                {selectedCategory !== "all" && (
                  <Button variant="link" onClick={() => setSelectedCategory("all")} className="mt-2">
                    Show all categories
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Analyze Tabs Content - REMOVED */}
        {/* <TabsContent value="analyze" className="max-w-4xl mx-auto"> ... </TabsContent> */}
      </div>
    </div>
  );
} 
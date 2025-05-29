import React, { useState } from 'react';
import CuratedVideoDisplayCard from './CuratedVideoDisplayCard';
import ActionButton from './ActionButton';
import { Search, Filter, Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

const CuratedVideoDisplayCardExample: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const handleVideoClick = (videoId: string, title: string) => {
    setSelectedVideo(videoId);
    alert(`Clicked on video: ${title}\nVideo ID: ${videoId}`);
  };

  // Sample video data
  const videoData = [
    {
      id: 'video-1',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=450&fit=crop',
      title: 'Complete Guide to React Hooks',
      description: 'Learn everything about React Hooks including useState, useEffect, useContext, and custom hooks. Perfect for beginners and intermediate developers.',
    },
    {
      id: 'video-2',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=450&fit=crop',
      title: 'Building Modern UIs with Tailwind CSS',
      description: 'Master Tailwind CSS utility classes and create beautiful, responsive user interfaces. Includes practical examples and best practices.',
    },
    {
      id: 'video-3',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop',
      title: 'TypeScript for JavaScript Developers',
      description: 'Transition from JavaScript to TypeScript with confidence. Learn type annotations, interfaces, generics, and advanced TypeScript patterns.',
    },
    {
      id: 'video-4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=450&fit=crop',
      title: 'Next.js App Router Deep Dive',
      description: 'Explore the new App Router in Next.js 13+. Learn about server components, streaming, and modern React patterns for production apps.',
    },
    {
      id: 'video-5',
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
      title: 'API Design Best Practices',
      description: 'Design robust and scalable APIs with REST and GraphQL. Learn about authentication, rate limiting, and API documentation strategies.',
    },
    {
      id: 'video-6',
      thumbnailUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=450&fit=crop',
      title: 'Database Optimization Techniques',
      description: 'Optimize your database queries and improve application performance. Covers indexing, query optimization, and database design patterns.',
    },
    {
      id: 'video-7',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop',
      title: 'DevOps for Frontend Developers',
      description: 'Learn essential DevOps practices for frontend developers. CI/CD pipelines, deployment strategies, and monitoring for web applications.',
    },
    {
      id: 'video-8',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop',
      title: 'Mobile-First Design Principles',
      description: 'Create responsive designs that work perfectly on all devices. Learn mobile-first CSS, touch interactions, and performance optimization.',
    },
  ];

  // Filter videos based on search term
  const filteredVideos = videoData.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold mb-2">Curated Video Display Cards</h1>
        <p className="text-muted-foreground">
          Interactive video cards with thumbnails, hover effects, and click functionality
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <ActionButton
            text=""
            onClick={() => setViewMode('grid')}
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            size="sm"
          >
            <Grid className="h-4 w-4" />
          </ActionButton>
          <ActionButton
            text=""
            onClick={() => setViewMode('list')}
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
          >
            <List className="h-4 w-4" />
          </ActionButton>
        </div>
      </div>

      {/* Basic Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Basic Usage Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CuratedVideoDisplayCard
            videoThumbnailUrl="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=450&fit=crop"
            videoTitle="Getting Started with React"
            videoDescription="A comprehensive introduction to React fundamentals, components, and modern development practices."
            onClick={() => handleVideoClick('demo-1', 'Getting Started with React')}
          />
          
          <CuratedVideoDisplayCard
            videoThumbnailUrl="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=450&fit=crop"
            videoTitle="Advanced CSS Techniques"
            videoDescription="Master advanced CSS features including Grid, Flexbox, animations, and modern layout techniques."
            onClick={() => handleVideoClick('demo-2', 'Advanced CSS Techniques')}
          />
          
          <CuratedVideoDisplayCard
            videoThumbnailUrl="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop"
            videoTitle="JavaScript ES6+ Features"
            videoDescription="Explore modern JavaScript features that will make your code cleaner and more efficient."
            onClick={() => handleVideoClick('demo-3', 'JavaScript ES6+ Features')}
            className="border-primary/30"
          />
        </div>
      </section>

      {/* Video Gallery */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Video Gallery</h2>
          <div className="text-sm text-muted-foreground">
            {filteredVideos.length} of {videoData.length} videos
          </div>
        </div>
        
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No videos found matching your search.</p>
          </div>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          )}>
            {filteredVideos.map((video) => (
              <CuratedVideoDisplayCard
                key={video.id}
                videoThumbnailUrl={video.thumbnailUrl}
                videoTitle={video.title}
                videoDescription={video.description}
                onClick={() => handleVideoClick(video.id, video.title)}
                className={cn(
                  viewMode === 'list' && 'flex flex-row max-w-none',
                  selectedVideo === video.id && 'ring-2 ring-primary'
                )}
              />
            ))}
          </div>
        )}
      </section>

      {/* Custom Styled Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Custom Styling Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CuratedVideoDisplayCard
            videoThumbnailUrl="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop"
            videoTitle="Featured Tutorial"
            videoDescription="This video card has custom styling with enhanced borders and special highlighting."
            onClick={() => handleVideoClick('featured-1', 'Featured Tutorial')}
            className="border-2 border-primary bg-primary/5"
          />
          
          <CuratedVideoDisplayCard
            videoThumbnailUrl="https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=450&fit=crop"
            videoTitle="Premium Content"
            videoDescription="Premium video content with gold accent styling and enhanced visual treatment."
            onClick={() => handleVideoClick('premium-1', 'Premium Content')}
            className="border-2 border-amber-300 bg-amber-50 shadow-lg"
          />
          
          <CuratedVideoDisplayCard
            videoThumbnailUrl="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop"
            videoTitle="New Release"
            videoDescription="Latest video release with special new content indicator and fresh styling."
            onClick={() => handleVideoClick('new-1', 'New Release')}
            className="border-2 border-green-300 bg-green-50"
          />
        </div>
      </section>

      {/* Compact Layout */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Compact Layout</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videoData.slice(0, 4).map((video) => (
            <CuratedVideoDisplayCard
              key={`compact-${video.id}`}
              videoThumbnailUrl={video.thumbnailUrl}
              videoTitle={video.title}
              videoDescription={video.description}
              onClick={() => handleVideoClick(video.id, video.title)}
              className="max-w-sm"
            />
          ))}
        </div>
      </section>

      {/* Wide Layout */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Wide Layout Example</h2>
        
        <div className="max-w-4xl">
          <CuratedVideoDisplayCard
            videoThumbnailUrl="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=675&fit=crop"
            videoTitle="Complete Web Development Masterclass"
            videoDescription="A comprehensive 10-hour course covering everything from HTML basics to advanced React patterns. Learn frontend and backend development, database design, deployment strategies, and modern development workflows. Perfect for beginners looking to become full-stack developers."
            onClick={() => handleVideoClick('masterclass-1', 'Complete Web Development Masterclass')}
            className="w-full"
          />
        </div>
      </section>

      {/* Interactive Features Demo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Interactive Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CuratedVideoDisplayCard
            videoThumbnailUrl="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=450&fit=crop"
            videoTitle="Click to See Alert"
            videoDescription="This card demonstrates the onClick functionality with a custom alert message."
            onClick={() => alert('Custom click handler executed!\n\nYou can navigate to video details, open a modal, or perform any action here.')}
          />
          
          <CuratedVideoDisplayCard
            videoThumbnailUrl="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop"
            videoTitle="Console Log Demo"
            videoDescription="This card logs information to the console when clicked. Check your browser console!"
            onClick={() => {
              console.log('Video card clicked!', {
                title: 'Console Log Demo',
                timestamp: new Date().toISOString(),
                action: 'navigate_to_video'
              });
              alert('Check your browser console for logged information!');
            }}
          />
          
          <CuratedVideoDisplayCard
            videoThumbnailUrl="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop"
            videoTitle="State Update Demo"
            videoDescription="This card updates the selected video state when clicked, showing selection feedback."
            onClick={() => setSelectedVideo(selectedVideo === 'state-demo' ? null : 'state-demo')}
            className={selectedVideo === 'state-demo' ? 'ring-2 ring-primary bg-primary/5' : ''}
          />
        </div>
      </section>

      {/* Status Display */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-medium mb-2">Current State:</h3>
        <div className="space-y-1 text-sm">
          <div><strong>Selected Video:</strong> {selectedVideo || 'None'}</div>
          <div><strong>View Mode:</strong> {viewMode}</div>
          <div><strong>Search Term:</strong> {searchTerm || 'None'}</div>
          <div><strong>Filtered Videos:</strong> {filteredVideos.length} / {videoData.length}</div>
        </div>
      </div>
    </div>
  );
};

export default CuratedVideoDisplayCardExample; 
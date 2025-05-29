# CuratedVideoDisplayCard Component

A reusable React component that wraps ShadCN UI's Card component to display video content in an attractive gallery format with interactive hover effects and click functionality.

## Features

- **Video Gallery Display**: Optimized for showcasing video content with thumbnails
- **Interactive Hover Effects**: Smooth animations including scale, shadow, and play button overlay
- **Responsive Design**: Maintains aspect ratio and works across all screen sizes
- **Click Functionality**: Customizable onClick handler for navigation or modal triggers
- **Play Button Overlay**: Appears on hover with smooth transitions
- **Gradient Overlay**: Enhances text readability over thumbnail images
- **Accessible**: Includes proper alt text and keyboard navigation support
- **Customizable**: Supports custom styling through className prop

## Props

### `videoThumbnailUrl` (required)
- **Type**: `string`
- **Description**: URL for the video thumbnail image
- **Example**: `"https://example.com/thumbnail.jpg"`
- **Note**: Should be optimized for web display (recommended: 16:9 aspect ratio)

### `videoTitle` (required)
- **Type**: `string`
- **Description**: The title of the video displayed prominently in the card
- **Example**: `"Complete Guide to React Hooks"`
- **Behavior**: Truncated with line-clamp-2 for long titles

### `videoDescription` (required)
- **Type**: `string`
- **Description**: A short description or key takeaway of the video
- **Example**: `"Learn everything about React Hooks including useState, useEffect, and custom hooks."`
- **Behavior**: Truncated with line-clamp-3 for long descriptions

### `onClick` (required)
- **Type**: `() => void`
- **Description**: Function called when the card is clicked
- **Example**: `() => navigate('/video/123')` or `() => openVideoModal(videoId)`
- **Use Cases**: Navigation, modal opening, analytics tracking

### `className` (optional)
- **Type**: `string`
- **Description**: Additional Tailwind CSS classes for the Card root
- **Example**: `"border-primary/30 shadow-lg"`

## Basic Usage

```tsx
import CuratedVideoDisplayCard from '@/components/CuratedVideoDisplayCard';

function VideoGallery() {
  const handleVideoClick = () => {
    // Navigate to video page or open modal
    console.log('Video clicked!');
  };

  return (
    <CuratedVideoDisplayCard
      videoThumbnailUrl="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=450&fit=crop"
      videoTitle="Complete Guide to React Hooks"
      videoDescription="Learn everything about React Hooks including useState, useEffect, useContext, and custom hooks."
      onClick={handleVideoClick}
    />
  );
}
```

## Advanced Examples

### Navigation Integration
```tsx
import { useRouter } from 'next/router';

function VideoCard({ videoId, ...videoProps }) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/videos/${videoId}`);
  };

  return (
    <CuratedVideoDisplayCard
      {...videoProps}
      onClick={handleClick}
    />
  );
}
```

### Modal Integration
```tsx
function VideoGallery() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  return (
    <>
      <CuratedVideoDisplayCard
        videoThumbnailUrl="..."
        videoTitle="Advanced CSS Techniques"
        videoDescription="Master advanced CSS features..."
        onClick={() => setSelectedVideo(videoData)}
      />
      
      {selectedVideo && (
        <VideoModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}
    </>
  );
}
```

### Custom Styling
```tsx
// Featured video with special styling
<CuratedVideoDisplayCard
  videoThumbnailUrl="..."
  videoTitle="Featured Tutorial"
  videoDescription="Special featured content..."
  onClick={handleClick}
  className="border-2 border-primary bg-primary/5 shadow-xl"
/>

// Premium content styling
<CuratedVideoDisplayCard
  videoThumbnailUrl="..."
  videoTitle="Premium Course"
  videoDescription="Exclusive premium content..."
  onClick={handleClick}
  className="border-2 border-amber-300 bg-amber-50"
/>
```

### Gallery Layout
```tsx
function VideoGallery({ videos }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <CuratedVideoDisplayCard
          key={video.id}
          videoThumbnailUrl={video.thumbnail}
          videoTitle={video.title}
          videoDescription={video.description}
          onClick={() => handleVideoClick(video.id)}
        />
      ))}
    </div>
  );
}
```

## Design System Integration

### Default Styling
The component includes sophisticated hover effects and visual enhancements:

- **Hover Animation**: Scale (1.02x) and translate (-4px Y) with smooth transitions
- **Shadow Enhancement**: Increases shadow on hover for depth
- **Image Zoom**: Thumbnail scales (1.05x) on hover
- **Play Button**: Appears with fade-in animation on hover
- **Color Transitions**: Title color changes to primary on hover

### Visual Elements
- **Aspect Ratio**: Video thumbnails maintain 16:9 aspect ratio
- **Play Button**: Circular white overlay with primary-colored play icon
- **Gradient Overlay**: Subtle gradient at bottom for text readability
- **Typography**: Large title with smaller muted description text
- **Spacing**: Consistent padding and margins following design system

## Component Structure

```tsx
<Card className="interactive-video-card">
  <div className="thumbnail-container">
    <img className="aspect-video" />
    <div className="play-button-overlay">
      <PlayButton />
    </div>
    <div className="gradient-overlay" />
  </div>
  
  <CardHeader>
    <CardTitle>{videoTitle}</CardTitle>
  </CardHeader>
  
  <CardContent>
    <p>{videoDescription}</p>
  </CardContent>
</Card>
```

## Accessibility Features

- **Alt Text**: Proper alt attributes for thumbnail images
- **Keyboard Navigation**: Full keyboard support through ShadCN Card component
- **Focus Management**: Clear focus indicators and proper tab order
- **Screen Reader Support**: Semantic HTML structure with proper headings
- **Click Areas**: Large click targets for better usability
- **Color Contrast**: Meets WCAG guidelines for text over images

## Responsive Behavior

### Mobile (< 768px)
- Single column layout
- Touch-optimized click targets
- Proper spacing for mobile viewing

### Tablet (768px - 1024px)
- 2-column grid layout
- Maintains hover effects for devices that support them

### Desktop (> 1024px)
- 3-4 column grid layouts
- Full hover animations and effects
- Optimal viewing experience

## Performance Considerations

### Image Optimization
```tsx
// Consider using Next.js Image component for better performance
import Image from 'next/image';

// Custom implementation with Next.js Image
<div className="relative aspect-video overflow-hidden">
  <Image
    src={videoThumbnailUrl}
    alt={videoTitle}
    fill
    className="object-cover transition-transform duration-300 group-hover:scale-105"
  />
</div>
```

### Lazy Loading
```tsx
// For large galleries, implement lazy loading
<img
  src={videoThumbnailUrl}
  alt={videoTitle}
  loading="lazy"
  className="w-full aspect-video object-cover"
/>
```

## Integration with Other Components

### With ActionButton
```tsx
// Add action buttons within the card
<CuratedVideoDisplayCard
  // ... props
  onClick={handleClick}
  className="group"
>
  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <ActionButton
      text="Watch Later"
      size="sm"
      variant="secondary"
      onClick={(e) => {
        e.stopPropagation();
        addToWatchLater(videoId);
      }}
    />
  </div>
</CuratedVideoDisplayCard>
```

### With LoadingIndicator
```tsx
function VideoCard({ video, isLoading }) {
  if (isLoading) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <LoadingIndicator size="md" message="Loading video..." />
      </div>
    );
  }
  
  return <CuratedVideoDisplayCard {...video} />;
}
```

## Best Practices

1. **Image Quality**: Use high-quality thumbnails (minimum 800x450px)
2. **Consistent Aspect Ratios**: Maintain 16:9 aspect ratio for all thumbnails
3. **Descriptive Titles**: Keep titles concise but descriptive (2-3 lines max)
4. **Meaningful Descriptions**: Provide clear value propositions in descriptions
5. **Performance**: Implement lazy loading for large galleries
6. **Analytics**: Track click events for user behavior insights
7. **Error Handling**: Provide fallback images for broken thumbnail URLs
8. **Loading States**: Show loading indicators while content loads

## Common Use Cases

### Video Learning Platform
```tsx
function CourseCatalog({ courses }) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Featured Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CuratedVideoDisplayCard
            key={course.id}
            videoThumbnailUrl={course.thumbnail}
            videoTitle={course.title}
            videoDescription={course.description}
            onClick={() => router.push(`/courses/${course.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
```

### YouTube-style Gallery
```tsx
function VideoFeed({ videos }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <CuratedVideoDisplayCard
          key={video.id}
          videoThumbnailUrl={video.snippet.thumbnails.medium.url}
          videoTitle={video.snippet.title}
          videoDescription={video.snippet.description}
          onClick={() => playVideo(video.id)}
        />
      ))}
    </div>
  );
}
```

### Tutorial Library
```tsx
function TutorialLibrary({ tutorials, onVideoSelect }) {
  return (
    <div className="space-y-6">
      {tutorials.map((category) => (
        <div key={category.name}>
          <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.videos.map((video) => (
              <CuratedVideoDisplayCard
                key={video.id}
                videoThumbnailUrl={video.thumbnail}
                videoTitle={video.title}
                videoDescription={video.description}
                onClick={() => onVideoSelect(video)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Examples File

See `CuratedVideoDisplayCard.example.tsx` for comprehensive examples including:
- Basic usage patterns
- Interactive gallery with search and filtering
- Different layout options (grid, list, compact, wide)
- Custom styling variations
- Real-world integration examples
- State management demonstrations
- Performance optimization techniques 
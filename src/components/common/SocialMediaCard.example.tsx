"use client"

import { SocialMediaCard } from "./SocialMediaCard"

// Example data that would come from your API
const exampleVideoData = [
  {
    platform: 'tiktok' as const,
    videoUrl: "https://example.com/tiktok-video.mp4",
    thumbnailUrl: "https://example.com/tiktok-thumb.jpg",
    username: "@creativecreator",
    userAvatar: "https://example.com/avatar1.jpg",
    description: "Amazing dance moves that will blow your mind! 🔥 #dance #viral #fyp",
    likes: 125000,
    comments: 3400,
    shares: 890,
    duration: "0:15",
    isFollowing: false,
    hashtags: ["dance", "viral", "fyp", "trending", "amazing"]
  },
  {
    platform: 'instagram' as const,
    thumbnailUrl: "https://example.com/instagram-thumb.jpg",
    username: "@lifestyle_guru",
    userAvatar: "https://example.com/avatar2.jpg",
    description: "Morning routine that changed my life ✨ What's your morning ritual?",
    likes: 89000,
    comments: 1200,
    shares: 450,
    views: 250000,
    duration: "0:30",
    isFollowing: true,
    hashtags: ["morningroutine", "lifestyle", "selfcare", "motivation"]
  },
  {
    platform: 'youtube' as const,
    thumbnailUrl: "https://example.com/youtube-thumb.jpg",
    username: "TechReviewer",
    userAvatar: "https://example.com/avatar3.jpg",
    description: "iPhone 15 Pro Max Review - Is it worth the upgrade? 📱",
    likes: 45000,
    comments: 2100,
    views: 890000,
    duration: "8:45",
    isFollowing: false,
    hashtags: ["tech", "iphone", "review", "apple"]
  },
  {
    platform: 'facebook' as const,
    thumbnailUrl: "https://example.com/facebook-thumb.jpg",
    username: "FoodieAdventures",
    userAvatar: "https://example.com/avatar4.jpg",
    description: "5-minute pasta recipe that will save your weeknight dinners! 🍝",
    likes: 12000,
    comments: 890,
    shares: 340,
    duration: "1:20",
    isFollowing: false,
    hashtags: ["cooking", "pasta", "quickrecipes", "dinner"]
  }
]

// Example of how you might process API data
interface ApiVideoData {
  id: string
  platform: string
  video_url?: string
  thumbnail_url?: string
  user: {
    username: string
    avatar_url: string
    is_following?: boolean
  }
  content: {
    description: string
    hashtags?: string[]
    duration?: string
  }
  metrics: {
    likes: number
    comments: number
    shares?: number
    views?: number
  }
}

function transformApiDataToCardProps(apiData: ApiVideoData) {
  return {
    platform: apiData.platform as 'tiktok' | 'instagram' | 'youtube' | 'facebook',
    videoUrl: apiData.video_url,
    thumbnailUrl: apiData.thumbnail_url,
    username: apiData.user.username,
    userAvatar: apiData.user.avatar_url,
    description: apiData.content.description,
    likes: apiData.metrics.likes,
    comments: apiData.metrics.comments,
    shares: apiData.metrics.shares,
    views: apiData.metrics.views,
    duration: apiData.content.duration,
    isFollowing: apiData.user.is_following,
    hashtags: apiData.content.hashtags || []
  }
}

export default function SocialMediaCardExample() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Social Media Cards</h1>
        <p className="text-center text-gray-600 mb-12">
          Adaptive cards for TikTok, Instagram Reels, YouTube Shorts, and Facebook Reels
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {exampleVideoData.map((video, index) => (
            <SocialMediaCard
              key={index}
              platform={video.platform}
              videoUrl={video.videoUrl}
              thumbnailUrl={video.thumbnailUrl}
              username={video.username}
              userAvatar={video.userAvatar}
              description={video.description}
              likes={video.likes}
              comments={video.comments}
              shares={video.shares}
              views={video.views}
              duration={video.duration}
              isFollowing={video.isFollowing}
              hashtags={video.hashtags}
            />
          ))}
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Usage with API Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`// Example API integration
const fetchVideoData = async () => {
  const response = await fetch('/api/videos')
  const apiData: ApiVideoData[] = await response.json()
  
  return apiData.map(transformApiDataToCardProps)
}

// In your component
const [videos, setVideos] = useState([])

useEffect(() => {
  fetchVideoData().then(setVideos)
}, [])

return (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {videos.map((video, index) => (
      <SocialMediaCard key={video.id || index} {...video} />
    ))}
  </div>
)`}
          </pre>
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-pink-600 mb-2">TikTok</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Pink accent color</li>
                <li>• Music attribution</li>
                <li>• Heart icon for likes</li>
                <li>• Black background</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-purple-600 mb-2">Instagram</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Gradient background</li>
                <li>• Purple accent color</li>
                <li>• Heart icon for likes</li>
                <li>• Hashtag support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-red-600 mb-2">YouTube</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Red accent color</li>
                <li>• Thumbs up for likes</li>
                <li>• View count display</li>
                <li>• Video controls</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">Facebook</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Blue accent color</li>
                <li>• Gray background</li>
                <li>• Heart icon for likes</li>
                <li>• Share functionality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
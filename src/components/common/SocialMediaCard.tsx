"use client"

import { useState } from "react"
import { Heart, MessageCircle, Share2, Bookmark, Music, Play, Eye, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatNumber } from "@/lib/utils"

// Platform-specific icons (you can replace these with actual brand icons)
const PlatformIcons = {
  tiktok: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.04-.1z"/>
    </svg>
  ),
  instagram: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  youtube: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  facebook: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

type Platform = 'tiktok' | 'instagram' | 'youtube' | 'facebook'

interface SocialMediaCardProps {
  platform: Platform
  videoUrl?: string
  thumbnailUrl?: string
  username: string
  userAvatar: string
  description: string
  likes: number
  comments: number
  shares?: number
  views?: number
  duration?: string
  isFollowing?: boolean
  hashtags?: string[]
  className?: string
}

const platformConfig = {
  tiktok: {
    name: 'TikTok',
    primaryColor: 'text-pink-500',
    bgColor: 'bg-black',
    textColor: 'text-white',
    accentColor: 'bg-pink-500 hover:bg-pink-600',
    borderColor: 'border-pink-500',
    aspectRatio: 'aspect-[9/16]'
  },
  instagram: {
    name: 'Instagram',
    primaryColor: 'text-purple-500',
    bgColor: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
    textColor: 'text-white',
    accentColor: 'bg-purple-500 hover:bg-purple-600',
    borderColor: 'border-purple-500',
    aspectRatio: 'aspect-[9/16]'
  },
  youtube: {
    name: 'YouTube',
    primaryColor: 'text-red-500',
    bgColor: 'bg-black',
    textColor: 'text-white',
    accentColor: 'bg-red-500 hover:bg-red-600',
    borderColor: 'border-red-500',
    aspectRatio: 'aspect-[9/16]'
  },
  facebook: {
    name: 'Facebook',
    primaryColor: 'text-blue-500',
    bgColor: 'bg-gray-900',
    textColor: 'text-white',
    accentColor: 'bg-blue-500 hover:bg-blue-600',
    borderColor: 'border-blue-500',
    aspectRatio: 'aspect-[9/16]'
  }
}

export function SocialMediaCard({
  platform,
  videoUrl,
  thumbnailUrl,
  username,
  userAvatar,
  description,
  likes,
  comments,
  shares = 0,
  views,
  duration,
  isFollowing = false,
  hashtags = [],
  className = ""
}: SocialMediaCardProps) {
  const [liked, setLiked] = useState(false)
  const [following, setFollowing] = useState(isFollowing)
  const [bookmarked, setBookmarked] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const config = platformConfig[platform]
  const PlatformIcon = PlatformIcons[platform]

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className={`relative max-w-[350px] rounded-xl overflow-hidden shadow-xl ${config.bgColor} ${config.textColor} ${className}`}>
      {/* Platform badge */}
      <div className="absolute top-2 left-2 z-10">
        <Badge variant="secondary" className={`${config.accentColor} ${config.textColor} border-0`}>
          <PlatformIcon />
          <span className="ml-1 text-xs font-medium">{config.name}</span>
        </Badge>
      </div>

      {/* Video/Thumbnail container */}
      <div className="relative">
        {videoUrl ? (
          <video 
            className={`w-full ${config.aspectRatio} object-cover`} 
            src={videoUrl} 
            poster={thumbnailUrl}
            loop 
            muted 
            playsInline 
            controls={platform === 'youtube'}
            onClick={platform !== 'youtube' ? handlePlayToggle : undefined}
          />
        ) : thumbnailUrl ? (
          <div className={`relative w-full ${config.aspectRatio} bg-gray-800`}>
            <img 
              src={thumbnailUrl} 
              alt={description}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                onClick={handlePlayToggle}
                className="bg-black/60 hover:bg-black/80 rounded-full p-4 transition-colors"
              >
                <Play className="w-8 h-8 text-white fill-white" />
              </button>
            </div>
            {duration && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {duration}
              </div>
            )}
          </div>
        ) : (
          <div className={`w-full ${config.aspectRatio} bg-gray-800 flex items-center justify-center`}>
            <Play className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Interaction buttons (vertical) */}
        <div className="absolute bottom-4 right-2 flex flex-col gap-4">
          {/* Like button */}
          <button className="flex flex-col items-center" onClick={() => setLiked(!liked)}>
            <div className="bg-black/40 p-2 rounded-full backdrop-blur-sm">
              {platform === 'youtube' ? (
                <ThumbsUp className={`w-6 h-6 ${liked ? `fill-current ${config.primaryColor}` : "text-white"}`} />
              ) : (
                <Heart className={`w-6 h-6 ${liked ? `fill-current ${config.primaryColor}` : "text-white"}`} />
              )}
            </div>
            <span className="text-xs mt-1 text-white drop-shadow-lg">
              {formatNumber(liked ? likes + 1 : likes)}
            </span>
          </button>

          {/* Comment button */}
          <button className="flex flex-col items-center">
            <div className="bg-black/40 p-2 rounded-full backdrop-blur-sm">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs mt-1 text-white drop-shadow-lg">
              {formatNumber(comments)}
            </span>
          </button>

          {/* Share button */}
          {shares > 0 && (
            <button className="flex flex-col items-center">
              <div className="bg-black/40 p-2 rounded-full backdrop-blur-sm">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs mt-1 text-white drop-shadow-lg">
                {formatNumber(shares)}
              </span>
            </button>
          )}

          {/* Views (for YouTube) */}
          {views && platform === 'youtube' && (
            <button className="flex flex-col items-center">
              <div className="bg-black/40 p-2 rounded-full backdrop-blur-sm">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs mt-1 text-white drop-shadow-lg">
                {formatNumber(views)}
              </span>
            </button>
          )}

          {/* Bookmark button */}
          <button className="flex flex-col items-center" onClick={() => setBookmarked(!bookmarked)}>
            <div className="bg-black/40 p-2 rounded-full backdrop-blur-sm">
              <Bookmark className={`w-6 h-6 ${bookmarked ? "fill-white text-white" : "text-white"}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Video info */}
      <div className="p-3">
        <div className="flex items-start gap-3">
          <Avatar className={`w-10 h-10 border-2 ${config.borderColor}`}>
            <AvatarImage src={userAvatar || "/placeholder.svg"} alt={username} />
            <AvatarFallback className={config.primaryColor}>
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold">{username}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
                
                {/* Hashtags */}
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {hashtags.slice(0, 3).map((tag, index) => (
                      <span key={index} className={`text-xs ${config.primaryColor} font-medium`}>
                        #{tag}
                      </span>
                    ))}
                    {hashtags.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{hashtags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>

              {isFollowing !== undefined && (
                <Button
                  variant={following ? "outline" : "default"}
                  size="sm"
                  className={
                    following
                      ? `h-8 ${config.borderColor} ${config.primaryColor} hover:${config.primaryColor}`
                      : `h-8 ${config.accentColor} text-white`
                  }
                  onClick={() => setFollowing(!following)}
                >
                  {following ? "Following" : "Follow"}
                </Button>
              )}
            </div>

            {/* Platform-specific footer */}
            {platform === 'tiktok' && (
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Music className="w-3 h-3 mr-1" />
                <p className="truncate">Original sound - {username}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
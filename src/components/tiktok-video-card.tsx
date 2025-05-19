"use client"

import { useState } from "react"
import { Heart, MessageCircle, Share2, Bookmark, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatNumber } from "@/lib/utils"

interface TikTokVideoCardProps {
  videoUrl: string
  username: string
  userAvatar: string
  description: string
  likes: number
  comments: number
  shares: number
  isFollowing: boolean
}

export function TikTokVideoCard({
  videoUrl,
  username,
  userAvatar,
  description,
  likes,
  comments,
  shares,
  isFollowing,
}: TikTokVideoCardProps) {
  const [liked, setLiked] = useState(false)
  const [following, setFollowing] = useState(isFollowing)
  const [bookmarked, setBookmarked] = useState(false)

  return (
    <div className="max-w-[350px] rounded-xl overflow-hidden bg-black text-white shadow-xl">
      {/* Video container */}
      <div className="relative">
        <video className="w-full aspect-[9/16] object-cover" src={videoUrl} loop muted playsInline controls />

        {/* Interaction buttons (vertical) */}
        <div className="absolute bottom-4 right-2 flex flex-col gap-4">
          {/* Like button */}
          <button className="flex flex-col items-center" onClick={() => setLiked(!liked)}>
            <div className="bg-black/40 p-2 rounded-full">
              <Heart className={`w-7 h-7 ${liked ? "fill-red-500 text-red-500" : "text-white"}`} />
            </div>
            <span className="text-xs mt-1">{formatNumber(liked ? likes + 1 : likes)}</span>
          </button>

          {/* Comment button */}
          <button className="flex flex-col items-center">
            <div className="bg-black/40 p-2 rounded-full">
              <MessageCircle className="w-7 h-7" />
            </div>
            <span className="text-xs mt-1">{formatNumber(comments)}</span>
          </button>

          {/* Share button */}
          <button className="flex flex-col items-center">
            <div className="bg-black/40 p-2 rounded-full">
              <Share2 className="w-7 h-7" />
            </div>
            <span className="text-xs mt-1">{formatNumber(shares)}</span>
          </button>

          {/* Bookmark button */}
          <button className="flex flex-col items-center" onClick={() => setBookmarked(!bookmarked)}>
            <div className="bg-black/40 p-2 rounded-full">
              <Bookmark className={`w-7 h-7 ${bookmarked ? "fill-white" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Video info */}
      <div className="p-3 bg-black">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 border-2 border-white">
            <AvatarImage src={userAvatar || "/placeholder.svg"} alt={username} />
            <AvatarFallback>TK</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{username}</p>
                <p className="text-sm text-gray-300 line-clamp-2">{description}</p>
              </div>

              <Button
                variant={following ? "outline" : "default"}
                size="sm"
                className={
                  following
                    ? "h-8 border-pink-500 text-pink-500 hover:text-pink-500"
                    : "h-8 bg-pink-500 hover:bg-pink-600"
                }
                onClick={() => setFollowing(!following)}
              >
                {following ? "Following" : "Follow"}
              </Button>
            </div>

            <div className="flex items-center mt-2 text-sm text-gray-300">
              <Music className="w-3 h-3 mr-1" />
              <p className="truncate">Original sound - {username}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

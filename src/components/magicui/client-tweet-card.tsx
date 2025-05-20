"use client"

import { useState, useEffect } from "react"
import { MagicTweet, TweetSkeleton } from "./tweet-card"

// Update the TweetData interface to replace date with url
interface TweetData {
  id: string
  user: TweetUser
  text: string
  url: string
  analyzed: boolean
}

interface TweetUser {
  name: string
  handle: string
  verified: boolean
}

// Update the ClientTweetCardProps interface to include an analyzed property
interface ClientTweetCardProps {
  id: string
  className?: string
  analyzed?: boolean
  onError?: (error: Error) => void
}

// Update the ClientTweetCard component to include the url property in the placeholder tweet
export function ClientTweetCard({ id, className, analyzed = false, onError }: ClientTweetCardProps) {
  const [loading, setLoading] = useState(true)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [id])

  if (loading) {
    return <TweetSkeleton className={className} />
  }

  // Placeholder tweet data
  const placeholderTweet: TweetData = {
    id: id || "123456789",
    user: {
      name: "John Doe",
      handle: "johndoe",
      verified: true,
    },
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
    url: "https://example.com/article/12345",
    analyzed: analyzed,
  }

  return <MagicTweet tweet={placeholderTweet} className={className} />
} 
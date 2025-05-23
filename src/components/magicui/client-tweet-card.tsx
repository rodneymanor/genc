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

// Update the ClientTweetCardProps interface to include an optional tweet property
interface ClientTweetCardProps {
  id?: string // id can be optional if tweet is provided
  className?: string
  analyzed?: boolean
  onError?: (error: Error) => void
  tweet?: TweetData // Optional tweet prop
}

// Update the ClientTweetCard component to include the url property in the placeholder tweet
export function ClientTweetCard({ id, className, analyzed = false, onError, tweet }: ClientTweetCardProps) {
  const [loading, setLoading] = useState(true)

  // Simulate loading only if tweet is not provided
  useEffect(() => {
    if (!tweet) {
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setLoading(false);
    }
  }, [id, tweet])

  if (!tweet && loading) {
    return <TweetSkeleton className={className} />
  }

  const displayTweet = tweet ? tweet : {
    // Placeholder tweet data if no tweet prop is provided
    id: id || "123456789",
    user: {
      name: "Source Provider", // Generic name
      handle: "source",      // Generic handle
      verified: false,
    },
    text: "No content provided.", // Default text
    url: "#", // Default URL
    analyzed: analyzed,
  };
  
  // If id is provided in props but not in tweet, ensure displayTweet.id uses the prop id.
  // This is for cases where a tweet object is passed but we still want to key/ID it externally.
  if (id && displayTweet.id !== id) {
    displayTweet.id = id;
  }


  return <MagicTweet tweet={displayTweet} className={className} />
} 
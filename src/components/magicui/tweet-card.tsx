import type React from "react"
import { Suspense } from "react"
import { cn } from "@/lib/utils"

interface TwitterIconProps {
  className?: string
  [key: string]: unknown
}

const Twitter = ({ className, ...props }: TwitterIconProps) => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <g>
      <path fill="none" d="M0 0h24v24H0z"></path>
      <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z"></path>
    </g>
  </svg>
)

const Verified = ({ className, ...props }: TwitterIconProps) => (
  <svg aria-label="Verified Account" viewBox="0 0 24 24" className={className} {...props}>
    <g fill="currentColor">
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
    </g>
  </svg>
)

// Add Trash and Visit icons
const TrashIcon = ({ className, ...props }: TwitterIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

const VisitIcon = ({ className, ...props }: TwitterIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

export const truncate = (str: string | null, length: number) => {
  if (!str || str.length <= length) return str
  return `${str.slice(0, length - 3)}...`
}

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("rounded-md bg-primary/10", className)} {...props} />
}

export const TweetSkeleton = ({
  className,
  ...props
}: {
  className?: string
  [key: string]: unknown
}) => (
  <div className={cn("flex size-full max-h-max min-w-72 flex-col gap-2 rounded-lg border p-4", className)} {...props}>
    <div className="flex flex-row gap-2">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <Skeleton className="h-10 w-full" />
    </div>
    <Skeleton className="h-20 w-full" />
  </div>
)

export const TweetNotFound = ({
  className,
  ...props
}: {
  className?: string
  [key: string]: unknown
}) => (
  <div
    className={cn("flex size-full flex-col items-center justify-center gap-2 rounded-lg border p-4", className)}
    {...props}
  >
    <h3>Tweet not found</h3>
  </div>
)

interface TweetUser {
  name: string
  handle: string
  verified: boolean
}

// Update the TweetData interface to replace date with url
interface TweetData {
  id: string
  user: TweetUser
  text: string
  url: string
  analyzed: boolean
}

export const TweetHeader = ({ user }: { user: TweetUser }) => {
  return (
    <div className="flex flex-row justify-between tracking-tight">
      <div className="flex items-center">
        <Twitter className="size-8 text-[#3BA9EE]" />
      </div>
      <div>
        <span className="sr-only">Link to tweet</span>
        <Twitter className="size-5 items-start text-[#3BA9EE] transition-all ease-in-out hover:scale-105" />
      </div>
    </div>
  )
}

export const TweetBody = ({ text }: { text: string }) => {
  return (
    <div className="break-words leading-normal tracking-tighter">
      <span className="text-sm font-normal">{text}</span>
    </div>
  )
}

// Update the AnalysisBadge component to include trash and visit icons
export const AnalysisBadge = ({ analyzed }: { analyzed: boolean }) => {
  return (
    <div className="absolute right-3 top-3 flex items-center space-x-2">
      <button
        className="rounded-full bg-gray-100 p-1.5 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label="Delete"
      >
        <TrashIcon className="size-3.5" />
      </button>
      <button
        className="rounded-full bg-gray-100 p-1.5 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label="Visit"
      >
        <VisitIcon className="size-3.5" />
      </button>
      <div
        className={cn(
          "rounded-full px-2 py-1 text-xs font-medium",
          analyzed
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
            : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
        )}
      >
        {analyzed ? "Analyzed" : "Not Analyzed"}
      </div>
    </div>
  )
}

// Update the MagicTweet component to display the URL instead of the date
export const MagicTweet = ({
  tweet,
  className,
  ...props
}: {
  tweet: TweetData
  className?: string
}) => {
  return (
    <div
      className={cn(
        "relative flex size-full max-w-lg flex-col gap-2 overflow-hidden rounded-lg border p-4 backdrop-blur-md",
        className,
      )}
      {...props}
    >
      <AnalysisBadge analyzed={tweet.analyzed} />
      <TweetHeader user={tweet.user} />
      <TweetBody text={tweet.text} />
      <div className="mt-2 flex items-center text-xs text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mr-1 h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        <a href={tweet.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          {truncate(tweet.url, 40)}
        </a>
      </div>
    </div>
  )
}

// Update the TweetCard component to include the url property in the placeholder tweet
export const TweetCard = ({
  id,
  fallback = <TweetSkeleton />,
  className,
  analyzed = false,
  ...props
}: {
  id: string
  fallback?: React.ReactNode
  className?: string
  analyzed?: boolean
  [key: string]: unknown
}) => {
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

  return (
    <Suspense fallback={fallback}>
      <MagicTweet tweet={placeholderTweet} className={className} {...props} />
    </Suspense>
  )
} 
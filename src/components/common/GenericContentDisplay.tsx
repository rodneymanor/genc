/* eslint-disable @next/next/no-img-element */
import React, { Suspense, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils"; // Assuming this is a utility for classnames

// --- GENERIC ICON (Optional - can be replaced or expanded) ---
interface IconProps {
  className?: string;
  [key: string]: unknown;
}

const LinkIcon = ({ className, ...props }: IconProps) => (
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
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M10 6H7C4.791 6 3 7.791 3 10v4c0 2.209 1.791 4 4 4h3v-2H7c-1.103 0-2-.897-2-2v-4c0-1.103.897-2 2-2h3V6zm4 0h3c2.209 0 4 1.791 4 4v4c0 2.209-1.791 4-4 4h-3v-2h3c1.103 0 2-.897 2-2v-4c0-1.103-.897-2-2-2h-3V6zm-5 7h6v-2H9v2z"></path>
  </svg>
);

const VerifiedBadge = ({ className, ...props }: IconProps) => (
  <svg
    aria-label="Verified"
    viewBox="0 0 24 24"
    className={className}
    {...props}
  >
    <g fill="currentColor">
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
    </g>
  </svg>
);

// --- UTILITIES ---
export const truncate = (str: string | null | undefined, length: number): string | null | undefined => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length - 3)}...`;
};

// --- DATA TYPES ---
interface UserData {
  name: string;
  screenName?: string; // e.g., @username
  avatarUrl?: string;
  profileUrl?: string;
  isVerified?: boolean;
}

interface ContentEntity {
  type: "text" | "url" | "hashtag" | "mention"; // Can be extended
  text: string;
  href?: string;
}

interface MediaItemPhoto {
  type: "photo";
  url: string;
  alt?: string;
}

interface MediaItemVideo {
  type: "video";
  posterUrl?: string;
  sources: Array<{ src: string; type: string }>; // e.g., [{ src: "video.mp4", type: "video/mp4"}]
  alt?: string;
}

type MediaItem = MediaItemPhoto | MediaItemVideo;

export interface GenericContentData {
  user: UserData;
  entities: ContentEntity[];
  media?: MediaItem[];
  sourceUrl?: string; // Link to the original content
  createdAt?: string | Date; // Optional: for displaying creation time
}

// --- UI COMPONENTS ---
const Skeleton = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("rounded-md bg-primary/10 animate-pulse", className)} {...props} />
  );
};

export const CardSkeleton = ({
  className,
  ...props
}: {
  className?: string;
  [key: string]: unknown;
}) => (
  <div
    className={cn(
      "flex size-full max-h-max min-w-72 flex-col gap-2 rounded-lg border bg-background p-4", // Added bg-background for better skeleton visibility
      className,
    )}
    {...props}
  >
    <div className="flex flex-row gap-2">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <Skeleton className="h-10 w-full" />
    </div>
    <Skeleton className="h-20 w-full" />
    <Skeleton className="mt-2 h-32 w-full" />
  </div>
);

export const ContentNotFound = ({
  message = "Content not found",
  className,
  ...props
}: {
  message?: string;
  className?: string;
  [key: string]: unknown;
}) => (
  <div
    className={cn(
      "flex size-full flex-col items-center justify-center gap-2 rounded-lg border p-4",
      className,
    )}
    {...props}
  >
    <h3>{message}</h3>
  </div>
);

export const CardHeader = ({ content }: { content: GenericContentData }) => (
  <div className="flex flex-row justify-between tracking-tight">
    <div className="flex items-center space-x-2">
      {content.user.avatarUrl && (
        <a href={content.user.profileUrl} target="_blank" rel="noopener noreferrer">
          <img
            title={`Profile picture of ${content.user.name}`}
            alt={content.user.screenName || content.user.name}
            height={24}
            width={24}
            src={content.user.avatarUrl}
            className="overflow-hidden rounded-full border border-transparent"
          />
        </a>
      )}
      <div>
        <a
          href={content.user.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center whitespace-nowrap font-semibold"
        >
          {truncate(content.user.name, 20)}
          {content.user.isVerified && (
            <VerifiedBadge className="ml-1 inline size-4 text-blue-500" />
          )}
        </a>
        {content.user.screenName && (
          <div className="flex items-center space-x-1">
            <a
              href={content.user.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-all duration-75 hover:underline"
            >
              @{truncate(content.user.screenName, 16)}
            </a>
          </div>
        )}
      </div>
    </div>
    {content.sourceUrl && (
      <a href={content.sourceUrl} target="_blank" rel="noopener noreferrer" title="View original source">
        <span className="sr-only">Link to content</span>
        <LinkIcon className="size-5 items-start text-muted-foreground transition-all ease-in-out hover:scale-105 hover:text-foreground" />
      </a>
    )}
  </div>
);

export const CardBody = ({ content }: { content: GenericContentData }) => (
  <div className="break-words leading-normal tracking-tighter">
    {content.entities.map((entity, idx) => {
      switch (entity.type) {
        case "url":
        case "hashtag":
        case "mention":
          return (
            <a
              key={idx}
              href={entity.href || "#"} // Provide a fallback href
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-normal text-blue-500 hover:underline" // Example styling
            >
              {entity.text}
            </a>
          );
        case "text":
        default:
          return (
            <span
              key={idx}
              className="text-sm font-normal"
              // Use dangerouslySetInnerHTML only if you trust the source of entity.text
              // or sanitize it first. For simplicity, I'm keeping it.
              dangerouslySetInnerHTML={{ __html: entity.text.replace(/\n/g, "<br />") }}
            />
          );
      }
    })}
  </div>
);

export const CardMedia = ({ content }: { content: GenericContentData }) => {
  if (!content.media || content.media.length === 0) return null;

  return (
    <div className="mt-2 flex flex-1 items-center justify-center">
      {/* Basic example: rendering first media item. 
          You might want to handle multiple media items (e.g., a gallery) */}
      {content.media.map((mediaItem, index) => (
        <div key={index} className="w-full">
          {mediaItem.type === "video" && (
            <video
              poster={mediaItem.posterUrl}
              controls // Added controls for better usability
              playsInline
              className="w-full rounded-xl border object-cover shadow-sm"
              aria-label={mediaItem.alt || "Video content"}
            >
              {mediaItem.sources.map(source => (
                 <source key={source.src} src={source.src} type={source.type} />
              ))}
              Your browser does not support the video tag.
            </video>
          )}
          {mediaItem.type === "photo" && (
            <div className="relative flex transform-gpu snap-x snap-mandatory gap-4 overflow-x-auto">
              {/* This part is for multiple photos, but the original only shows one.
                  Adjust if you want a carousel for multiple photos.
                  For now, let's assume we're adapting to show one or more photos if present.
              */}
              {content.media?.filter(m => m.type === 'photo').map((photoItem, photoIndex) => (
                 <img
                  key={photoItem.url || photoIndex} // Ensure key is unique
                  src={photoItem.url}
                  title={photoItem.alt || `Image from ${content.user.name}`}
                  alt={photoItem.alt || (content.entities.find(e => e.type === 'text')?.text.substring(0,50) || `Image ${photoIndex + 1}`)}
                  className="max-h-80 w-full shrink-0 snap-center snap-always rounded-xl border object-contain shadow-sm" // Changed to object-contain
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};


export const GenericContentDisplay = ({
  content,
  className,
  ...props
}: {
  content: GenericContentData;
  className?: string;
  [key: string]: unknown;
}) => {
  return (
    <div
      className={cn(
        "relative flex size-full max-w-lg flex-col gap-2 overflow-hidden rounded-lg border bg-card text-card-foreground p-4 shadow-lg backdrop-blur-md", // Added some more common tailwind classes
        className,
      )}
      {...props}
    >
      <CardHeader content={content} />
      <CardBody content={content} />
      <CardMedia content={content} />
      {/* You can add a CardFooter here if needed, e.g., for actions or post date */}
      {content.createdAt && (
        <div className="mt-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
                Posted on: {new Date(content.createdAt).toLocaleDateString()}
            </p>
        </div>
      )}
    </div>
  );
};

/**
 * GenericCard (Client or Server Side)
 * This component now expects `contentData` to be passed directly.
 * If you need to fetch data, you'll do it in a parent server component and pass the data down.
 */
export const GenericCard = ({
  contentData,
  className,
  isLoading, // Prop to manually indicate loading state
  error,     // Prop to manually indicate error state
  loadingComponent = <CardSkeleton />,
  notFoundComponent = <ContentNotFound />,
  ...props
}: {
  contentData?: GenericContentData | null;
  className?: string;
  isLoading?: boolean;
  error?: Error | string | null;
  loadingComponent?: React.ReactNode;
  notFoundComponent?: React.ReactNode;
  [key: string]: unknown; // For any other HTMLDivElement props
}) => {
  if (isLoading) {
    return loadingComponent;
  }

  if (error) {
    // You might want to log the error or display a more specific message
    console.error("Error in GenericCard:", error);
    return React.cloneElement(notFoundComponent as React.ReactElement, { message: typeof error === 'string' ? error : "Error loading content." });
  }

  if (!contentData) {
    return notFoundComponent;
  }

  return (
    // Suspense might not be strictly needed here anymore if data is pre-fetched or passed directly
    // However, if internal components of GenericContentDisplay use Suspense, it can remain.
    // For this refactor, assuming direct data, Suspense is less critical at THIS level.
    <GenericContentDisplay content={contentData} className={className} {...props} />
  );
};

// --- Example Usage (Conceptual - how you might use it) ---
/*
// In a Server Component or a page where you fetch data:
async function getMyCustomData(id: string): Promise<GenericContentData | null> {
  // ... your data fetching logic ...
  // Example:
  // const response = await fetch(`https://myapi.com/content/${id}`);
  // if (!response.ok) return null;
  // const data = await response.json();
  // return {
  //   user: {
  //     name: data.authorName,
  //     screenName: data.authorHandle,
  //     avatarUrl: data.authorAvatar,
  //     profileUrl: data.authorProfileLink,
  //     isVerified: data.isAuthorVerified,
  //   },
  //   entities: [{ type: "text", text: data.mainText }],
  //   media: data.imageUrl ? [{ type: "photo", url: data.imageUrl, alt: "Content image" }] : [],
  //   sourceUrl: data.originalPostUrl,
  //   createdAt: data.publishedDate,
  // };
  return null; // Placeholder
}

export default async function MyPage() {
  const contentId = "some-id"; // From params or static
  let data;
  let error;
  let isLoading = true; // Manage loading state if fetching here

  try {
    // data = await getMyCustomData(contentId);
    // For demonstration, using mock data:
    data = {
      user: {
        name: "Jane Doe",
        screenName: "janedoe",
        avatarUrl: "https://via.placeholder.com/48",
        profileUrl: "#",
        isVerified: true,
      },
      entities: [
        { type: "text", text: "This is a generic content card! It can display various types of information. " },
        { type: "hashtag", text: "#generic", href: "#" },
        { type: "text", text: " "},
        { type: "url", text: "Learn more here.", href: "https://example.com" },
      ],
      media: [
        { type: "photo", url: "https://via.placeholder.com/600x400", alt: "Placeholder image" }
      ],
      sourceUrl: "#",
      createdAt: new Date().toISOString(),
    } as GenericContentData;
    isLoading = false;
  } catch (e: any) {
    error = e.message || "Failed to load content";
    isLoading = false;
  }


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Generic Content Card Example</h1>
      <GenericCard
        contentData={data}
        isLoading={isLoading} // Pass loading state
        error={error}         // Pass error state
        className="shadow-xl"
      />

      <h2 className="text-xl font-bold mt-8 mb-2">Loading State:</h2>
      <GenericCard isLoading={true} />

      <h2 className="text-xl font-bold mt-8 mb-2">Not Found State:</h2>
      <GenericCard contentData={null} />

      <h2 className="text-xl font-bold mt-8 mb-2">Error State:</h2>
      <GenericCard error="Something went wrong!" />
    </div>
  );
}
*/ 
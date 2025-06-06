import { siteConfig } from "@/lib/config";
import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || siteConfig.url}${path}`;
}

export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = absoluteUrl("/og"),
  ...props
}: {
  title?: string;
  description?: string;
  image?: string;
  [key: string]: Metadata[keyof Metadata];
}): Metadata {
  return {
    title: {
      template: "%s | " + siteConfig.name,
      default: siteConfig.name,
    },
    description: description || siteConfig.description,
    keywords: siteConfig.keywords,
    openGraph: {
      title,
      description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
      locale: "en_US",
    },
    icons: "/favicon.ico",
    metadataBase: new URL(siteConfig.url),
    authors: [
      {
        name: siteConfig.name,
        url: siteConfig.url,
      },
    ],
    ...props,
  };
}

export function formatDate(date: string) {
  let currentDate = new Date().getTime();
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }
  let targetDate = new Date(date).getTime();
  let timeDifference = Math.abs(currentDate - targetDate);
  let daysAgo = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  let fullDate = new Date(date).toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (daysAgo < 1) {
    return "Today";
  } else if (daysAgo < 7) {
    return `${fullDate} (${daysAgo}d ago)`;
  } else if (daysAgo < 30) {
    const weeksAgo = Math.floor(daysAgo / 7);
    return `${fullDate} (${weeksAgo}w ago)`;
  } else if (daysAgo < 365) {
    const monthsAgo = Math.floor(daysAgo / 30);
    return `${fullDate} (${monthsAgo}mo ago)`;
  } else {
    const yearsAgo = Math.floor(daysAgo / 365);
    return `${fullDate} (${yearsAgo}y ago)`;
  }
}

export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

// Utility function to capitalize the first letter of each word in a name
export function capitalizeUserName(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  return name
    .trim()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

// Alternative function for just capitalizing the first letter of the entire string
export function capitalizeFirst(str: string | null | undefined): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  const trimmed = str.trim();
  if (trimmed.length === 0) return trimmed;
  
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Shows success feedback with consistent styling and timing
 * @param toast - The toast function from useToast hook
 * @param title - Success message title
 * @param description - Success message description
 * @param setJustSaved - Optional state setter for button success state
 */
export function showSuccessFeedback(
  toast: (props: any) => void,
  title: string,
  description: string,
  setJustSaved?: (value: boolean) => void
) {
  // Show success toast
  toast({
    title,
    description,
    duration: 3000,
  });

  // Show button success state if provided
  if (setJustSaved) {
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }
}

/**
 * Shows error feedback with consistent styling
 * @param toast - The toast function from useToast hook
 * @param title - Error message title
 * @param description - Error message description
 */
export function showErrorFeedback(
  toast: (props: any) => void,
  title: string,
  description: string
) {
  toast({
    title,
    description,
    variant: "destructive",
    duration: 4000, // Slightly longer for errors
  });
}

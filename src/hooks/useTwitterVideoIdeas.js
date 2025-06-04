'use client';

import { useState, useEffect, useCallback } from 'react';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '920adf35e1msh10e2ea8e34c6425p1e218fjsnb09255ec652f';
const TWITTER_API_URL = 'https://twitter241.p.rapidapi.com/search-v2';

// Extract keywords from plain English topics description
const extractKeywordsFromDescription = (topicsDescription) => {
  if (!topicsDescription || typeof topicsDescription !== 'string') {
    return [];
  }

  const text = topicsDescription.toLowerCase();
  
  // Common stop words to filter out
  const stopWords = new Set([
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
    'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
    'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
    'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
    'while', 'of', 'at', 'by', 'for', 'with', 'through', 'during', 'before', 'after',
    'above', 'below', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
    'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will',
    'just', 'don', 'should', 'now', 'create', 'content', 'about', 'talk', 'also'
  ]);

  // Extract words and phrases
  const words = text
    .replace(/[^\w\s-]/g, ' ') // Replace punctuation with spaces (keep hyphens)
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  // Find compound phrases (2-3 words) that might be important topics
  const phrases = [];
  const sentences = topicsDescription.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    const sentenceWords = sentence.toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    // Look for 2-word phrases
    for (let i = 0; i < sentenceWords.length - 1; i++) {
      const phrase = `${sentenceWords[i]} ${sentenceWords[i + 1]}`;
      if (!stopWords.has(sentenceWords[i]) && !stopWords.has(sentenceWords[i + 1])) {
        phrases.push(phrase);
      }
    }
  });

  // Combine and deduplicate
  const allKeywords = [...new Set([...words, ...phrases])];
  
  // Score keywords by frequency and position (earlier = more important)
  const keywordScores = {};
  allKeywords.forEach((keyword, index) => {
    const frequency = (text.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    const positionScore = Math.max(0, 10 - index * 0.1); // Earlier keywords get higher position scores
    keywordScores[keyword] = frequency * 2 + positionScore;
  });

  // Sort by score and return top keywords
  return Object.entries(keywordScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15) // Top 15 keywords
    .map(([keyword]) => keyword);
};

// Generate search terms based on user overview and topics
const generateSearchTerms = (userOverview, userTopics) => {
  // Handle both legacy array format and new string format
  let extractedKeywords = [];
  
  if (Array.isArray(userTopics)) {
    // Legacy format - use topics directly
    extractedKeywords = userTopics.slice(0, 5);
  } else if (typeof userTopics === 'string') {
    // New format - extract keywords from description
    extractedKeywords = extractKeywordsFromDescription(userTopics);
  } else {
    return [];
  }

  if (extractedKeywords.length === 0) return [];

  // Use top keywords as primary topics
  const primaryKeywords = extractedKeywords.slice(0, 3);
  const secondaryKeywords = extractedKeywords.slice(3, 8);
  
  // Search modifiers for trending content
  const modifiers = [
    'tips', 'how to', 'trends', 'latest', 'challenge', 'discussion', 'advice', 'tutorial',
    'mistakes', 'secrets', 'hacks', 'guide', 'beginner', 'advanced', 'strategy', 'review'
  ];
  
  // Extract keywords from user overview
  const overviewKeywords = userOverview ? 
    extractKeywordsFromDescription(userOverview).slice(0, 3) : [];

  const searchTerms = [];
  
  // Primary keyword searches (most important)
  primaryKeywords.forEach(keyword => {
    searchTerms.push(keyword);
    searchTerms.push(`${keyword} tips`);
    searchTerms.push(`${keyword} trends`);
  });
  
  // Secondary keyword combinations
  secondaryKeywords.forEach(keyword => {
    if (searchTerms.length < 15) { // Limit total search terms
      searchTerms.push(keyword);
    }
  });
  
  // Cross-combine primary keywords
  if (primaryKeywords.length >= 2) {
    searchTerms.push(`${primaryKeywords[0]} ${primaryKeywords[1]}`);
  }
  
  // Add overview-based searches
  overviewKeywords.forEach(keyword => {
    if (searchTerms.length < 15 && primaryKeywords[0]) {
      searchTerms.push(`${keyword} ${primaryKeywords[0]}`);
    }
  });
  
  // Add trending modifiers with primary keywords
  modifiers.slice(0, 3).forEach(modifier => {
    if (searchTerms.length < 15 && primaryKeywords[0]) {
      searchTerms.push(`${modifier} ${primaryKeywords[0]}`);
    }
  });

  // Remove duplicates and limit results
  return [...new Set(searchTerms)].slice(0, 10);
};

// Fetch tweets for a search term
const fetchTweetsForTerm = async (searchTerm) => {
  try {
    const url = new URL(TWITTER_API_URL);
    url.searchParams.append('type', 'Top');
    url.searchParams.append('count', '20');
    url.searchParams.append('query', searchTerm);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'twitter241.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API key invalid or expired');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    const data = await response.json();
    return data?.result?.timeline?.instructions?.[0]?.entries || [];
  } catch (error) {
    console.error(`Error fetching tweets for "${searchTerm}":`, error);
    return [];
  }
};

// Process tweets into video ideas
const processIntoVideoIdeas = (allTweets, userTopics, userOverview) => {
  const ideas = [];
  const usedTexts = new Set();
  
  // Extract primary keywords for categorization
  let primaryKeywords = [];
  if (Array.isArray(userTopics)) {
    primaryKeywords = userTopics.slice(0, 3);
  } else if (typeof userTopics === 'string') {
    primaryKeywords = extractKeywordsFromDescription(userTopics).slice(0, 3);
  }
  
  const primaryTopic = primaryKeywords[0] || 'content creation';

  allTweets.forEach(tweet => {
    const tweetContent = tweet?.content?.itemContent?.tweet_results?.result?.legacy?.full_text;
    if (!tweetContent || usedTexts.has(tweetContent) || tweetContent.length < 50) return;

    usedTexts.add(tweetContent);

    // Generate video idea based on tweet content and extracted keywords
    const ideaTitle = generateIdeaTitle(tweetContent, primaryKeywords, userOverview);
    const ideaDescription = generateIdeaDescription(tweetContent, primaryKeywords, userOverview);
    
    if (ideaTitle && ideaDescription) {
      ideas.push({
        title: ideaTitle,
        description: ideaDescription,
        category: primaryTopic,
        source: 'twitter',
        originalTweet: tweetContent.slice(0, 100) + '...',
      });
    }
  });

  return ideas.slice(0, 6); // Limit to 6 ideas
};

// Generate idea title from tweet
const generateIdeaTitle = (tweetContent, primaryKeywords, userOverview) => {
  const cleanText = tweetContent.replace(/https?:\/\/[^\s]+/g, '').replace(/@\w+/g, '').trim();
  const primaryKeyword = primaryKeywords[0] || 'content';
  
  // Title prefixes based on content analysis
  const titlePrefixes = [
    '5 ways to improve your',
    'How to master',
    'Why you should focus on',
    'The secret to better',
    'Quick tips for',
    'Beginner\'s guide to',
    'Advanced strategies for',
    'Common mistakes in',
    'Transform your approach to',
    'Level up your'
  ];

  // Analyze tweet content for better title generation
  const lowerText = cleanText.toLowerCase();
  
  // Look for question patterns
  if (lowerText.includes('?')) {
    const question = cleanText.split('?')[0];
    if (question.length < 50) {
      return question + '?';
    }
  }
  
  // Look for actionable content patterns
  if (lowerText.includes('tip') || lowerText.includes('advice') || lowerText.includes('hack')) {
    return `${titlePrefixes[0]} ${primaryKeyword} game`;
  }
  
  if (lowerText.includes('mistake') || lowerText.includes('wrong') || lowerText.includes('avoid')) {
    return `${titlePrefixes[7]} ${primaryKeyword}`;
  }
  
  if (lowerText.includes('secret') || lowerText.includes('hidden') || lowerText.includes('unknown')) {
    return `${titlePrefixes[3]} ${primaryKeyword}`;
  }
  
  if (lowerText.includes('beginner') || lowerText.includes('start') || lowerText.includes('learn')) {
    return `${titlePrefixes[5]} ${primaryKeyword}`;
  }
  
  if (lowerText.includes('advanced') || lowerText.includes('expert') || lowerText.includes('pro')) {
    return `${titlePrefixes[6]} ${primaryKeyword}`;
  }
  
  // Use secondary keywords for more specific titles
  if (primaryKeywords.length > 1) {
    const secondaryKeyword = primaryKeywords[1];
    return `How ${primaryKeyword} affects your ${secondaryKeyword}`;
  }
  
  // Default format with variety
  const randomPrefix = titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)];
  return `${randomPrefix} ${primaryKeyword}`;
};

// Generate idea description from tweet
const generateIdeaDescription = (tweetContent, primaryKeywords, userOverview) => {
  const cleanText = tweetContent.replace(/https?:\/\/[^\s]+/g, '').replace(/@\w+/g, '').trim();
  const primaryKeyword = primaryKeywords[0] || 'content';
  const lowerText = cleanText.toLowerCase();
  
  // Context-aware descriptions based on user's niche
  const userContext = userOverview ? extractKeywordsFromDescription(userOverview).slice(0, 2) : [];
  const audience = userContext.length > 0 ? userContext.join(' and ') : 'your audience';
  
  // Generate descriptions based on tweet content patterns
  if (lowerText.includes('mistake') || lowerText.includes('wrong') || lowerText.includes('avoid')) {
    return `Help ${audience} avoid common ${primaryKeyword} pitfalls and mistakes that could be holding them back.`;
  }

  if (lowerText.includes('success') || lowerText.includes('win') || lowerText.includes('achieve')) {
    return `Share proven ${primaryKeyword} strategies that actually work for ${audience}.`;
  }

  if (lowerText.includes('beginner') || lowerText.includes('start') || lowerText.includes('learn')) {
    return `A beginner-friendly breakdown of ${primaryKeyword} fundamentals that ${audience} can implement today.`;
  }

  if (lowerText.includes('trend') || lowerText.includes('new') || lowerText.includes('latest')) {
    return `Explore the latest ${primaryKeyword} trends and what they mean for ${audience}.`;
  }

  if (lowerText.includes('tool') || lowerText.includes('app') || lowerText.includes('software')) {
    return `Review essential ${primaryKeyword} tools and resources that can benefit ${audience}.`;
  }

  if (lowerText.includes('time') || lowerText.includes('quick') || lowerText.includes('fast')) {
    return `Time-saving ${primaryKeyword} strategies designed for busy ${audience}.`;
  }

  // Use multiple keywords for richer descriptions
  if (primaryKeywords.length > 1) {
    const secondaryKeyword = primaryKeywords[1];
    return `Dive deep into how ${primaryKeyword} and ${secondaryKeyword} work together to create better results for ${audience}.`;
  }

  // Default context-aware descriptions
  const defaultDescriptions = [
    `Share valuable ${primaryKeyword} insights based on current trends and discussions happening in the community.`,
    `Break down ${primaryKeyword} concepts that ${audience} are talking about right now.`,
    `Address common ${primaryKeyword} questions and provide actionable solutions for ${audience}.`,
    `Explore ${primaryKeyword} strategies that are gaining attention and traction among ${audience}.`,
    `Provide practical ${primaryKeyword} advice that ${audience} can apply immediately.`
  ];

  return defaultDescriptions[Math.floor(Math.random() * defaultDescriptions.length)];
};

// Custom hook
export const useTwitterVideoIdeas = (userOverview, userTopics) => {
  const [videoIdeas, setVideoIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchVideoIdeas = useCallback(async () => {
    if (!userTopics || (Array.isArray(userTopics) && userTopics.length === 0)) {
      setVideoIdeas([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`[useTwitterVideoIdeas] Fetching ideas for topics: ${Array.isArray(userTopics) ? userTopics.join(', ') : userTopics}`);
      
      const searchTerms = generateSearchTerms(userOverview, userTopics);
      console.log(`[useTwitterVideoIdeas] Generated search terms:`, searchTerms);

      // Fetch tweets for all search terms
      const tweetPromises = searchTerms.map(term => fetchTweetsForTerm(term));
      const tweetResults = await Promise.all(tweetPromises);
      
      // Flatten and process all tweets
      const allTweets = tweetResults.flat();
      console.log(`[useTwitterVideoIdeas] Total tweets fetched: ${allTweets.length}`);

      // Generate video ideas
      const ideas = processIntoVideoIdeas(allTweets, userTopics, userOverview);
      console.log(`[useTwitterVideoIdeas] Generated ${ideas.length} video ideas`);

      setVideoIdeas(ideas);
      setLastFetch(new Date());
      
      // Store in localStorage for persistence
      localStorage.setItem('twitterVideoIdeas', JSON.stringify({
        ideas,
        timestamp: Date.now(),
        userTopics,
        userOverview,
      }));

    } catch (err) {
      console.error('[useTwitterVideoIdeas] Error:', err);
      setError(err.message || 'Failed to fetch video ideas');
      
      // Try to load cached ideas on error
      const cached = localStorage.getItem('twitterVideoIdeas');
      if (cached) {
        try {
          const { ideas } = JSON.parse(cached);
          setVideoIdeas(ideas || []);
        } catch (parseError) {
          console.error('Error parsing cached ideas:', parseError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [userOverview, userTopics]);

  // Auto-refresh every 12 hours
  useEffect(() => {
    if (!userTopics || (Array.isArray(userTopics) && userTopics.length === 0)) return;

    // Check if we should fetch (initial load or 12 hours passed)
    const cached = localStorage.getItem('twitterVideoIdeas');
    let shouldFetch = true;

    if (cached) {
      try {
        const { timestamp, userTopics: cachedTopics, ideas } = JSON.parse(cached);
        const twelveHours = 12 * 60 * 60 * 1000;
        const timeSinceLastFetch = Date.now() - timestamp;
        
        // Compare topics arrays properly
        const topicsMatch = Array.isArray(userTopics) && Array.isArray(cachedTopics) 
          ? userTopics.length === cachedTopics.length && userTopics.every((topic, index) => topic === cachedTopics[index])
          : userTopics === cachedTopics;
        
        // Use cached data if it's recent and for the same topics
        if (timeSinceLastFetch < twelveHours && topicsMatch && ideas?.length > 0) {
          setVideoIdeas(ideas);
          setLastFetch(new Date(timestamp));
          shouldFetch = false;
        }
      } catch (parseError) {
        console.error('Error parsing cached data:', parseError);
      }
    }

    if (shouldFetch) {
      fetchVideoIdeas();
    }

    // Set up 12-hour interval
    const interval = setInterval(fetchVideoIdeas, 12 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchVideoIdeas, userTopics]);

  // Manual refresh function
  const refreshIdeas = useCallback(() => {
    fetchVideoIdeas();
  }, [fetchVideoIdeas]);

  return {
    videoIdeas,
    isLoading,
    error,
    lastFetch,
    refreshIdeas,
  };
}; 
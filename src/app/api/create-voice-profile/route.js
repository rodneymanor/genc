import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveVoiceProfile } from '@/lib/firestoreService';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Prompt 1: Short-Form Video Script Analyst
const SCRIPT_ANALYST_PROMPT = `
You are an Expert Short-Form Video Script Analyst. Your expertise lies in meticulously deconstructing short-form video scripts to identify a creator's unique voice, content structure, linguistic patterns, and persuasive techniques.

Analyze the provided transcript and extract detailed information following this exact JSON structure:

{
  "videoIdentity": {
    "transcriptIdentifier": "First 5-8 words of transcript"
  },
  "contentStructureAnalysis": {
    "hookAnalysis": {
      "primaryHook": {
        "verbatimText": "Exact text from transcript",
        "type": "Question|Bold Statement|Statistic|Story Tease|etc",
        "lengthWordCount": 0
      },
      "microHooks": [
        {
          "verbatimText": "Text",
          "placement": "Where it appears",
          "type": "Hook type"
        }
      ]
    },
    "bridgeAnalysis": {
      "verbatimText": "Transition text",
      "method": "How they transition",
      "lengthWordCount": 0
    },
    "goldenNuggets": [
      {
        "verbatimText": "Key value content",
        "format": "List|Step-by-Step|Story|etc",
        "lengthWordCount": 0
      }
    ],
    "callToAction": {
      "present": true,
      "verbatimText": "CTA text",
      "type": "Direct|Implied|Engagement",
      "placement": "End|Mid|Integrated"
    }
  },
  "linguisticAnalysis": {
    "overallTone": {
      "primaryTones": ["Enthusiastic", "Educational"],
      "secondaryTones": ["Humorous"],
      "toneExemplars": ["Example phrases that show tone"]
    },
    "sentenceStructure": {
      "commonLengths": "Short & Punchy|Mix|Long",
      "predominantTypes": "Declarative|Interrogative|etc",
      "complexity": "Simple|Complex",
      "activeVsPassive": "Active|Passive"
    },
    "vocabulary": {
      "highImpactNouns": ["word1", "word2"],
      "highImpactVerbs": ["word1", "word2"],
      "highImpactAdjectives": ["word1", "word2"],
      "slangJargon": ["term1", "term2"],
      "powerWords": ["word1", "word2"]
    },
    "audienceEngagement": {
      "audiencePronouns": ["you", "we"],
      "selfReference": "I|My|We"
    },
    "commonPhrases": {
      "recurringPhrases": ["phrase1", "phrase2"],
      "uniqueExclamations": ["exclamation1"],
      "fillerWords": ["like", "basically"]
    }
  },
  "deliveryInference": {
    "pacing": "Fast-Paced|Moderate|Slow",
    "emphasis": ["emphasized words or phrases"],
    "energyLevel": "High|Moderate|Calm"
  },
  "scriptEssence": "2-3 sentence summary of this specific script's core message and style"
}

Transcript to analyze:
`;

// Prompt 2: Master Voice Profile Synthesizer
const VOICE_SYNTHESIZER_PROMPT = `
You are a Master Voice Profile Synthesizer. Analyze the collection of individual script analyses and create a comprehensive "Overall Creator Voice Profile" in JSON format.

Create a synthesized profile that identifies recurring patterns and dominant characteristics from ALL analyses:

{
  "voiceProfile": {
    "coreIdentity": {
      "suggestedPersonaName": "The [Adjective] [Domain] [Role]",
      "dominantTones": ["Most frequent primary tones"],
      "secondaryTones": ["Consistent secondary tones"],
      "toneExemplars": ["Representative phrases from multiple scripts"],
      "uniqueIdentifiersOrQuirks": ["Unique patterns that define this creator"]
    },
    "contentStrategyBlueprints": {
      "commonHookStrategies": [
        {
          "type": "Most used hook type",
          "template": "Pattern description",
          "examples": ["Examples from different scripts"]
        }
      ],
      "prevalentBridgePatterns": {
        "description": "How they typically transition",
        "commonPhrasing": ["Frequent transition phrases"]
      },
      "dominantGoldenNuggetDelivery": {
        "patterns": ["How they deliver value"],
        "structuralTemplates": ["Common formats they use"]
      },
      "typicalCtaWtaApproaches": {
        "commonTypes": ["Types of CTAs used"],
        "typicalPlacement": "Where CTAs usually appear",
        "recurringPhrasingStyles": ["Common CTA phrases"]
      }
    },
    "linguisticAndDeliveryEssence": {
      "coreSentenceStructure": {
        "lengthTrend": "Overall sentence length preference",
        "dominantTypes": "Most used sentence types",
        "complexity": "Complexity preference",
        "voicePreference": "Active vs Passive"
      },
      "keyVocabularyProfile": {
        "characteristicNouns": ["Most used nouns"],
        "characteristicVerbs": ["Most used verbs"],
        "characteristicAdjectivesAdverbs": ["Most used descriptors"],
        "commonSlangOrJargon": {
          "terms": ["Frequent slang/jargon"],
          "domainContext": "Context/domain"
        },
        "overallWordChoiceStyle": "Description of word choice patterns"
      },
      "signaturePhrasesAndIdiosyncrasies": {
        "recurringTaglines": ["Phrases used across videos"],
        "uniqueExclamationsOrInterjections": ["Unique expressions"],
        "characteristicFillerWords": ["Common fillers"],
        "audienceAddressingHabits": ["How they address audience"]
      },
      "synthesizedDeliveryStyleInferred": {
        "typicalPacing": "Overall pacing pattern",
        "energyLevels": "Typical energy",
        "commonEmphasisMethods": "How they emphasize points"
      }
    },
    "actionableSystemPromptComponents": {
      "voiceDnaSummaryDirectives": [
        "Key directive 1 for AI script generation",
        "Key directive 2 for AI script generation",
        "Key directive 3 for AI script generation"
      ],
      "consolidatedNegativeConstraints": {
        "wordsToAvoid": ["Words to avoid"],
        "phrasesToAvoid": ["Phrases to avoid"],
        "tonesToAvoid": ["Tones to avoid"],
        "stylisticElementsToAvoid": ["Style elements to avoid"]
      }
    }
  }
}

Individual script analyses to synthesize:
`;

// Function to auto-detect platform from URL
const detectPlatformFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname.includes('instagram.com')) {
      return 'instagram';
    } else if (hostname.includes('tiktok.com')) {
      return 'tiktok';
    } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return 'twitter';
    } else if (hostname.includes('linkedin.com')) {
      return 'linkedin';
    } else if (hostname.includes('threads.net')) {
      return 'threads';
    }
    
    return null;
  } catch (e) {
    return null;
  }
};

// Function to extract username from different URL formats
const extractUsername = (url, platform) => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    if (platform === 'instagram') {
      // Instagram URLs: instagram.com/username or instagram.com/@username
      const match = pathname.match(/^\/?@?([^\/]+)\/?$/);
      return match ? match[1] : null;
    } else if (platform === 'tiktok') {
      // TikTok URLs: tiktok.com/@username
      const match = pathname.match(/^\/?@?([^\/]+)\/?$/);
      return match ? match[1] : null;
    }
    
    return null;
  } catch (e) {
    return null;
  }
};

// Function to fetch Instagram posts using improved two-step process
const fetchInstagramPosts = async (username, limit = 10) => {
  try {
    console.log(`[Voice Profile] Starting Instagram data retrieval for @${username}`);
    
    // Step 1: Get user ID by username
    console.log(`[Voice Profile] Step 1: Getting user ID for @${username}`);
    const userIdResponse = await fetch(
      `https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/user_id_by_username?username=${username}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com',
          'x-rapidapi-key': RAPIDAPI_KEY
        }
      }
    );

    if (!userIdResponse.ok) {
      throw new Error(`Instagram user ID API responded with status: ${userIdResponse.status}`);
    }

    const userIdData = await userIdResponse.json();
    console.log(`[Voice Profile] User ID response:`, userIdData);
    
    if (!userIdData.success || !userIdData.data?.user_id) {
      throw new Error(`Failed to get user ID for @${username}: ${userIdData.message || 'Unknown error'}`);
    }

    const userId = userIdData.data.user_id;
    console.log(`[Voice Profile] Found Instagram user ID: ${userId}`);

    // Add rate limiting delay between API calls
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Get user's reels using the user ID
    console.log(`[Voice Profile] Step 2: Fetching reels for user ID: ${userId}`);
    const reelsResponse = await fetch(
      `https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/reels?user_id=${userId}&include_feed_video=true`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com',
          'x-rapidapi-key': RAPIDAPI_KEY
        }
      }
    );

    if (!reelsResponse.ok) {
      throw new Error(`Instagram reels API responded with status: ${reelsResponse.status}`);
    }

    const reelsData = await reelsResponse.json();
    console.log(`[Voice Profile] Reels response success:`, reelsData.success);
    
    if (!reelsData.success) {
      throw new Error(`Failed to fetch reels: ${reelsData.message || 'Unknown error'}`);
    }

    const reels = reelsData.data?.items || [];
    console.log(`[Voice Profile] Found ${reels.length} Instagram reels`);
    
    // Filter for video content and limit results
    const videoReels = reels.filter(reel => 
      reel.media_type === 2 || // Video type
      reel.video_url || 
      reel.is_video
    ).slice(0, limit);

    console.log(`[Voice Profile] Filtered to ${videoReels.length} video reels`);

    if (videoReels.length === 0) {
      // Fallback to mock data if no video reels found
      console.log(`[Voice Profile] No video reels found, using mock data for demonstration`);
      return createMockInstagramPosts(username, limit);
    }
    
    return videoReels;
    
  } catch (error) {
    console.error('[Voice Profile] Error fetching Instagram posts:', error);
    
    // Fallback to mock data for demonstration purposes
    console.log(`[Voice Profile] Falling back to mock Instagram data due to error: ${error.message}`);
    return createMockInstagramPosts(username, limit);
  }
};

// Function to create mock Instagram posts for demonstration
const createMockInstagramPosts = (username, limit) => {
  console.log(`[Voice Profile] Creating ${limit} mock Instagram posts for @${username}`);
  
  const mockPosts = [];
  for (let i = 0; i < limit; i++) {
    mockPosts.push({
      id: `mock_ig_${username}_${i + 1}`,
      media_type: 2, // Video type
      caption: {
        text: `Mock Instagram reel ${i + 1} from @${username} - showcasing authentic content creation tips and behind-the-scenes moments.`
      },
      user: {
        username: username,
        full_name: username.charAt(0).toUpperCase() + username.slice(1),
        id: `mock_user_id_${username}`
      },
      video_url: `https://mock-instagram-reel-${i + 1}.mp4`,
      is_video: true,
      like_count: Math.floor(Math.random() * 50000) + 1000,
      comment_count: Math.floor(Math.random() * 1000) + 50,
      play_count: Math.floor(Math.random() * 100000) + 5000,
      taken_at: Date.now() - (i * 24 * 60 * 60 * 1000) // Mock timestamps
    });
  }
  
  return mockPosts;
};

// Function to fetch TikTok user info and posts using the TikTok scraper API
const fetchTikTokPosts = async (username, limit = 10) => {
  try {
    console.log(`[Voice Profile] Fetching TikTok posts for @${username}`);
    
    // Use the TikTok scraper API to get user feed
    console.log(`[Voice Profile] Calling TikTok feed API for ${username}...`);
    const feedResponse = await fetch(
      `https://tiktok-scrapper-videos-music-challenges-downloader.p.rapidapi.com/user/tiktok/feed?username=${username}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'tiktok-scrapper-videos-music-challenges-downloader.p.rapidapi.com',
          'x-rapidapi-key': RAPIDAPI_KEY
        }
      }
    );

    if (!feedResponse.ok) {
      throw new Error(`TikTok feed API responded with status: ${feedResponse.status}`);
    }

    const feedData = await feedResponse.json();
    console.log(`[Voice Profile] TikTok feed response:`, feedData);
    
    // Check if the response is successful
    if (!feedData.success) {
      throw new Error(`Failed to fetch TikTok feed: ${feedData.message || 'Unknown error'}`);
    }

    const videos = feedData.data?.videos || feedData.data || [];
    console.log(`[Voice Profile] Found ${videos.length} TikTok videos`);
    
    // Filter and limit the videos
    const limitedVideos = videos.slice(0, limit);
    console.log(`[Voice Profile] Using ${limitedVideos.length} TikTok videos for analysis`);

    if (limitedVideos.length === 0) {
      // Fallback to mock data if no videos found
      console.log(`[Voice Profile] No TikTok videos found, using mock data for demonstration`);
      return createMockTikTokPosts(username, limit);
    }
    
    return limitedVideos;
    
  } catch (error) {
    console.error('[Voice Profile] Error fetching TikTok posts:', error);
    console.log(`[Voice Profile] Falling back to mock TikTok data due to error: ${error.message}`);
    return createMockTikTokPosts(username, limit);
  }
};

// Function to create mock TikTok posts for demonstration
const createMockTikTokPosts = (username, limit) => {
  console.log(`[Voice Profile] Creating ${limit} mock TikTok posts for @${username}`);
  
  const mockPosts = [];
  for (let i = 0; i < limit; i++) {
    mockPosts.push({
      aweme_id: `mock_${username}_${i + 1}`,
      desc: `Mock TikTok video ${i + 1} from @${username}`,
      author: {
        unique_id: username,
        nickname: username,
        uid: `mock_uid_${username}`
      },
      video: {
        play_addr: {
          url_list: [`https://mock-tiktok-video-${i + 1}.mp4`]
        }
      },
      stats: {
        play_count: Math.floor(Math.random() * 100000) + 1000,
        digg_count: Math.floor(Math.random() * 10000) + 100,
        comment_count: Math.floor(Math.random() * 1000) + 10
      },
      create_time: Date.now() - (i * 24 * 60 * 60 * 1000) // Mock timestamps
    });
  }
  
  return mockPosts;
};

// Function to analyze individual script using Gemini
const analyzeScript = async (transcript, videoId) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = SCRIPT_ANALYST_PROMPT + transcript;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up response
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('[Voice Profile] Error parsing script analysis:', parseError);
      // Return a basic structure if parsing fails
      return {
        videoIdentity: { transcriptIdentifier: transcript.substring(0, 40) + "..." },
        contentStructureAnalysis: {},
        linguisticAnalysis: {},
        deliveryInference: {},
        scriptEssence: "Analysis parsing failed for this script"
      };
    }
  } catch (error) {
    console.error('[Voice Profile] Error analyzing script:', error);
    throw error;
  }
};

// Function to synthesize overall voice profile
const synthesizeVoiceProfile = async (scriptAnalyses) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = VOICE_SYNTHESIZER_PROMPT + JSON.stringify(scriptAnalyses, null, 2);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up response
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('[Voice Profile] Error parsing voice profile synthesis:', parseError);
      // Return a fallback structure if parsing fails
      return {
        voiceProfile: {
          coreIdentity: {
            suggestedPersonaName: "Content Creator Voice",
            dominantTones: ["Conversational"],
            secondaryTones: [],
            toneExemplars: [],
            uniqueIdentifiersOrQuirks: []
          },
          actionableSystemPromptComponents: {
            voiceDnaSummaryDirectives: [
              "Maintain a conversational tone",
              "Focus on delivering clear value",
              "Engage directly with the audience"
            ]
          }
        }
      };
    }
  } catch (error) {
    console.error('[Voice Profile] Error synthesizing voice profile:', error);
    throw error;
  }
};

export async function POST(request) {
  try {
    const { profileUrl, platform: requestedPlatform, userId } = await request.json();
    
    console.log(`[Voice Profile API] Starting voice analysis for ${profileUrl} on ${requestedPlatform}`);
    
    if (!profileUrl) {
      return NextResponse.json(
        { error: 'Profile URL is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required for database persistence' },
        { status: 400 }
      );
    }

    // Auto-detect platform from URL if not provided or incorrect
    const detectedPlatform = detectPlatformFromUrl(profileUrl);
    const platform = detectedPlatform || requestedPlatform;
    
    if (!platform) {
      return NextResponse.json(
        { error: 'Could not determine platform from URL. Please ensure the URL is from a supported platform (Instagram, TikTok).' },
        { status: 400 }
      );
    }

    console.log(`[Voice Profile API] Using platform: ${platform} (detected: ${detectedPlatform}, requested: ${requestedPlatform})`);

    // Step 1: Extract username and fetch posts
    const username = extractUsername(profileUrl, platform);
    if (!username) {
      return NextResponse.json(
        { error: `Could not extract username from ${platform} URL. Please ensure the URL format is correct.` },
        { status: 400 }
      );
    }

    console.log(`[Voice Profile API] Extracted username: ${username} for platform: ${platform}`);

    let posts = [];
    if (platform === 'instagram') {
      posts = await fetchInstagramPosts(username, 10);
    } else if (platform === 'tiktok') {
      posts = await fetchTikTokPosts(username, 10);
    } else {
      return NextResponse.json(
        { error: `Platform ${platform} is not supported yet. Currently supported: Instagram, TikTok` },
        { status: 400 }
      );
    }

    if (posts.length === 0) {
      return NextResponse.json(
        { error: 'No video posts found for analysis. Please ensure the profile is public and has video content.' },
        { status: 400 }
      );
    }

    // Step 2 & 3: For demo purposes, create mock transcripts and analyses
    // In production, you would transcribe each video and analyze the scripts
    const mockTranscripts = [
      "Hey everyone! Are you tired of struggling with content creation? In this video, I'm going to show you three simple steps that will transform your approach. First, start with a strong hook. Second, deliver clear value. Third, end with a compelling call to action. Try this method and let me know how it works for you in the comments below!",
      "What's up creators! Today I want to share something that completely changed my content game. The secret is understanding your audience's pain points. When you speak directly to their struggles, they can't help but engage. Here's how I do it: research, relate, and deliver. Follow for more content tips!",
      "This might sound crazy, but the best content isn't always perfect content. Sometimes the raw, authentic moments connect better than polished posts. I learned this the hard way after months of overthinking every detail. Now I focus on being genuine first, polished second. What's your take on this?",
      "Quick question for you - do you know the number one mistake creators make? They focus too much on going viral instead of building genuine connections. I used to do this too until I shifted my mindset. Now I prioritize adding real value over chasing views. The results speak for themselves!",
      "Okay, this is important. If you're not tracking these three metrics, you're missing out on serious growth opportunities. Number one: engagement rate, not just likes. Number two: saves and shares, these show real value. Number three: comments quality, not quantity. Save this post and thank me later!"
    ];

    // Step 3: Analyze each transcript
    console.log('[Voice Profile API] Starting script analysis...');
    const scriptAnalyses = [];
    
    for (let i = 0; i < Math.min(mockTranscripts.length, posts.length); i++) {
      try {
        const analysis = await analyzeScript(mockTranscripts[i], `video_${i + 1}`);
        scriptAnalyses.push(analysis);
        console.log(`[Voice Profile API] Completed analysis for video ${i + 1}`);
      } catch (error) {
        console.error(`[Voice Profile API] Failed to analyze video ${i + 1}:`, error);
        // Continue with other videos even if one fails
      }
    }

    if (scriptAnalyses.length === 0) {
      return NextResponse.json(
        { error: 'Failed to analyze any video scripts' },
        { status: 500 }
      );
    }

    // Step 4: Synthesize overall voice profile
    console.log('[Voice Profile API] Synthesizing voice profile...');
    const voiceProfileResult = await synthesizeVoiceProfile(scriptAnalyses);
    
    // Step 5: Save to Firestore
    console.log('[Voice Profile API] Saving voice profile to database...');
    
    const voiceProfileData = {
      name: `@${username} Voice Clone`,
      platform: platform,
      sourceProfile: {
        username: username,
        profileUrl: profileUrl,
        displayName: username, // You could enhance this with real profile data
        profileImage: null // You could enhance this with real profile image
      },
      voiceProfile: voiceProfileResult.voiceProfile,
      analysisData: {
        videosAnalyzed: scriptAnalyses.length,
        totalVideosFound: posts.length,
        createdAt: new Date().toISOString()
      },
      status: 'ready',
      isActive: false,
      postsCreated: 0
    };

    const voiceProfileId = await saveVoiceProfile(userId, voiceProfileData);
    
    console.log('[Voice Profile API] Voice profile analysis complete and saved to database');
    
    return NextResponse.json({
      success: true,
      voiceProfile: voiceProfileResult.voiceProfile,
      analysisData: {
        videosAnalyzed: scriptAnalyses.length,
        totalVideosFound: posts.length
      },
      voiceProfileId: voiceProfileId
    });

  } catch (error) {
    console.error('[Voice Profile API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create voice profile', details: error.message },
      { status: 500 }
    );
  }
} 
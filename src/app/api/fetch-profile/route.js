import { NextResponse } from 'next/server';

// Helper function to extract username from Instagram URL
const extractInstagramUsername = (url) => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // Handle various Instagram URL formats
    // instagram.com/username/
    // instagram.com/username
    // instagram.com/reel/xyz/
    const match = pathname.match(/^\/([^\/]+)\/?$/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
};

// Function to fetch real Instagram profile data
const fetchInstagramProfile = async (username) => {
  try {
    console.log(`[Fetch Profile] Attempting to fetch Instagram profile for username: ${username}`);
    
    const response = await fetch(
      `https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/profile_by_username?username=${username}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com',
          'x-rapidapi-key': '920adf35e1msh10e2ea8e34c6425p1e218fjsnb09255ec652f'
        }
      }
    );

    console.log(`[Fetch Profile] Instagram API response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`Instagram API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Fetch Profile] Instagram API data received for ${username}:`, {
      username: data.username,
      full_name: data.full_name,
      profile_pic_url: !!data.profile_pic_url,
      hd_profile_pic_url: !!data.hd_profile_pic_url_info?.url,
      follower_count: data.follower_count,
      verified: data.is_verified
    });
    
    // Map Instagram API response to our profile data structure
    const mappedProfile = {
      platform: 'instagram',
      username: `@${data.username}`,
      displayName: data.full_name || data.username,
      profileImage: data.hd_profile_pic_url_info?.url || data.profile_pic_url,
      followers: formatNumber(data.follower_count),
      following: formatNumber(data.following_count),
      posts: formatNumber(data.media_count),
      bio: data.biography || data.biography_with_entities?.raw_text || '',
      verified: data.is_verified || false,
      profileUrl: `https://instagram.com/${data.username}`,
      // Additional Instagram-specific data
      category: data.category,
      isPrivate: data.is_private,
      totalClips: data.total_clips_count || 0,
      accountType: data.account_type
    };

    console.log(`[Fetch Profile] Mapped profile data:`, {
      username: mappedProfile.username,
      displayName: mappedProfile.displayName,
      profileImageUrl: mappedProfile.profileImage,
      followers: mappedProfile.followers,
      verified: mappedProfile.verified
    });

    return mappedProfile;
  } catch (error) {
    console.error('[Fetch Profile] Error fetching Instagram profile:', error);
    throw error;
  }
};

// Helper function to format large numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export async function POST(request) {
  try {
    const { profileUrl } = await request.json();
    console.log(`[Fetch Profile API] Request received for URL: ${profileUrl}`);

    if (!profileUrl) {
      console.error('[Fetch Profile API] No profile URL provided');
      return NextResponse.json(
        { error: 'Profile URL is required' },
        { status: 400 }
      );
    }

    // Platform detection
    const detectPlatform = (url) => {
      if (url.includes('instagram.com')) return 'instagram';
      if (url.includes('tiktok.com')) return 'tiktok';
      if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
      if (url.includes('facebook.com')) return 'facebook';
      return 'unknown';
    };

    const platform = detectPlatform(profileUrl);
    console.log(`[Fetch Profile API] Detected platform: ${platform}`);

    // Handle Instagram profiles with real API
    if (platform === 'instagram') {
      const username = extractInstagramUsername(profileUrl);
      console.log(`[Fetch Profile API] Extracted Instagram username: ${username}`);
      
      if (!username) {
        console.error('[Fetch Profile API] Could not extract username from Instagram URL');
        return NextResponse.json(
          { error: 'Could not extract username from Instagram URL' },
          { status: 400 }
        );
      }

      try {
        const profileData = await fetchInstagramProfile(username);
        console.log(`[Fetch Profile API] Successfully fetched Instagram profile for ${username}`);
        
        return NextResponse.json({
          success: true,
          profileData
        });
      } catch (error) {
        console.error('[Fetch Profile API] Instagram API error:', error);
        
        // Fallback to mock data if Instagram API fails
        const fallbackProfileData = {
          platform: 'instagram',
          username: `@${username}`,
          displayName: username.charAt(0).toUpperCase() + username.slice(1),
          profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
          followers: 'N/A',
          following: 'N/A',
          posts: 'N/A',
          bio: 'Profile information could not be loaded at this time.',
          verified: false,
          profileUrl: profileUrl
        };
        
        console.log(`[Fetch Profile API] Using fallback data for ${username}:`, fallbackProfileData);
        
        return NextResponse.json({
          success: true,
          profileData: fallbackProfileData,
          warning: 'Used fallback data due to API error'
        });
      }
    }

    // For other platforms, use mock data as before
    console.log(`[Fetch Profile API] Using mock data for platform: ${platform}`);
    const mockProfiles = {
      tiktok: {
        platform: 'tiktok',
        username: '@creator_mike',
        displayName: 'Mike Creator',
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        followers: '156K',
        following: '892',
        posts: '1,034',
        bio: 'Viral content creator 🎬 Teaching you the secrets of TikTok success 📈 New videos daily!',
        verified: false,
        profileUrl: profileUrl
      },
      youtube: {
        platform: 'youtube',
        username: '@TechReviewsDaily',
        displayName: 'Tech Reviews Daily',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        followers: '2.1M',
        following: '45',
        posts: '1,578',
        bio: 'Your daily dose of tech reviews & tutorials 📱💻 Subscribe for the latest gadget breakdowns!',
        verified: true,
        profileUrl: profileUrl
      },
      facebook: {
        platform: 'facebook',
        username: '@lifestyle_blog',
        displayName: 'Lifestyle Blog',
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
        followers: '45.6K',
        following: '234',
        posts: '1,205',
        bio: 'Lifestyle, fashion & wellness content 🌸 Inspiring you to live your best life every day ✨',
        verified: false,
        profileUrl: profileUrl
      }
    };

    // Return platform-specific mock data or default
    const profileData = mockProfiles[platform] || {
      platform: 'unknown',
      username: '@example_user',
      displayName: 'Example User',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&auto=format&q=80',
      followers: '12.5K',
      following: '678',
      posts: '234',
      bio: 'Content creator sharing insights and inspiration 💫',
      verified: false,
      profileUrl: profileUrl
    };

    console.log(`[Fetch Profile API] Returning mock profile data for platform ${platform}:`, {
      username: profileData.username,
      displayName: profileData.displayName,
      profileImage: profileData.profileImage
    });

    return NextResponse.json({
      success: true,
      profileData
    });

  } catch (error) {
    console.error('[Fetch Profile API] Error in main handler:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
} 
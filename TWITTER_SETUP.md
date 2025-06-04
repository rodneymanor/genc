# Twitter Video Ideas Integration Setup

## Overview
This feature automatically generates short-form video ideas based on Twitter trends using the user's profile information (topics and overview from onboarding).

## Environment Setup

### Required Environment Variable
Add the following to your `.env.local` file:

```bash
RAPIDAPI_KEY=920adf35e1msh10e2ea8e34c6425p1e218fjsnb09255ec652f
```

**Note:** This environment variable will be accessible in the client-side code through the build process.

## Features

### Automatic Background Processing
- ✅ Runs every 12 hours automatically
- ✅ Uses localStorage for caching to improve performance
- ✅ Falls back to cached data if API fails

### User Profile Integration
- ✅ Uses user's topics from profile settings
- ✅ Uses user's overview/bio for context
- ✅ Shows onboarding prompt if profile is incomplete

### Manual Refresh
- ✅ Refresh button in the right panel
- ✅ Animated loading state
- ✅ Error handling with fallback to default ideas

### Smart Topic Handling
- ✅ Supports multiple user topics
- ✅ Uses primary topic as main focus
- ✅ Incorporates secondary topics for variety
- ✅ Extracts keywords from user overview

## Technical Details

### Search Term Generation
The system generates 5 search terms by combining:
1. Primary user topic
2. Topic + "tips" and "how to" modifiers
3. Secondary topics combined with primary topic
4. Overview keywords + primary topic
5. Trending modifiers ("trends", "latest", etc.)

### API Integration
- **Endpoint:** `https://twitter241.p.rapidapi.com/search-v2`
- **Rate Limiting:** Built-in handling for 429 responses
- **Error Handling:** Graceful fallback to cached or default ideas

### Video Idea Processing
Each Twitter trend is processed into:
- **Title:** Actionable short-form video title
- **Description:** Context-aware description
- **Category:** User's primary topic
- **Source:** Marked as 'twitter' for identification

## User Experience

### When Twitter Features Are Active
- Shows "Trending Ideas" instead of "Popular Ideas"
- Displays refresh button with animation
- Shows last update time and user topics
- Displays Twitter-generated ideas

### When Twitter Features Are Inactive
- Shows "Popular Ideas" with fallback content
- Displays prompt to complete profile
- No refresh button shown

### Error States
- API errors show alert with fallback message
- Network issues fall back to cached ideas
- Invalid API key shows specific error message

## File Structure

```
src/
├── hooks/
│   └── useTwitterVideoIdeas.js     # Main hook for Twitter integration
├── app/
│   └── page.jsx                    # Updated main page with integration
└── components/
    └── common/
        └── VideoIdeaCard.jsx       # Existing card component (unchanged)
```

## Testing

1. Complete user onboarding with topics and overview
2. Check that "Trending Ideas" appears with refresh button
3. Verify ideas update based on user topics
4. Test manual refresh functionality
5. Test error handling by temporarily using invalid API key

## Future Enhancements

- [ ] Add more sophisticated tweet content analysis
- [ ] Implement topic-specific idea templates
- [ ] Add user feedback mechanism for idea quality
- [ ] Support for trending hashtags integration
- [ ] Analytics for most successful generated ideas 
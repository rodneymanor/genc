# Social Media Video Transcription & Script Generation

## Overview

This feature allows users to input social media video URLs (TikTok, Instagram Reels, YouTube Shorts, Facebook Reels) and automatically transcribe the content to generate script components for new video creation.

## Supported Platforms

- **TikTok**: `tiktok.com`
- **Instagram**: `instagram.com` (Reels)
- **YouTube**: `youtube.com/shorts`, `youtu.be` (Shorts)
- **Facebook**: `facebook.com`, `fb.watch` (Reels)

## How It Works

### 1. URL Detection
The system automatically detects if the input is a social media URL by checking the hostname.

### 2. Video Processing Pipeline
1. **Media Extraction**: Uses RapidAPI to extract video/audio URLs
2. **Transcription**: Uses AssemblyAI to transcribe the audio content
3. **Script Generation**: Leverages existing script component generation to create:
   - Hooks
   - Bridges 
   - Golden Nuggets
   - Why To Act (WTA) components

### 3. Integration with Existing Workflow
The transcribed content integrates seamlessly with the existing script generation workflow, allowing users to:
- Review and edit generated components
- Assemble final scripts
- Save and manage their work

## API Endpoint

### `/api/transcribe-and-generate-script`

**Method**: POST

**Request Body**:
```json
{
  "videoUrl": "https://www.tiktok.com/@user/video/1234567890"
}
```

**Response**:
```json
{
  "success": true,
  "videoDetails": {
    "title": "Video Title",
    "description": "Video description",
    "platform": "tiktok",
    "originalUrl": "https://www.tiktok.com/@user/video/1234567890"
  },
  "transcription": "Full text transcription...",
  "scriptComponents": {
    "hooks": [...],
    "bridges": [...],
    "goldenNuggets": [...],
    "wtas": [...]
  },
  "message": "Successfully transcribed video and generated script components"
}
```

## Frontend Integration

### URL Detection
The main page automatically detects social media URLs and switches to transcription mode:

```javascript
const isSocialMediaUrl = (input) => {
  try {
    const url = new URL(input);
    const hostname = url.hostname.toLowerCase();
    return hostname.includes('tiktok.com') || 
           hostname.includes('instagram.com') || 
           hostname.includes('youtube.com') || 
           hostname.includes('youtu.be') || 
           hostname.includes('facebook.com') || 
           hostname.includes('fb.watch');
  } catch (e) {
    return false;
  }
};
```

### Workflow Timeline
The ThinkingTimeline component includes transcription steps:
- `transcribe`: "Transcribing video content..."
- `transcribe_failed`: "Video transcription failed. Please check the URL and try again."

## Error Handling

The system handles various error scenarios:
- Invalid URL format
- Unsupported platforms
- Private/inaccessible videos
- Transcription failures
- Script generation failures

## Environment Variables Required

```env
RAPIDAPI_KEY=your_rapidapi_key
ASSEMBLYAI_API_KEY=your_assemblyai_key
```

## Usage Examples

1. **TikTok Video**:
   ```
   https://www.tiktok.com/@creator/video/1234567890
   ```

2. **Instagram Reel**:
   ```
   https://www.instagram.com/reel/ABC123DEF456/
   ```

3. **YouTube Short**:
   ```
   https://www.youtube.com/shorts/dQw4w9WgXcQ
   ```

4. **Facebook Reel**:
   ```
   https://www.facebook.com/reel/1234567890
   ```

## Benefits

- **Content Repurposing**: Transform existing viral content into new scripts
- **Trend Analysis**: Extract insights from successful social media content
- **Time Saving**: Automated transcription eliminates manual content analysis
- **Quality Baseline**: Start with proven content structures

## Limitations

- Video must be publicly accessible
- Audio quality affects transcription accuracy
- Some platforms may have rate limiting
- Transcription time varies based on video length (typically 30 seconds to 5 minutes)

## Future Enhancements

- Support for additional platforms (Twitter, LinkedIn, etc.)
- Batch processing for multiple URLs
- Speaker identification for multi-person videos
- Sentiment analysis integration
- Custom transcription fine-tuning 
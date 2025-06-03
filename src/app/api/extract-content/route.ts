import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { YoutubeTranscript } from 'youtube-transcript';

// Helper function to identify YouTube URLs
const isYoutubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
};

// Helper function for basic text scrubbing
const scrubText = (text: string): string => {
    let scrubbed = text;
    // Remove excessive newlines, replace with single newline
    scrubbed = scrubbed.replace(/\\n\\s*\\n/g, '\\n');
    // Remove leading/trailing whitespace from each line
    scrubbed = scrubbed.split('\\n').map(line => line.trim()).join('\\n');
    // Remove excessive spaces
    scrubbed = scrubbed.replace(/\\s{2,}/g, ' ');
    // Trim overall
    scrubbed = scrubbed.trim();
    return scrubbed;
};


export async function POST(req: NextRequest) {
    const { url } = await req.json();
    const logs: string[] = [];

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    logs.push(`[Extract Content] Received URL: ${url}`);

    try {
        let extractedText = '';

        if (isYoutubeUrl(url)) {
            logs.push('[Extract Content] YouTube URL detected.');
            try {
                // Attempt to fetch transcript using youtube-transcript
                const transcriptResponse = await YoutubeTranscript.fetchTranscript(url);
                if (transcriptResponse && transcriptResponse.length > 0) {
                    extractedText = transcriptResponse.map(item => item.text).join(' ');
                    logs.push('[Extract Content] Successfully fetched YouTube transcript via youtube-transcript.');
                } else {
                    logs.push('[Extract Content] No transcript found via youtube-transcript or transcript was empty.');
                    // TODO: Fallback to Gemini video transcription if captions are not available
                    // This will require sending the video content/URL to a Gemini model capable of video input.
                    // For now, we'll return an empty string or a specific message.
                    logs.push('[Extract Content] Gemini video transcription fallback not yet implemented.');
                    extractedText = 'YouTube video transcript not available via captions (Gemini fallback TBD).';
                }
            } catch (error: any) {
                logs.push(`[Extract Content] Error fetching YouTube transcript: ${error.message}`);
                // TODO: Fallback to Gemini video transcription
                logs.push('[Extract Content] Gemini video transcription fallback not yet implemented due to error.');
                extractedText = `Error fetching YouTube transcript (Gemini fallback TBD): ${error.message}`;
            }
        } else {
            logs.push('[Extract Content] Website URL detected.');
            try {
                const response = await axios.get(url, { 
                    timeout: 15000, // Add a timeout for the request itself
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                        // Sometimes a referer helps, but it's tricky to set a generic valid one.
                        // 'Referer': 'https://www.google.com/', 
                    }
                });
                const html = response.data;
                const $ = cheerio.load(html);

                // Check for error/restriction pages even on 200 OK
                const pageTitle = $('title').text().toLowerCase();
                const restrictionKeywords = [
                    'restricted', 'unsupported browser', 'error', 'captcha', 
                    'login', 'access denied', 'block', 'forbidden', 'not available',
                    'checking your browser', 'just a moment'
                ];
                
                let isRestrictedPage = false;
                for (const keyword of restrictionKeywords) {
                    if (pageTitle.includes(keyword)) {
                        isRestrictedPage = true;
                        break;
                    }
                }

                if (isRestrictedPage) {
                    logs.push(`[Extract Content] Detected restriction page for ${url} with title: "${$('title').text()}". Treating as extraction failure.`);
                    extractedText = `Content not accessible from ${new URL(url).hostname}: The page is protected or requires browser interaction (e.g., CAPTCHA, login, Cloudflare challenge).`;
                } else {
                    // Basic extraction - try to get main content areas
                    let content = '';
                    $('article, main, [role="main"], .main-content, .post-content, .entry-content, #content, .content, #main-content, div[class*="article-body"], div[class*="story-content"]').each((i, elem) => {
                        content += $(elem).text() + '\n\n';
                    });
    
                    if (!content) {
                         // Fallback: try to grab all p, h1-h6, li tags if specific main sections aren't found
                        $('h1, h2, h3, h4, h5, h6, p, li').each((i, elem) => {
                            content += $(elem).text().trim() + '\n';
                        });
                    }
                    
                    if (!content) {
                        // Ultimate fallback: body text, but this can be very noisy
                        content = $('body').text();
                        logs.push('[Extract Content] Used body text as fallback. Might be noisy.');
                    }
                    extractedText = content;
                    logs.push('[Extract Content] Successfully fetched and parsed website content.');
                }

            } catch (error: any) {
                let errorMessage = error.message;
                if (axios.isAxiosError(error) && error.response) {
                    // If it's an Axios error with a response, use the status code.
                    errorMessage = `Request failed with status code ${error.response.status} (${error.response.statusText})`;
                    logs.push(`[Extract Content] Axios error for ${url}: ${error.response.status} ${error.response.statusText}. Response data (first 100 chars): ${String(error.response.data).substring(0,100)}`);
                } else if (error.code === 'ECONNABORTED') {
                    errorMessage = 'Request timed out.';
                }

                logs.push(`[Extract Content] Error fetching website content for URL: ${url}. Error: ${errorMessage}. Full error object (stringified): ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
                console.error(`[Extract Content API] Error fetching website content for ${url}:`, error); 
                
                // Return success with error message in extractedText so research can continue with other sources
                extractedText = `Failed to fetch content from ${new URL(url).hostname}: ${errorMessage}`;
                logs.push(`[Extract Content] Returning graceful failure message for ${url}`);
                // Continue to normal response processing instead of returning 500
            }
        }

        const scrubbedExtractedText = scrubText(extractedText);
        logs.push(`[Extract Content] Original length: ${extractedText.length}, Scrubbed length: ${scrubbedExtractedText.length}`);

        return NextResponse.json({ logs, extractedText: scrubbedExtractedText });

    } catch (error: any) {
        logs.push(`[Extract Content] General error in POST /api/extract-content for URL: ${url}. Full error object: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
        console.error(`[Extract Content API] General error for ${url}:`, error); // Log the full error to server console
        return NextResponse.json({ logs, extractedText: '', error: error.message || 'An unknown error occurred during content extraction' }, { status: 500 });
    }
} 
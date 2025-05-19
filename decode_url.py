#!/usr/bin/env python3
import base64
import urllib.parse
import re

print("=== Testing with a direct download URL from RapidAPI response ===")
# Let's use the video_hd_540p_lowest URL from the response
base64_part = 'aHR0cHMlM0ElMkYlMkZ2MTYtd2ViYXBwLXByaW1lLnRpa3Rvay5jb20lMkZ2aWRlbyUyRnRvcyUyRm5vMWElMkZ0b3Mtbm8xYS12ZS0wMDY4LW5vJTJGbzBnRVF1Z2RtRk5nQUJrM1BuemlSUWdGcUVRd2ZGS0RJMEZrZXMlMkYlM0ZhJTNEMTk4OCUyNmJ0aSUzRE9Ec3pOV1l1TURFNiUyNmNoJTNEMCUyNmNyJTNEMyUyNmRyJTNEMCUyNmxyJTNEYWxsJTI2Y2QlM0QwJTI1N0MwJTI1N0MwJTI1N0MlMjZjdiUzRDElMjZiciUzRDcxMCUyNmJ0JTNEMzU1JTI2Y3MlM0QwJTI2ZHMlM0Q2JTI2ZnQlM0QtQ3NrX214VFBEMTJObDljbGgtVXhGdjVTWTNXM3d2MjVpY0FwJTI2bWltZV90eXBlJTNEdmlkZW9fbXA0JTI2cXMlT0ZFUHFpOFMyUWF1aS1OYVVRdUEM0Q1JTI2cmMlM0RaelUwT0RzOFBEaHBaenc4UERacFprQnBNemg0YkhNNWNqc3plRE16Ynpjek5VQXRMbUEwTUdBMVgyTXhYbUJlTFRBMVlTTTFZUzF0TW1ScmFYRmdMUzFrTVRGemN3JTI1M0QlMjUzRCUyNmJ0YWclM0RlMDAwOTAwMDAlMjZleHBpcmUlM0QxNzQ3NDg2NjY0JTI2bCUzRDIwMjUwNTE1MjA1NjM3NzVCODVDNUQ3MjU2MzUwRkYzRjklMjZwbHlfdHlwZSUzRDIlMjZwb2xpY3klM0QyJTI2c2lnbmF0dXJlJTNEMDI0ZTA1ZDFiYjAxMzkyYjIwMjkxNTBlOWZhYWVjNjMlMjZ0ayUzRHR0X2NoYWluX3Rva2Vu'

try:
    # 1. Let's try direct base64 decoding first
    # Fix padding if needed
    padding_needed = len(base64_part) % 4
    if padding_needed:
        base64_part += "=" * (4 - padding_needed)
    
    # Try to decode directly
    decoded_bytes = base64.b64decode(base64_part)
    decoded_str = decoded_bytes.decode('utf-8', errors='replace')
    print(f"\nBase64 decoded URL (still URL-encoded):\n{decoded_str}")
    
    # Now URL decode this result
    fully_decoded = urllib.parse.unquote(decoded_str)
    print(f"\nFully decoded TikTok CDN URL:\n{fully_decoded}")
    
    print("\n=== SOLUTION: Direct CDN URL to use ===")
    clean_url = fully_decoded.split('?')[0]  # Remove query parameters
    print(f"Clean TikTok CDN URL (without params): {clean_url}")
    
    # Let's also check for any non-printable or strange characters using a hex dump
    print("\nHex representation of the clean URL:")
    print(' '.join(f"{ord(c):02x}" for c in clean_url))
    
    print("\n=== Recommendation for /api/transcribe/route.ts fix ===")
    print("1. Update the function to use the TikTok CDN URL directly without parameters:")
    print("   For TikTok videos, identify direct CDN URLs and use them without parameters")
    print("   Example implementation:")
    print("""
    // For TikTok videos that have direct CDN URLs
    if (isTikTok) {
        // Try to find a direct CDN URL in the links
        for (const linkObj of links) {
            if (linkObj.link && linkObj.link.includes('tiktok.com/video/tos/')) {
                // Extract the clean CDN URL without parameters
                const cdnUrl = new URL(linkObj.link);
                const cleanCdnUrl = cdnUrl.origin + cdnUrl.pathname;
                audioUrlToTranscribe = cleanCdnUrl;
                console.log(`[API /transcribe] Using clean TikTok CDN URL: ${audioUrlToTranscribe}`);
                break;
            }
        }
    }
    """)
    
    print("\n2. Alternative Solution: Use direct video URL")
    print("   Use the original TikTok URL directly with AssemblyAI")
    print("   They support TikTok public URLs: https://www.tiktok.com/@aronsogi/video/7474298674303028502")
    
except Exception as e:
    print(f"Error: {e}") 
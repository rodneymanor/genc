# Tech Context

## 1. Core Technologies
- **Framework/Language:** React (with Next.js)
- **UI Components:** Shadcn/ui
- **Styling:** Tailwind CSS
- **AI Integration:** Vercel AI SDK (@ai-sdk/react, @ai-sdk/openai, ai)
- **Markdown Rendering:** react-markdown, react-syntax-highlighter
- **Potentially for animations/advanced UI:** Magic UI

## 2. Development Environment & Setup
- Node.js and npm/yarn for package management.
- Next.js development server (`next dev`).
- Environment variables for API keys (e.g., OpenAI API Key in `.env.local`).

## 3. Technical Constraints & Considerations
- Ensure compatibility between Shadcn/ui, Tailwind CSS, and any existing application styles.
- API rate limits for AI model interactions.
- Browser compatibility for embedded video players.
- Performance considerations for streaming AI responses and rendering large chat histories.

## 4. Dependencies (Key Packages to Install)
- `@ai-sdk/react`
- `@ai-sdk/openai`
- `ai`
- `firebase`
- `react-markdown`
- `react-syntax-highlighter`
- `shadcn-ui` (and its dependencies like `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`)
- `tailwindcss`

## 5. API Integrations
- OpenAI API (via Vercel AI SDK).
- Potentially APIs for fetching video metadata from platforms like YouTube, TikTok, Instagram (details to be defined).
- **Video Metadata:** Social Media Video Downloader API from RapidAPI ([https://rapidapi.com/emmanueldavidyou/api/social-media-video-downloader](https://rapidapi.com/emmanueldavidyou/api/social-media-video-downloader)) for Instagram and TikTok videos. Requires `RAPIDAPI_KEY` environment variable.

## 6. Future Planned Integrations
- **User Authentication:** Firebase Authentication (Implementation in progress).
- **Data Persistence:** Firestore for user-specific data (Implementation in progress). 
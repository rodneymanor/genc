# Active Context

## 1. Current Focus
- **Phase 1: Core Functionality** - Project Setup & Configuration.
  - Dependencies installed (`@ai-sdk/react`, `@ai-sdk/openai`, `ai`, `react-markdown`, `react-syntax-highlighter`).
  - Environment variables (`.env.local`) for API keys assumed to be set up by the user.
  - Initial directory structure created.
  - Updating Memory Bank files with the detailed project plan and current status.

## 2. Recent Changes
- Approved detailed project plan.
- Installed core dependencies.
- Created initial project directories.
- Updated Memory Bank files.
- Replaced the application logo with the letter "C" (Poppins, Bold) in `AppHeader.tsx`.
- Replaced the application logo with the letter "C" (Poppins, Bold) in `AppSidebar.tsx`.

## 3. Next Steps (Phase 1 - Initial Component & Context Setup)
- Create `AppContext.tsx` for basic state management (current view, selected video).
- Create placeholder files for initial components in `/components` subdirectories.
- Begin implementation of the main `app/page.tsx` to orchestrate Discovery/Split views.

## 4. Active Decisions & Considerations
- Plan assumes Firebase SDK installation will be deferred to Phase 3.
- User has confirmed Shadcn/ui is initialized and `tailwind.config.ts` / `globals.css` are in place.
- New page will be the application root (`/`).
- RapidAPI for video metadata (Instagram, TikTok).
- OpenAI for AI chat/script generation. 
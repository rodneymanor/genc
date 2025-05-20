# Active Context

## 1. Current Focus
- **Firebase Integration**: Setting up Firebase for authentication and Firestore database.
  - Installed `firebase` SDK.
  - Created `src/lib/firebase.ts` for Firebase initialization.
  - Created `src/contexts/AuthContext.tsx` for authentication state management.
  - Created `src/lib/firestore.ts` for Firestore CRUD operations.
  - User prompted to update `.env.example` and `.env.local` with Firebase config.
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
- Integrate `AuthProvider` into the main application layout/provider structure.
- Create example usage of authentication (e.g., a simple login/signup form).
- Create placeholder files for initial components in `/components` subdirectories.
- Begin implementation of the main `app/page.tsx` to orchestrate Discovery/Split views.

## 4. Active Decisions & Considerations
- Firebase SDK has been installed earlier than initially planned (previously Phase 3).
- User has confirmed Shadcn/ui is initialized and `tailwind.config.ts` / `globals.css` are in place.
- New page will be the application root (`/`).
- RapidAPI for video metadata (Instagram, TikTok).
- OpenAI for AI chat/script generation. 
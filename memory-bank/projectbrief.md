# Project Brief: Dynamic Video Discovery and Interaction Platform

## 1. Core Idea
To develop a new main page for a React application that serves as a dynamic video discovery and interaction platform. The platform will allow users to search for videos, browse categories, and engage with video content through an AI-powered chat interface capable of providing information, analysis, and generating video scripts.

## 2. Main Goals
-   Create an engaging landing page for video discovery (search, categories, recommendations).
-   Implement an interactive split view for video playback and AI interaction (chat and script generation).
-   Ensure a clean, minimalist, v0.dev-inspired aesthetic, particularly for interactive elements.
-   Maintain visual consistency with existing application styles if applicable.
-   Leverage React, Next.js, Tailwind CSS, Shadcn/ui, and the Vercel AI SDK.

## 3. Target Audience
Users looking for a novel way to discover, consume, and interact with video content, potentially including content creators, researchers, or casual viewers seeking deeper engagement.

## 4. Scope & Key Features (High-Level from Initial Request)
-   **Landing Page (Discovery View):**
    -   Prominent search component.
    -   Category selection pills.
    -   Video recommendations grid.
-   **Interactive Interface (Split View):**
    -   Smooth transition animation.
    -   Responsive split layout (AI Chat/Script Generator on left, Video Player/Info on right).
    -   **AI Chat & Script Generation Interface (Left Side):**
        -   Tabbed: "Chat Assistant" & "Script Generator".
        -   Chat Assistant: Vercel AI SDK (`useChat`), Markdown rendering, message history, input area. API: `app/api/chat/route.ts`.
        -   Script Generator: Multi-step process.
            -   User inputs video idea.
            -   System fetches ~9 relevant sources (e.g., using Google Custom Search via an API route like `app/api/test-gemini-search/route.ts`).
            -   Sources are displayed (e.g., as cards in a "Research" tab).
            -   System analyzes sources (details TBD, new API route needed).
            -   System generates multiple outline options (hooks, main points/factsets, takes, CTAs/outros) based on analysis (new API route needed, e.g., `app/api/generate-script-components/route.ts`).
            -   Users select and customize outline components in an "Outline" tab.
            -   System generates a final script based on user selections (existing API `app/api/generate-final-script/route.ts` to be adapted).
            -   State managed via `AiWriterContext.tsx`.
    -   **Video Player & Information (Right Side):**
        -   Embedded player (TikTok, Instagram, YouTube).
        -   Video title, description, source, share option.
-   **Navigation:**
    -   Back button.
    -   Persistent app header (logo, nav links).
    -   Breadcrumbs (optional).
-   **Technical Stack:**
    -   React (Next.js).
    -   State Management: React Context/Redux (global), `useChat` (chat-specific).
    -   Styling: Tailwind CSS, Shadcn/ui, Magic UI (optional).
    -   Vercel AI SDK (`@ai-sdk/react`, `@ai-sdk/openai`, `ai`).
    -   `react-markdown`, `react-syntax-highlighter`.
-   **UX & Design:**
    -   Clean, minimalist, modern, v0.dev-inspired.
    -   Responsive design.
    -   Dark/Light mode compatibility (if existing).
    -   Accessibility (A11y).
    -   Error handling and empty states.
    -   Loading states.

## 5. Phases (from Initial Request)
-   **Phase 1 (Core Functionality):** Landing page basics, video grid, basic split view, core video player, basic AI chat.
-   **Phase 2 (Enhanced Interaction & UI Polish):** Transitions, full responsive design, script generator, Markdown rendering, refined styling.
-   **Phase 3 (Advanced Features & Optimization):** Navigation elements, persistent state, advanced error/empty states, performance optimization, A11y review.

## 6. Non-Goals (Initially)
-   User authentication (not specified yet).
-   Database for storing user data beyond session (not specified yet).
-   Features beyond the described video discovery and AI interaction. 
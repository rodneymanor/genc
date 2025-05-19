# System Patterns

## 1. Architecture Overview
- Next.js application with client-side React components and server-side API routes.
- Component-based architecture, likely organized by feature or type (e.g., `components/ui`, `components/features`).

## 2. Key Technical Decisions (Initial)
- Use Vercel AI SDK for chat functionalities.
- Employ Shadcn/ui for UI components and Tailwind CSS for styling.
- API routes in Next.js for backend logic (chat, script generation).

## 3. Design Patterns
- **MVC-like for API routes:** API routes will handle requests, process logic (potentially interacting with AI models), and return responses.
- **Component-based UI:** Leveraging React's component model for building the user interface.
- **State Management:** `useChat` for chat-specific state; React Context or Redux for global state.

## 4. Component Relationships (High-Level)
- **Main Page:** Orchestrates Discovery View and Interactive (Split) View.
- **Discovery View:** Contains SearchInput, CategoryPills, VideoRecommendationsGrid (which uses VideoCard).
- **Interactive View:** Contains VideoChat (uses ChatMessage, MarkdownRenderer), VideoScriptGenerator, and VideoPlayer. 
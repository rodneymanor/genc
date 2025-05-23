# Active Context

## 1. Current Focus
- **AI Writer Enhancement (Multi-Step Script Generation):**
  - Expanding `AiWriterContext.tsx` to manage the full script generation workflow: source fetching, research analysis, outline generation (script components), user customization, and final script generation.
  - Current state of `AiWriterContext.tsx` includes:
    - State for `sources`, `researchAnalysis`, `scriptComponents`, `userSelectedComponents`, `finalScript`.
    - Functions like `triggerSearch` (fetches sources), `analyzeAndGenerateOutlines` (placeholder for analysis & outline options), `generateFinalScript`.
    - Loading and error states for each step.
  - Integration of AI Writer search with `SearchInput.tsx` on the main page, redirecting to `/ai-writer`.
  - Display of a `ThinkingTimeline` component on `AiWriterPage` during processing.
  - Display of fetched sources as `ClientTweetCard`s in the "Research" tab of `AiWriterPage`.

## 2. Recent Changes
- **AI Writer UI & Context:**
  - Updated AI Writer tabs to a Perplexity-style UI (spacing, borders, Tabler Icons).
  - Ensured AI Writer page (`/ai-writer`) uses the main app layout (`AppSidebar`, `MainContent`).
  - Replaced `AiWriterTabs` with a new `TabsUnderlinedDemo` structure.
  - Styled tabs with increased underline, Poppins font, and larger font size.
  - Integrated `ClientTweetCard` and `TweetSkeleton` for displaying research sources in a 3x3 grid.
  - Created `src/components/magicui/tweet-card.tsx` and `src/components/magicui/client-tweet-card.tsx`.
  - Set up a test page (`/test-gemini`) and API route (`/api/test-gemini-search`) for Gemini-powered source discovery using Google Custom Search. This API fetches sources for a given video idea.
  - Integrated AI Writer search into `SearchInput.tsx` with a toggle:
    - If active, triggers the `/api/test-gemini-search` API, navigates to `/ai-writer`, shows `ThinkingTimeline`.
    - Results (sources) are passed to `AiWriterPage` via `AiWriterContext`.
  - Created `AiWriterContext.tsx` to manage state for this flow (isProcessing, currentStep, sources, videoIdea, error, researchAnalysis, scriptComponents, userSelectedComponents, finalScript, and related setters/functions).
  - Created `ThinkingTimeline.tsx` component for visual feedback during processing.
  - Added state for `researchAnalysis` (and related loading/error states, setters, and a placeholder `analyzeAndGenerateOutlines` function) to `AiWriterContext.tsx`.
- **Git:** Committed and pushed all recent AI Writer changes.
- **Firebase:** Initial setup for Firebase Auth and Firestore (now secondary focus to AI Writer).

## 3. Next Steps (AI Writer - API and UI for Full Workflow)
- **API Development:**
  - Define and implement an API route for **analyzing sources**. Input: `Source[]`, `videoIdea`. Output: `ResearchAnalysis` (structure TBD). This API will take the fetched sources and distill key information.
  - Refine/implement API route for **generating script components/outlines** (e.g., `/api/generate-script-components`). Input: `ResearchAnalysis`. Output: `ScriptComponents` (hooks, factsets, takes, outros).
  - Ensure `/api/generate-final-script` correctly uses `userSelectedComponents` (the user's chosen outline parts) and `videoIdea` to produce the final script.
- **Context (`AiWriterContext.tsx`) Integration:**
  - Implement actual API calls within `analyzeAndGenerateOutlines` to call the new "analyze sources" and "generate script components" APIs, replacing current placeholder logic.
  - Determine the trigger for `analyzeAndGenerateOutlines` (e.g., automatically after `triggerSearch` completes, or a manual user action on the "Research" tab).
- **UI Development (`AiWriterPage.tsx` - "Outline" and "Script" Tabs):**
  - **"Outline" Tab:**
    - Display loading/error states related to `researchAnalysis` and `scriptComponents` generation.
    - Implement UI to present the generated `scriptComponents` (multiple options for hooks, factsets, takes, outros).
    - Allow users to select their preferred components, which will update `userSelectedComponents` in `AiWriterContext`.
    - Consider UI for selecting/managing pre-existing templates for script parts (hooks, CTAs) if this feature is pursued.
  - **"Script" Tab:**
    - Display loading/error states for final script generation.
    - Provide a button or trigger to call `generateFinalScript` from `AiWriterContext`.
    - Display the `finalScript` once generated.
  - Ensure overall flow provides clear user feedback at each stage (loading, success, errors).

## 4. Active Decisions & Considerations
- The AI Writer workflow (source discovery, analysis, outline generation, user customization, final script) is the primary development focus. Firebase integration is secondary.
- The precise data structure for `ResearchAnalysis` needs to be defined. This will depend on what information the "generate script components" AI model requires.
- The user interaction for triggering the analysis and outline generation steps needs to be decided (e.g., automatic progression after sources are loaded vs. a manual "Generate Outline" button).
- Management of pre-existing hook/bridge/CTA templates and their integration into the `userSelectedComponents` flow needs further thought if it's a priority.

## 5. Additional Notes
- The AI Writer workflow is designed to handle the full script generation process, from source discovery to final script generation.
- The integration of AI Writer search with Gemini for source discovery is a key feature for enhancing the user experience.
- The API development for analyzing sources and generating script components is crucial for the AI Writer's functionality.
- The UI development for the AI Writer page is essential for a user-friendly and efficient script generation experience. 
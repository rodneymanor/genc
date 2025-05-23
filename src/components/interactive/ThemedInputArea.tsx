import React, { useState, useRef, useImperativeHandle, useEffect } from 'react';
import { SegmentedControlTabs } from './SegmentedControlTabs'; // Import the new component

// Helper function to build Tailwind class strings for colors
// Handles both Tailwind color names (e.g., "blue-500") and hex codes (e.g., "#FF0000")
// and applies dark mode variants if darkColor is provided.
const buildColorClasses = (
  prefix: string, // e.g., "bg", "text", "border", "ring", "caret"
  lightColor?: string,
  darkColor?: string,
  isPlaceholder: boolean = false,
  isSelection: boolean = false,
): string => {
  let classes = "";

  const addClass = (colorStr: string | undefined, isDark: boolean) => {
    if (!colorStr) return;

    let currentPrefix = prefix;
    if (isPlaceholder) currentPrefix = `placeholder:${prefix}`;
    if (isSelection) currentPrefix = `selection:${prefix}`;


    if (isDark) {
      currentPrefix = `dark:${currentPrefix}`;
    }

    if (colorStr.startsWith("#") || colorStr.startsWith("rgb") || colorStr.startsWith("hsl")) {
      classes += `${currentPrefix}-[${colorStr}] `;
    } else {
      // Assumes it's a Tailwind color name like "blue-500"
      // These classes must be discoverable by Tailwind's JIT compiler.
      // Ensure they are used literally elsewhere or safelisted in tailwind.config.js if necessary.
      classes += `${currentPrefix}-${colorStr} `;
    }
  };

  addClass(lightColor, false);
  addClass(darkColor, true);
  
  return classes.trim();
};


// --- SVG Icon Components (extracted for clarity) ---

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" color="currentColor" className={className} fill="currentColor" fillRule="evenodd">
    <path d="M11 2.125a8.378 8.378 0 0 1 8.375 8.375c0 .767-.1 1.508-.304 2.22l-.029.085a.875.875 0 0 1-1.653-.566l.054-.206c.12-.486.182-.996.182-1.533A6.628 6.628 0 0 0 11 3.875 6.628 6.628 0 0 0 4.375 10.5a6.628 6.628 0 0 0 10.402 5.445c.943-.654 2.242-.664 3.153.109l.176.165.001.002 4.066 4.184a.875.875 0 0 1-1.256 1.22l-4.064-4.185-.104-.088c-.263-.183-.646-.197-.975.03l-.001.003A8.378 8.378 0 0 1 2.625 10.5 8.378 8.378 0 0 1 11 2.125Zm0 7.09a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z"></path>
  </svg>
);

const ResearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" color="currentColor" className={className} fill="currentColor" fillRule="evenodd">
    <path d="M8.175 13.976a.876.876 0 0 1 1.172-.04l.065.061.582.59c.196.194.395.388.596.576l.39.358c1.942 1.753 3.844 2.937 5.357 3.477.81.29 1.444.369 1.884.31.404-.055.61-.216.731-.446.135-.256.209-.678.116-1.31-.08-.546-.275-1.191-.59-1.91l-.141-.313-.034-.083a.875.875 0 0 1 1.575-.741l.042.079.161.353c.36.823.61 1.623.719 2.362.122.836.071 1.675-.3 2.38-.431.818-1.186 1.247-2.044 1.363-.823.111-1.756-.056-2.707-.396-1.912-.681-4.17-2.154-6.357-4.207a30.378 30.378 0 0 1-.63-.61l-.608-.615-.058-.068a.875.875 0 0 1 .079-1.17Zm.624-5.822a.876.876 0 0 1 1.216 1.258c-.396.383-.788.775-1.165 1.178-1.95 2.077-3.26 4.133-3.835 5.747-.29.81-.37 1.444-.31 1.884.055.404.215.61.444.731l.104.048c.261.103.654.149 1.207.068.623-.09 1.378-.333 2.224-.731a.875.875 0 0 1 .745 1.583c-.948.446-1.871.756-2.716.88-.784.114-1.57.078-2.246-.234l-.134-.066c-.817-.431-1.246-1.186-1.362-2.044-.112-.823.056-1.756.395-2.707.64-1.792 1.973-3.889 3.83-5.945l.377-.411c.402-.43.816-.843 1.226-1.239Zm8.5-4.954c.832-.122 1.67-.073 2.372.302h-.001c.814.432 1.243 1.185 1.36 2.042.11.823-.057 1.756-.396 2.707-.682 1.911-2.154 4.17-4.207 6.356h-.001c-.403.429-.818.846-1.236 1.236l-.068.057a.875.875 0 0 1-1.127-1.336l.582-.562c.193-.193.385-.39.573-.592l.359-.39c1.752-1.942 2.937-3.844 3.476-5.357.29-.811.37-1.444.31-1.884-.055-.404-.216-.61-.446-.731l-.003-.002c-.248-.132-.663-.207-1.293-.114-.62.09-1.37.332-2.208.73l-.083.034a.876.876 0 0 1-.667-1.615l.351-.161c.819-.36 1.616-.612 2.353-.72Zm-5.292 7.507a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM5.544 2.971c.823-.112 1.756.056 2.707.395 1.911.682 4.17 2.154 6.356 4.207.214.201.426.406.632.612l.604.625.057.068a.875.875 0 0 1-1.271 1.19l-.065-.063-.562-.582c-.193-.193-.39-.385-.592-.573-2.077-1.95-4.133-3.26-5.747-3.835-.811-.29-1.444-.37-1.884-.31-.404.055-.61.215-.731.444l-.002.004c-.132.248-.207.664-.114 1.294.08.543.275 1.184.588 1.898l.142.31.034.083a.875.875 0 0 1-1.572.746l-.043-.079-.161-.352c-.36-.819-.612-1.615-.72-2.352-.122-.832-.073-1.67.302-2.372.431-.814 1.185-1.242 2.042-1.358Z"></path>
  </svg>
);

const CpuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`tabler-icon tabler-icon-cpu ${className}`}>
    <path d="M5 5m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z"></path>
    <path d="M9 9h6v6h-6z"></path><path d="M3 10h2"></path><path d="M3 14h2"></path><path d="M10 3v2"></path><path d="M14 3v2"></path><path d="M21 10h-2"></path><path d="M21 14h-2"></path><path d="M14 21v-2"></path><path d="M10 21v-2"></path>
  </svg>
);

const WorldIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`tabler-icon tabler-icon-world ${className}`}>
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path><path d="M3.6 9h16.8"></path><path d="M3.6 15h16.8"></path><path d="M11.5 3a17 17 0 0 0 0 18"></path><path d="M12.5 3a17 17 0 0 1 0 18"></path>
  </svg>
);

const PaperclipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`tabler-icon tabler-icon-paperclip ${className}`}>
    <path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5"></path>
  </svg>
);

const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className={`tabler-icon tabler-icon-microphone-filled ${className}`}>
    <path d="M19 9a1 1 0 0 1 1 1a8 8 0 0 1 -6.999 7.938l-.001 2.062h3a1 1 0 0 1 0 2h-8a1 1 0 0 1 0 -2h3v-2.062a8 8 0 0 1 -7 -7.938a1 1 0 1 1 2 0a6 6 0 0 0 12 0a1 1 0 0 1 1 -1m-7 -8a4 4 0 0 1 4 4v5a4 4 0 1 1 -8 0v-5a4 4 0 0 1 4 -4"></path>
  </svg>
);

const VoiceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" color="currentColor" className={className} fill="currentColor" fillRule="evenodd">
    <path d="M0 12.6663C0 13.4018 0.59792 13.9997 1.33333 13.9997C2.06875 13.9997 2.66667 13.4018 2.66667 12.6663V11.333C2.66667 10.5975 2.06875 9.99967 1.33333 9.99967C0.59792 9.99967 0 10.5975 0 11.333V12.6663ZM6.66667 5.33301C7.40213 5.33301 8 5.93087 8 6.66634V17.333C8 18.0685 7.40213 18.6663 6.66667 18.6663C5.9312 18.6663 5.33333 18.0685 5.33333 17.333V6.66634C5.33333 5.93087 5.9312 5.33301 6.66667 5.33301ZM10.6667 21.333C10.6667 22.0685 11.2645 22.6663 12 22.6663C12.7355 22.6663 13.3333 22.0685 13.3333 21.333V2.66634C13.3333 1.93093 12.7355 1.33301 12 1.33301C11.2645 1.33301 10.6667 1.93093 10.6667 2.66634V21.333ZM17.3333 5.33301C18.0688 5.33301 18.6667 5.93087 18.6667 6.66634V17.333C18.6667 18.0685 18.0688 18.6663 17.3333 18.6663C16.5979 18.6663 16 18.0685 16 17.333V6.66634C16 5.93087 16.5979 5.33301 17.3333 5.33301ZM24 11.333C24 10.5975 23.4021 9.99967 22.6667 9.99967C21.9312 9.99967 21.3333 10.5975 21.3333 11.333V12.6663C21.3333 13.4018 21.9312 13.9997 22.6667 13.9997C23.4021 13.9997 24 13.4018 24 12.6663V11.333Z"></path>
  </svg>
);


// --- Component Props Interface ---
export interface ThemedInputAreaProps {
  /** * Background color for the main component. 
   * Accepts Tailwind color name (e.g., "zinc-100") or hex (e.g., "#FFFFFF"). 
   * Default: "white"
   */
  bgColor?: string;
  /** * Text color for the main component. 
   * Accepts Tailwind color name (e.g., "neutral-800") or hex (e.g., "#333333").
   * Default: "neutral-800"
   */
  textColor?: string;
  /** * Placeholder text color for the textarea.
   * Accepts Tailwind color name (e.g., "neutral-400") or hex (e.g., "#A0A0A0").
   * Default: "neutral-400"
   */
  placeholderColor?: string;
  /** * Border color for the main component and focused elements.
   * Accepts Tailwind color name (e.g., "neutral-300") or hex (e.g., "#D1D5DB").
   * Default: "neutral-300"
   */
  borderColor?: string;
  /** * Accent color for highlights, focus rings, selected items, caret, selection background.
   * Accepts Tailwind color name (e.g., "sky-500") or hex (e.g., "#0EA5E9").
   * Default: "sky-500"
   */
  accentColor?: string;
   /** * Text color for selected text in textarea.
   * Accepts Tailwind color name (e.g., "white") or hex (e.g., "#FFFFFF").
   * Default: "white"
   */
  selectionTextColor?: string;

  // --- Dark Mode Colors (Applied if dark mode is active in Tailwind config) ---
  /** Background color for dark mode. Default: "zinc-800" */
  darkBgColor?: string;
  /** Text color for dark mode. Default: "neutral-200" */
  darkTextColor?: string;
  /** Placeholder text color for dark mode. Default: "neutral-500" */
  darkPlaceholderColor?: string;
  /** Border color for dark mode. Default: "neutral-700" */
  darkBorderColor?: string;
  /** Accent color for dark mode. Default: "sky-600" */
  darkAccentColor?: string;
  /** Text color for selected text in textarea in dark mode. Default: "black" */
  darkSelectionTextColor?: string;

  // --- Content & Behavior ---
  /** Initial value for the textarea. */
  initialValue?: string;
  /** Placeholder text for the textarea. Default: "Ask anything…" */
  textareaPlaceholder?: string;
  /** Callback function when the textarea value changes. */
  onValueChange?: (value: string) => void;
  /** ID for the textarea element. */
  textareaId?: string;
  /** Callback function when the submit button is clicked. */
  onSubmit?: () => void;

  // --- Styling & Layout ---
  /** Additional Tailwind classes for the root element of the component. */
  rootClassName?: string;

  // --- Refs ---
  /** Forwarded ref to the textarea element. */
  textareaRef?: React.Ref<HTMLTextAreaElement>;

  // New props for controlled component
  activeSegment: string;
  onSegmentChange: (segment: string) => void;
  showSegmentedControls?: boolean;
}

// --- The Component ---
const ThemedInputArea: React.FC<ThemedInputAreaProps> = React.forwardRef<HTMLDivElement, ThemedInputAreaProps>(
  (
    {
      bgColor = "white",
      textColor = "neutral-800",
      placeholderColor = "neutral-400",
      borderColor = "neutral-300", // borderMain in original
      accentColor = "sky-500", // superDuper in original
      selectionTextColor = "white",

      darkBgColor = "zinc-800", // offsetDark in original
      darkTextColor = "neutral-200", // textMainDark in original
      darkPlaceholderColor = "neutral-500", // textOffDark in original
      darkBorderColor = "neutral-700", // textMain/10 or a darker border
      darkAccentColor = "sky-600", // superDark in original
      darkSelectionTextColor = "black",


      initialValue = "",
      textareaPlaceholder = "Ask anything…", // Default placeholder will be overridden by dynamic placeholder
      onValueChange,
      textareaId = "ask-input",
      rootClassName = "",
      textareaRef: forwardedTextareaRef,
      onSubmit,
      activeSegment,
      onSegmentChange,
      showSegmentedControls = false,
    },
    ref // Ref for the root div element
  ) => {
    const [inputValue, setInputValue] = useState(initialValue);
    const internalTextareaRef = useRef<HTMLTextAreaElement>(null); // Declare internalTextareaRef

    // Allows the component to be used with a forwarded ref to the textarea
    useImperativeHandle(forwardedTextareaRef, () => internalTextareaRef.current as HTMLTextAreaElement);
    
    // Auto-resize textarea height
    useEffect(() => {
        const textarea = internalTextareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height
            textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
        }
    }, [inputValue]);

    // Dynamic placeholder based on active segment
    const getDynamicPlaceholder = () => {
      return activeSegment === 'analyzer' 
        ? "Enter TikTok, Instagram, or YouTube Shorts URL..." 
        : "Describe your video idea using descriptive text.";
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(event.target.value);
      if (onValueChange) {
        onValueChange(event.target.value);
      }
    };

    // --- Generate Tailwind Class Strings ---
    const baseBgClass = buildColorClasses("bg", bgColor, darkBgColor);
    const baseTextClass = buildColorClasses("text", textColor, darkTextColor);
    const baseBorderClass = buildColorClasses("border", borderColor, darkBorderColor);
    // For focus rings, we might use the ring utility with the accent color
    const focusRingClass = buildColorClasses("ring", accentColor, darkAccentColor);
    
    const placeholderClasses = buildColorClasses("text", placeholderColor, darkPlaceholderColor, true);
    const caretColorClass = buildColorClasses("caret", accentColor, darkAccentColor);

    const selectionBgClass = buildColorClasses("bg", accentColor, darkAccentColor, false, true);
    const selectionTextClass = buildColorClasses("text", selectionTextColor, darkSelectionTextColor, false, true);

    // Specific background for textarea if different from main (original had dark:bg-offsetDark vs dark:bg-backgroundDark)
    // For simplicity, using main bg, but could add specific props like `textareaBgColor`
    const textareaBgClass = baseBgClass; // Or customize: buildColorClasses("bg", textareaBgColor, darkTextareaBgColor);
    const textareaTextClass = baseTextClass;
    
    // Segmented control active state
    const activeSegmentBgClass = buildColorClasses("bg", bgColor, darkAccentColor); // Active bg can be accent or main bg
    const activeSegmentBorderClass = buildColorClasses("border", accentColor, darkAccentColor);
    const activeSegmentTextClass = buildColorClasses("text", accentColor, darkBgColor); // Text color contrast with active bg

    const inactiveSegmentTextClass = buildColorClasses("text", placeholderColor, darkPlaceholderColor); // Or a more specific prop

    // Button hover states (simplified, can be expanded with more props)
    const iconButtonHoverBgClass = `hover:${buildColorClasses("bg", "neutral-100", "neutral-700").replace('dark:hover:bg','dark:hover:bg')}`; // Example hover
    const iconButtonHoverTextClass = `hover:${buildColorClasses("text", textColor, darkTextColor).replace('dark:hover:text','dark:hover:text')}`;

    return (
      <div ref={ref} className={`w-full ${rootClassName}`}>
        <div className="relative">
          <div> {/* This div was present in original, keeping structure */}
            <span className="grow block">
              <div className={`rounded-2xl ${baseTextClass}`}> {/* Main container for theming */}
                <div
                  className={`w-full outline-none focus-within:ring-1 font-sans flex items-center 
                              border rounded-2xl duration-75 transition-all shadow-sm dark:shadow-md 
                              shadow-textMain/5 dark:shadow-black/10 px-0 pt-3 pb-3 gap-y-2 grid items-center
                              ${baseBgClass} ${baseBorderClass} ${focusRingClass} focus-within:${focusRingClass}`}
                >
                  <div className="px-3 grid-rows-1fr-auto grid grid-cols-3 w-full"> {/* Changed px-md to px-3 */}
                    {/* Textarea Section */}
                    <div className="col-start-1 col-end-4 pb-2 overflow-hidden relative flex h-full w-full"> {/* Changed pb-sm to pb-2 */}
                      <textarea
                        ref={internalTextareaRef}
                        autoFocus
                        placeholder={getDynamicPlaceholder()} // Using dynamic placeholder here
                        className={`overflow-auto max-h-[45vh] lg:max-h-[40vh] sm:max-h-[25vh] outline-none w-full 
                                   font-sans resize-none scrollbar-thin scrollbar-track-transparent
                                   ${textareaBgClass} ${textareaTextClass} ${placeholderClasses} ${caretColorClass}
                                   ${selectionBgClass} ${selectionTextClass}
                                   scrollbar-thumb-idle dark:scrollbar-thumb-idleDark`} // Assuming these scrollbar classes are defined
                        value={inputValue}
                        onChange={handleInputChange}
                        rows={2} // Initial rows, height will adjust
                        id={textareaId}
                        data-1p-ignore="true"
                      />
                    </div>

                    {/* Segmented Control Section */}
                    {showSegmentedControls && (
                      <div className="pt-2 flex justify-center">
                        <SegmentedControlTabs 
                          value={activeSegment} 
                          onValueChange={onSegmentChange} 
                          activeBgLight={bgColor}      // Use main background for active light tab
                          activeBgDark={darkBgColor}   // Use main dark background for active dark tab
                          activeTextLight={accentColor}  // Use accent for active light text
                          activeTextDark={darkAccentColor} // Use dark accent for active dark text
                          inactiveTextLight={placeholderColor} // Use placeholder for inactive light text
                          inactiveTextDark={darkPlaceholderColor} // Use dark placeholder for inactive dark text
                        />
                      </div>
                    )}

                    {/* Icon Buttons Section */}
                    <div className={`flex items-center justify-self-end rounded-full col-start-3 row-start-2 -mr-1 ${baseBgClass}`}>
                      {/* Simplified icon buttons for brevity, apply theming as needed */}
                      <button type="button" aria-label="Choose a model" className={`p-1.5 rounded-lg ${iconButtonHoverBgClass} ${inactiveSegmentTextClass} ${iconButtonHoverTextClass} focus-visible:ring-1 ${focusRingClass}`}>
                        <CpuIcon className="w-4 h-4" />
                      </button>
                       <button type="button" aria-label="Language settings" className={`p-1.5 rounded-lg ${iconButtonHoverBgClass} ${inactiveSegmentTextClass} ${iconButtonHoverTextClass} focus-visible:ring-1 ${focusRingClass}`}>
                        <WorldIcon className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button type="button" aria-label="Attach files" className={`p-1.5 rounded-lg ${iconButtonHoverBgClass} ${inactiveSegmentTextClass} ${iconButtonHoverTextClass} focus-visible:ring-1 ${focusRingClass}`}>
                          <PaperclipIcon className="w-4 h-4" />
                        </button>
                        <input type="file" multiple style={{ display: 'none' }} />
                      </div>
                      <button type="button" aria-label="Dictation" className={`p-1.5 rounded-lg ${iconButtonHoverBgClass} ${inactiveSegmentTextClass} ${iconButtonHoverTextClass} focus-visible:ring-1 ${focusRingClass}`}>
                        <MicrophoneIcon className="w-4 h-4" />
                      </button>
                      <button 
                        type="button" 
                        aria-label="Submit URL" 
                        onClick={onSubmit}
                        className={`p-1.5 ml-2 rounded-lg text-white hover:opacity-80 focus-visible:ring-1 ${focusRingClass}
                                    ${buildColorClasses("bg", accentColor, darkAccentColor)} 
                                    ${buildColorClasses("text", selectionTextColor, darkSelectionTextColor)}`} // Reusing selection text for contrast
                      >
                        <VoiceIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </span>
          </div>
        </div>
      </div>
    );
  }
);

ThemedInputArea.displayName = "ThemedInputArea";
export default ThemedInputArea;

// EXAMPLE: tailwind.config.js considerations
// 
// This is just an example of what you might add to your tailwind.config.js:
//
// ```js
// module.exports = {
//   content: [
//     "./src/**/*.{js,jsx,ts,tsx}", // Ensure this path covers your components
//   ],
//   darkMode: 'class', // or 'media', depending on your dark mode strategy
//   theme: {
//     extend: {
//       // You might define specific named opacities or colors if frequently used.
//       // e.g. for scrollbar-thumb-idle, dark:scrollbar-thumb-idleDark if not standard
//       // colors: {
//       //   'super': '#yourSuperColor', // if 'super' was a custom color name
//       //   'superDark': '#yourSuperDarkColor',
//       // },
//       // If you use specific shades with opacity like accentColor-200/10, ensure
//       // accentColor-200 is defined or that Tailwind can generate it.
//       // For example, if accentColor is "sky-500", then "sky-200" should be a valid color.
//     },
//   },
//   plugins: [
//     // require('@tailwindcss/forms'), // Useful for form styling, including caret color.
//     // require('tailwind-scrollbar'), // If you use custom scrollbar utilities like scrollbar-thin
//   ],
//   // SAFELISTING:
//   // If you pass Tailwind color names like "blue-500" as props, and these exact class strings
//   // (e.g., "bg-blue-500", "text-red-600") are not literally present elsewhere in your scanned files,
//   // Tailwind's JIT compiler might purge them.
//   // To prevent this, you can safelist patterns or specific classes.
//   // However, using arbitrary values for hex codes (e.g., `bg-[#FF0000}]`) does NOT require safelisting for the hex value itself.
//   // Example safelisting (use cautiously to avoid large bundle sizes):
//   // safelist: [
//   //   {
//   //     pattern: /bg-(red|green|blue|sky|zinc|neutral)-(100|200|300|400|500|600|700|800|900)/,
//   //   },
//   //   {
//   //     pattern: /text-(red|green|blue|sky|zinc|neutral)-(100|200|300|400|500|600|700|800|900)/,
//   //   },
//   //   {
//   //     pattern: /border-(red|green|blue|sky|zinc|neutral)-(100|200|300|400|500|600|700|800|900)/,
//   //   },
//   //   // Add patterns for ring, caret, placeholder, selection etc. as needed
//   // ],
// };
// ```
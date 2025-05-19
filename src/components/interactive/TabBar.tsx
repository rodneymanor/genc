import React from 'react';
import { LucideIcon } from 'lucide-react';

// Interface for individual tab data
export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon | React.FC<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
}

// Interface for TabBar component props
export interface TabBarProps {
  /** Array of tab objects to display. */
  tabs: TabItem[];
  /** Callback function triggered when a tab is clicked. Receives the tab ID. */
  onTabClick: (tabId: string) => void;
  /** Accessibility label for the tab list. */
  ariaLabel?: string;

  // --- Styling Props ---

  /** Tailwind class for the overall background of the tab bar container `<ul>`. Default: "bg-transparent" */
  containerClassName?: string;

  /** Base Tailwind classes to apply to each tab button. */
  tabBaseClassName?: string;
  /** Additional Tailwind classes for each non-active, non-disabled tab button. */
  tabIdleClassName?: string;
  /** Additional Tailwind classes for a disabled tab button. */
  tabDisabledClassName?: string;

  // --- Color Props (accept Tailwind color names like "blue-500", full classes like "bg-blue-500", or hex codes like "#3B82F6") ---

  // Idle Tab State
  /** Background color for idle tabs. Default: "slate-100" */
  idleBackgroundColor?: string;
  /** Text color for idle tabs. Default: "slate-700" */
  idleTextColor?: string;
  /** Border color for idle tabs. Default: "slate-300" */
  idleBorderColor?: string;
  /** Icon color for idle tabs. Default: "slate-500" */
  idleIconColor?: string;

  // Hover Tab State
  /** Background color for hovered tabs. Default: "slate-200" */
  hoverBackgroundColor?: string;
  /** Text color for hovered tabs. Default: "slate-900" */
  hoverTextColor?: string;
  /** Border color for hovered tabs. Default: "slate-400" */
  hoverBorderColor?: string;
  /** Icon color for hovered tabs. Default: "slate-700" */
  hoverIconColor?: string;

  // Focus State
  /** Focus ring color (Tailwind color name like "sky-500" or hex). Default: "sky-500" */
  focusRingColor?: string;

  // --- Structural/Layout Props (optional, with sensible defaults) ---
  /** Padding for tab buttons. Default: "px-3 py-2" */
  tabPadding?: string;
  /** Border radius for tab buttons. Default: "rounded-lg" */
  tabRounded?: string;
  /** Font size for tab labels. Default: "text-sm" */
  tabFontSize?: string;
}

interface ColorOutput {
  className: string;
  style: React.CSSProperties;
}

/**
 * Helper function to generate Tailwind class and style for a color property.
 * @param value - The color value (Tailwind name, full class, or hex code).
 * @param twPrefix - The Tailwind prefix (e.g., "bg", "text", "border", "ring").
 * @param cssVarName - The CSS variable name to use for hex codes.
 * @param statePrefix - Optional state prefix like "hover:", "focus:".
 * @returns Object with className and style properties.
 */
const getColorConfig = (
  value: string | undefined,
  twPrefix: string,
  cssVarName: string,
  statePrefix: string = ''
): ColorOutput => {
  if (!value) return { className: '', style: {} };

  const fullTwPrefix = statePrefix + twPrefix;

  if (value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl")) {
    return {
      className: `${fullTwPrefix}-[var(${cssVarName})]`,
      style: { [cssVarName]: value } as React.CSSProperties,
    };
  } else {
    // Allows "blue-500" or "bg-blue-500" (or "hover:bg-blue-500" if statePrefix is passed correctly)
    if (value.startsWith(twPrefix + '-') || value.startsWith(statePrefix + twPrefix + '-')) {
      return { className: value.startsWith(statePrefix) ? value : statePrefix + value, style: {} };
    }
    return { className: `${fullTwPrefix}-${value}`, style: {} };
  }
};

/**
 * A reusable tab bar component with flexible theming.
 */
const TabBar: React.FC<TabBarProps> = ({
  tabs,
  onTabClick,
  ariaLabel = "Tab navigation",
  containerClassName = "flex flex-wrap justify-center w-full gap-2",

  // Base classes for all buttons
  tabBaseClassName = "inline-flex items-center justify-center relative shrink-0 select-none active:scale-[0.995] ease-in-out group will-change-transform transition-all line-clamp-1 overflow-hidden focus:outline-none",
  tabIdleClassName = "",
  tabDisabledClassName = "opacity-50 cursor-not-allowed pointer-events-none",

  // Default color props
  idleBackgroundColor = "slate-100",
  idleTextColor = "slate-700",
  idleBorderColor = "slate-300",
  idleIconColor = "slate-500",

  hoverBackgroundColor = "slate-200",
  hoverTextColor = "slate-900",
  hoverBorderColor = "slate-400",
  hoverIconColor = "slate-700",

  focusRingColor = "sky-500",

  // Default structural props
  tabPadding = "px-3 py-2",
  tabRounded = "rounded-lg",
  tabFontSize = "text-sm",
}) => {
  return (
    <ul
      className={containerClassName}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
    >
      {tabs.map((tab, index) => {
        const isDisabled = tab.disabled || false;

        let buttonClasses: string[] = [
          tabBaseClassName,
          tabPadding,
          tabRounded,
          tabFontSize,
          'border', // Base border class, color will be applied
        ];
        let buttonStyles: React.CSSProperties = {};

        // Determine current state colors
        const currentBg = idleBackgroundColor;
        const currentText = idleTextColor;
        const currentBorder = idleBorderColor;
        const currentIcon = idleIconColor;

        // --- Apply Idle/Active Colors ---
        const bgConfig = getColorConfig(currentBg, 'bg', `--tab-${tab.id}-bg-color`);
        buttonClasses.push(bgConfig.className);
        Object.assign(buttonStyles, bgConfig.style);

        const textConfig = getColorConfig(currentText, 'text', `--tab-${tab.id}-text-color`);
        buttonClasses.push(textConfig.className);
        Object.assign(buttonStyles, textConfig.style);

        const borderConfig = getColorConfig(currentBorder, 'border', `--tab-${tab.id}-border-color`);
        buttonClasses.push(borderConfig.className);
        Object.assign(buttonStyles, borderConfig.style);
        
        const iconColorVarName = `--tab-${tab.id}-icon-color`;
        const iconConfig = getColorConfig(currentIcon, 'text', iconColorVarName);

        // --- Apply Hover and Click Effects (only if not disabled) ---
        if (!isDisabled) {
          const hoverBgConfig = getColorConfig(hoverBackgroundColor, 'bg', `--tab-${tab.id}-hover-bg-color`, 'hover:');
          buttonClasses.push(hoverBgConfig.className);
          Object.assign(buttonStyles, hoverBgConfig.style);

          const hoverTextConfig = getColorConfig(hoverTextColor, 'text', `--tab-${tab.id}-hover-text-color`, 'hover:');
          buttonClasses.push(hoverTextConfig.className);
          Object.assign(buttonStyles, hoverTextConfig.style);

          const hoverBorderConfig = getColorConfig(hoverBorderColor, 'border', `--tab-${tab.id}-hover-border-color`, 'hover:');
          buttonClasses.push(hoverBorderConfig.className);
          Object.assign(buttonStyles, hoverBorderConfig.style);
          
          // ADDED: Unconditional hover elevation for non-disabled tabs
          buttonClasses.push("hover:-translate-y-px hover:shadow-md");

          // ADDED: Click elevation for non-disabled tabs (works with active:scale-[0.995] from base)
          buttonClasses.push("active:shadow-md");

          const ringConfig = getColorConfig(focusRingColor, 'ring', `--tab-focus-ring-color`);
          buttonClasses.push(`focus:ring-2 focus:ring-offset-2 ${ringConfig.className}`);
          Object.assign(buttonStyles, ringConfig.style);
        }

        // Add state-specific classes (active, disabled, or idle)
        if (isDisabled) {
          buttonClasses.push(tabDisabledClassName);
        } else {
          buttonClasses.push(tabIdleClassName);
        }

        const IconComponent = tab.icon;

        return (
          <li
            key={tab.id}
            className="inline-block"
            role="presentation"
            id={`category-tab-${index}`}
          >
            <button
              type="button"
              role="tab"
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => !isDisabled && onTabClick(tab.id)}
              className={buttonClasses.filter(Boolean).join(" ")}
              style={buttonStyles}
            >
              <div className="flex items-center gap-x-2">
                {IconComponent && (
                  <span className={`flex-shrink-0 ${iconConfig.className}`} style={iconConfig.style}>
                    <IconComponent size={20} aria-hidden="true" />
                  </span>
                )}
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {tab.label}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

// --- Example Usage ---
// const App: React.FC = () => {
//   const [activeTab, setActiveTab] = React.useState<string>('write');

//   const tabsData: TabItem[] = [
//     { id: 'write', label: 'Write', icon: Pencil },
//     { id: 'learn', label: 'Learn', icon: GraduationCap },
//     { id: 'code', label: 'Code', icon: Code, disabled: true },
//     { id: 'life', label: 'Life stuff', icon: Briefcase },
//     { id: 'claude', label: 'Claude's choice', icon: Lightbulb },
//   ];

//   return (
//     <div className="p-4 min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center">
//       <header className="my-8">
//         <h1 className="text-4xl font-bold text-center">React TabBar Component Demo</h1>
//       </header>

//       <section className="w-full max-w-2xl p-6 bg-slate-700 rounded-xl shadow-2xl mb-8">
//         <h2 className="text-2xl font-semibold mb-4 text-sky-400">Default Theme</h2>
//         <TabBar tabs={tabsData} activeTabId={activeTab} onTabClick={setActiveTab} />
//       </section>

//       <section className="w-full max-w-2xl p-6 bg-slate-700 rounded-xl shadow-2xl mb-8">
//         <h2 className="text-2xl font-semibold mb-4 text-emerald-400">Green Theme (Tailwind Names)</h2>
//         <TabBar
//           tabs={tabsData}
//           activeTabId={activeTab}
//           onTabClick={setActiveTab}
//           idleBackgroundColor="green-700"
//           idleTextColor="green-100"
//           idleBorderColor="green-500"
//           idleIconColor="green-300"
//           hoverBackgroundColor="green-600"
//           hoverTextColor="white"
//           hoverBorderColor="green-400"
//           activeBackgroundColor="green-100"
//           activeTextColor="green-800"
//           activeBorderColor="green-800"
//           activeIconColor="green-700"
//           focusRingColor="emerald-400"
//           tabRounded="rounded-full"
//           containerClassName="flex justify-start w-full gap-3 p-2 bg-green-800 rounded-lg"
//         />
//       </section>
      
//       <section className="w-full max-w-2xl p-6 bg-slate-700 rounded-xl shadow-2xl">
//         <h2 className="text-2xl font-semibold mb-4 text-purple-400">Custom Hex Theme</h2>
//         <TabBar
//           tabs={tabsData}
//           activeTabId={activeTab}
//           onTabClick={setActiveTab}
//           idleBackgroundColor="#4A5568" // gray-700
//           idleTextColor="#E2E8F0"       // gray-300
//           idleBorderColor="#718096"     // gray-500
//           idleIconColor="#A0AEC0"       // gray-400
//           hoverBackgroundColor="#2D3748" // gray-800
//           hoverTextColor="#F7FAFC"      // gray-100
//           activeBackgroundColor="#805AD5" // purple-600
//           activeTextColor="#FFFFFF"
//           activeBorderColor="#9F7AEA"   // purple-400
//           activeIconColor="#EDE9FE"     // purple-100
//           focusRingColor="#B794F4"      // purple-300
//           tabPadding="px-4 py-3"
//         />
//       </section>

//       <footer className="mt-12 text-center text-slate-400 text-sm">
//         <p>Tailwind CSS JIT compiler handles dynamic classes like `bg-[var(--custom-color)]` automatically.</p>
//         <p>Ensure your `tailwind.config.js` `content` path includes your component files.</p>
//         <p>No extensive `safelist` configuration is typically needed for this color approach.</p>
//       </footer>
//     </div>
//   );
// };

// export default App; // In a real app, you'd export TabBar and use App elsewhere.
                  // For this self-contained example, App is the main export.
export default TabBar; 
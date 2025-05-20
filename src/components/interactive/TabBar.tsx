import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  /** Tailwind class for the overall background of the tab bar container `<ul>`. Default: "flex flex-wrap justify-center w-full gap-2" */
  containerClassName?: string;

  // Color Props (accept Tailwind color names like "blue-500", full classes like "bg-blue-500", or hex codes like "#3B82F6")

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

/**
 * A reusable tab bar component with flexible theming using Shadcn UI Buttons.
 */
const TabBar: React.FC<TabBarProps> = ({
  tabs,
  onTabClick,
  ariaLabel = "Tab navigation",
  containerClassName = "flex flex-wrap justify-center w-full gap-2",

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
      {tabs.map((tab) => {
        const buttonClasses: string[] = [
          'group',
          'relative',
          'shrink-0',
          'select-none',
          'active:scale-[0.995]',
          'ease-in-out',
          'will-change-transform',
          'transition-all',
          'line-clamp-1',
          'overflow-hidden',
          tabPadding,
          tabRounded,
          tabFontSize,
        ];

        if (idleBackgroundColor) {
          if (idleBackgroundColor.startsWith("#") || idleBackgroundColor.startsWith("rgb") || idleBackgroundColor.startsWith("hsl")) {
            buttonClasses.push(`bg-[${idleBackgroundColor}]`);
          } else {
            buttonClasses.push(idleBackgroundColor.startsWith("bg-") ? idleBackgroundColor : `bg-${idleBackgroundColor}`);
          }
        }
        if (idleTextColor) {
          if (idleTextColor.startsWith("#") || idleTextColor.startsWith("rgb") || idleTextColor.startsWith("hsl")) {
            buttonClasses.push(`text-[${idleTextColor}]`);
          } else {
            buttonClasses.push(idleTextColor.startsWith("text-") ? idleTextColor : `text-${idleTextColor}`);
          }
        }
        if (idleBorderColor) {
          buttonClasses.push('border');
          if (idleBorderColor.startsWith("#") || idleBorderColor.startsWith("rgb") || idleBorderColor.startsWith("hsl")) {
            buttonClasses.push(`border-[${idleBorderColor}]`);
          } else {
            buttonClasses.push(idleBorderColor.startsWith("border-") ? idleBorderColor : `border-${idleBorderColor}`);
          }
        } else {
          buttonClasses.push('border border-transparent');
        }

        if (hoverBackgroundColor) {
          if (hoverBackgroundColor.startsWith("#") || hoverBackgroundColor.startsWith("rgb") || hoverBackgroundColor.startsWith("hsl")) {
            buttonClasses.push(`hover:bg-[${hoverBackgroundColor}]`);
          } else {
            buttonClasses.push(hoverBackgroundColor.startsWith("hover:bg-") ? hoverBackgroundColor : `hover:bg-${hoverBackgroundColor}`);
          }
        }
        if (hoverTextColor) {
          if (hoverTextColor.startsWith("#") || hoverTextColor.startsWith("rgb") || hoverTextColor.startsWith("hsl")) {
            buttonClasses.push(`hover:text-[${hoverTextColor}]`);
          } else {
            buttonClasses.push(hoverTextColor.startsWith("hover:text-") ? hoverTextColor : `hover:text-${hoverTextColor}`);
          }
        }
        if (hoverBorderColor) {
          buttonClasses.push('hover:border');
          if (hoverBorderColor.startsWith("#") || hoverBorderColor.startsWith("rgb") || hoverBorderColor.startsWith("hsl")) {
            buttonClasses.push(`hover:border-[${hoverBorderColor}]`);
          } else {
            buttonClasses.push(hoverBorderColor.startsWith("hover:border-") ? hoverBorderColor : `hover:border-${hoverBorderColor}`);
          }
        }
        
        if (focusRingColor) {
          if (focusRingColor.startsWith("#") || focusRingColor.startsWith("rgb") || focusRingColor.startsWith("hsl")) {
            buttonClasses.push(`focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[${focusRingColor}]`);
          } else {
            buttonClasses.push(`focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-${focusRingColor}`);
          }
        }

        const iconSpanClasses: string[] = ['flex-shrink-0'];
        if (idleIconColor) {
          if (idleIconColor.startsWith("#") || idleIconColor.startsWith("rgb") || idleIconColor.startsWith("hsl")) {
            iconSpanClasses.push(`text-[${idleIconColor}]`);
          } else {
            iconSpanClasses.push(idleIconColor.startsWith("text-") ? idleIconColor : `text-${idleIconColor}`);
          }
        }
        if (hoverIconColor) {
          if (hoverIconColor.startsWith("#") || hoverIconColor.startsWith("rgb") || hoverIconColor.startsWith("hsl")) {
            iconSpanClasses.push(`group-hover:text-[${hoverIconColor}]`);
          } else {
            iconSpanClasses.push(hoverIconColor.startsWith("group-hover:text-") ? hoverIconColor : `group-hover:text-${hoverIconColor}`);
          }
        }

        const IconComponent = tab.icon;

        return (
          <li
            key={tab.id}
            className="inline-block"
            role="presentation"
          >
            <Button
              type="button"
              variant="ghost"
              onClick={() => onTabClick(tab.id)}
              className={cn(buttonClasses)}
            >
              <div className="flex items-center gap-x-2">
                {IconComponent && (
                  <span className={cn(iconSpanClasses)}>
                    <IconComponent size={20} aria-hidden="true" />
                  </span>
                )}
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {tab.label}
                </span>
              </div>
            </Button>
          </li>
        );
      })}
    </ul>
  );
};

export default TabBar;

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
//         <p>Ensure your `tailwind.config.js` `content`
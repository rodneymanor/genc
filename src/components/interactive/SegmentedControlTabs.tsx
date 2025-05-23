"use client";

import { Search, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SegmentedControlTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  triggerBaseClasses?: string;
  // granular color props
  activeBgLight?: string;
  activeBgDark?: string;
  activeTextLight?: string;
  activeTextDark?: string;
  inactiveTextLight?: string;
  inactiveTextDark?: string;
}

export function SegmentedControlTabs({ 
  value, 
  onValueChange,
  triggerBaseClasses = "flex items-center gap-1 px-3 py-1.5", // Default base classes
  activeBgLight = "bg-white",
  activeBgDark = "bg-slate-950", // Default from original component
  activeTextLight = "text-blue-600",  // Default from original component
  activeTextDark = "text-blue-400",   // Default from original component
  inactiveTextLight = "text-neutral-600", // Sensible default
  inactiveTextDark = "text-neutral-400"   // Sensible default
}: SegmentedControlTabsProps) {

  const buildColorClass = (colorValue: string | undefined, prefix: string, isDark: boolean = false) => {
    if (!colorValue) return "";
    let finalPrefix = isDark ? `dark:${prefix}` : prefix;
    if (colorValue.startsWith("#") || colorValue.startsWith("rgb") || colorValue.startsWith("hsl")) {
      return `${finalPrefix}-[${colorValue}]`;
    }
    return `${finalPrefix}-${colorValue}`;
  };

  const activeStateClasses = `\
    ${buildColorClass(activeBgLight, "data-[state=active]:bg")} \
    ${buildColorClass(activeBgDark, "data-[state=active]:bg", true)} \
    ${buildColorClass(activeTextLight, "data-[state=active]:text")} \
    ${buildColorClass(activeTextDark, "data-[state=active]:text", true)}\
    data-[state=active]:border-super\
    data-[state=active]:shadow-super/30\
  `;

  const inactiveStateClasses = `\
    ${buildColorClass(inactiveTextLight, "text")} \
    ${buildColorClass(inactiveTextDark, "text", true)}\
  `;

  return (
    <Tabs value={value} onValueChange={onValueChange} className="w-fit">
      <TabsList className="bg-[#E0F7FF]/70 dark:bg-[#E0F7FF]/40 p-0.5">
        <TabsTrigger
          value="analyzer"
          className={`${triggerBaseClasses} ${inactiveStateClasses} ${activeStateClasses}`.trim().replace(/\s+/g, ' ')}
        >
          <Search className="h-4 w-4" />
          <span>Analyzer</span>
        </TabsTrigger>
        <TabsTrigger
          value="aiwriter"
          className={`${triggerBaseClasses} ${inactiveStateClasses} ${activeStateClasses}`.trim().replace(/\s+/g, ' ')}
        >
          <FileText className="h-4 w-4" />
          <span>AI Writer</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
} 
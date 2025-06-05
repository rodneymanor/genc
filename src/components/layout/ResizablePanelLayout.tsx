import React, { ReactNode } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

export interface PanelConfig {
  id: string;
  content: ReactNode;
  defaultSize: number;
  minSize: number;
  maxSize: number;
  collapsible?: boolean;
  className?: string;
  scrollable?: boolean; // Whether this panel should be scrollable
}

interface ResizablePanelLayoutProps {
  panels: PanelConfig[];
  direction?: "horizontal" | "vertical";
  className?: string;
  topContent?: ReactNode; // Content that appears above all panels (non-scrolling)
  bottomContent?: ReactNode; // Content that appears below all panels (non-scrolling)
}

export const ResizablePanelLayout: React.FC<ResizablePanelLayoutProps> = ({
  panels,
  direction = "horizontal",
  className,
  topContent,
  bottomContent
}) => {
  if (panels.length === 0) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">No panels configured</div>;
  }

  // Create a stable key based on panel configuration to only re-render when panels actually change
  const panelKey = panels.map(p => p.id).join('-');

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Top Content (non-scrolling, appears above panels) */}
      {topContent && (
        <div className="flex-shrink-0">
          {topContent}
        </div>
      )}

      {/* Panel Group */}
      <div className="flex-1 min-h-0"> {/* min-h-0 is crucial for flex children to shrink properly */}
        <ResizablePanelGroup 
          direction={direction} 
          className="h-full"
          key={panelKey} // Only re-render when panel configuration actually changes
        >
          {panels.map((panel, index) => (
            <React.Fragment key={panel.id}>
              {/* Add handle before each panel except the first */}
              {index > 0 && <ResizableHandle withHandle />}
              
              <ResizablePanel
                defaultSize={panel.defaultSize}
                minSize={panel.minSize}
                maxSize={panel.maxSize}
                collapsible={panel.collapsible}
                className={cn(
                  panel.scrollable !== false && "overflow-y-auto", // Default to scrollable unless explicitly disabled
                  panel.className
                )}
              >
                <div className={cn(
                  "h-full",
                  panel.scrollable !== false && "overflow-y-auto" // Inner container also scrollable by default
                )}>
                  {panel.content}
                </div>
              </ResizablePanel>
            </React.Fragment>
          ))}
        </ResizablePanelGroup>
      </div>

      {/* Bottom Content (non-scrolling, appears below panels) */}
      {bottomContent && (
        <div className="flex-shrink-0">
          {bottomContent}
        </div>
      )}
    </div>
  );
};

// Helper hook for managing panel configurations
export const usePanelConfig = () => {
  const createPanel = (
    id: string,
    content: ReactNode,
    size: { default: number; min: number; max: number },
    options: {
      collapsible?: boolean;
      className?: string;
      scrollable?: boolean;
    } = {}
  ): PanelConfig => ({
    id,
    content,
    defaultSize: size.default,
    minSize: size.min,
    maxSize: size.max,
    ...options
  });

  return { createPanel };
};

export default ResizablePanelLayout; 
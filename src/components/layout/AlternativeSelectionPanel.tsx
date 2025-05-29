'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Define a generic structure for script items for simplicity in this panel
// This might need to be more specific based on actual item structure (hook, factset, etc.)
interface ScriptItem {
  id?: string; // Assuming items might have IDs for stable keys
  title?: string;
  category?: string; // For factsets
  perspective?: string; // For takes
  lines?: string[];
  content?: string;
  // Add any other common fields that help display a preview
}

interface AlternativeSelectionPanelProps {
  categoryTitle: string;
  items: ScriptItem[];
  onSelectItem: (item: ScriptItem) => void;
  onClosePanel: () => void;
  className?: string;
}

const AlternativeSelectionPanel: React.FC<AlternativeSelectionPanelProps> = ({
  categoryTitle,
  items,
  onSelectItem,
  onClosePanel,
  className = "",
}) => {
  if (!items || items.length === 0) {
    return (
      <div className={`p-4 border-l bg-muted/30 h-full ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{categoryTitle} Alternatives</h3>
          <Button variant="ghost" size="icon" onClick={onClosePanel}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">No other alternatives available for this section.</p>
      </div>
    );
  }

  return (
    <div className={`p-4 border-l bg-muted/30 h-full flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h3 className="text-lg font-semibold">{categoryTitle} Alternatives</h3>
        <Button variant="ghost" size="icon" onClick={onClosePanel} aria-label="Close panel">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-grow overflow-y-auto space-y-3 pr-1">
        {items.map((item, index) => (
          <div
            key={item.id || `alt-${categoryTitle}-${index}`}
            className="p-3 bg-background rounded-md border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectItem(item)}
          >
            {item.title && <h4 className="text-sm font-semibold mb-1">{item.title}</h4>}
            {item.category && <h4 className="text-sm font-semibold mb-1">{item.category}</h4>} {/* For factsets */}
            {item.perspective && <h4 className="text-sm font-semibold mb-1">{item.perspective}</h4>} {/* For takes */}
            
            {item.lines && Array.isArray(item.lines) && (
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {item.lines.slice(0, 3).map((line, lineIdx) => (
                  <li key={lineIdx} className="truncate">• {line}</li>
                ))}
                {item.lines.length > 3 && <li className="text-xs text-muted-foreground">...</li>}
              </ul>
            )}
            {item.content && (
              <p className="text-xs text-muted-foreground truncate">
                {item.content.substring(0, 100)}{item.content.length > 100 && '...'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlternativeSelectionPanel; 
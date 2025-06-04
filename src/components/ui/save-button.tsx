"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveButtonProps {
  onSave: () => Promise<void>;
  disabled?: boolean;
  hasChanges?: boolean;
  children?: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  successDuration?: number;
}

export function SaveButton({ 
  onSave, 
  disabled = false, 
  hasChanges = true,
  children,
  className,
  size = "default",
  variant = "default",
  successDuration = 2000
}: SaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = async () => {
    if (isSaving || justSaved) return;
    
    setIsSaving(true);
    try {
      await onSave();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), successDuration);
    } catch (error) {
      // Error handling is expected to be done in the onSave function
      console.error('Save operation failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isDisabled = disabled || !hasChanges || isSaving || justSaved;

  return (
    <Button
      onClick={handleSave}
      disabled={isDisabled}
      size={size}
      variant={variant}
      className={cn(
        className,
        justSaved && "bg-green-600 hover:bg-green-600 text-white"
      )}
    >
      {isSaving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : justSaved ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Saved!
        </>
      ) : (
        children || (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </>
        )
      )}
    </Button>
  );
} 
'use client';

import { useEffect } from 'react';
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from '@/contexts/AuthContext';
import SettingsOverlay from "./SettingsOverlay";

export default function SettingsOverlayWrapper() {
  const { isSettingsOpen, settingsTab, closeSettings } = useSettings();
  const { currentUser } = useAuth();
  
  // Close settings overlay when user logs out
  useEffect(() => {
    if (!currentUser && isSettingsOpen) {
      closeSettings();
    }
  }, [currentUser, isSettingsOpen, closeSettings]);
  
  return (
    <SettingsOverlay 
      isOpen={isSettingsOpen}
      onClose={closeSettings}
      initialTab={settingsTab}
    />
  );
} 
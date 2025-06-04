'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TopBarContextType {
  title?: string;
  contextualButtons?: ReactNode;
  recordButton?: ReactNode;
  collapseButton?: ReactNode;
  setTitle: (title?: string) => void;
  setContextualButtons: (buttons?: ReactNode) => void;
  setRecordButton: (button?: ReactNode) => void;
  setCollapseButton: (button?: ReactNode) => void;
}

const TopBarContext = createContext<TopBarContextType | undefined>(undefined);

export const TopBarProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState<string | undefined>();
  const [contextualButtons, setContextualButtons] = useState<ReactNode>();
  const [recordButton, setRecordButton] = useState<ReactNode>();
  const [collapseButton, setCollapseButton] = useState<ReactNode>();

  return (
    <TopBarContext.Provider value={{
      title,
      contextualButtons,
      recordButton,
      collapseButton,
      setTitle,
      setContextualButtons,
      setRecordButton,
      setCollapseButton
    }}>
      {children}
    </TopBarContext.Provider>
  );
};

export const useTopBar = (): TopBarContextType => {
  const context = useContext(TopBarContext);
  if (!context) {
    throw new Error('useTopBar must be used within a TopBarProvider');
  }
  return context;
}; 
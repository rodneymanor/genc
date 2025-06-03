'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TopBarContextType {
  title?: string;
  contextualButtons?: ReactNode;
  setTitle: (title?: string) => void;
  setContextualButtons: (buttons?: ReactNode) => void;
}

const TopBarContext = createContext<TopBarContextType | undefined>(undefined);

export const TopBarProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState<string | undefined>();
  const [contextualButtons, setContextualButtons] = useState<ReactNode>();

  return (
    <TopBarContext.Provider value={{
      title,
      contextualButtons,
      setTitle,
      setContextualButtons
    }}>
      {children}
    </TopBarContext.Provider>
  );
};

export const useTopBar = (): TopBarContextType => {
  const context = useContext(TopBarContext);
  if (context === undefined) {
    throw new Error('useTopBar must be used within a TopBarProvider');
  }
  return context;
}; 
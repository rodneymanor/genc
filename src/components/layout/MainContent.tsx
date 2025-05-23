import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    // Simplified: takes up remaining space, allows internal scroll, no fixed left padding for now
    <div className="flex-1 overflow-y-auto relative flex flex-col">
      {/* Inner container for centering content, adjust as needed */}
      <div className="flex-1 flex justify-center pt-16">
        {children}
      </div>
    </div>
  );
};

export default MainContent; 
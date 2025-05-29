import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    // Apply padding, ensure it takes available width allowing children to center themselves.
    <div className="w-full p-4 md:p-6 flex-1 overflow-y-auto min-h-0">
      {children}
    </div>
  );
};

export default MainContent; 
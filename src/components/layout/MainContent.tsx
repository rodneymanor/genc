import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  return (
    <div className="flex-1 pl-[72px] overflow-y-auto h-screen flex flex-col">
      {/* 
        The pl-[72px] accounts for the narrow sidebar width.
        The wide sidebar will float over this content.
        h-screen ensures it takes full viewport height, allowing internal scrolling.
        flex flex-col makes it a column flex container which helps with content distribution.
      */}
      <div className="flex-1 flex justify-center pt-16">
        {children}
      </div>
    </div>
  );
};

export default MainContent; 
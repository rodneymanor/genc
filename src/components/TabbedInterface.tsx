import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type TabOrientation = 'horizontal' | 'vertical';

interface TabData {
  value: string;
  label: string | React.ReactNode;
  contentChildren: React.ReactNode;
}

interface TabbedInterfaceProps {
  tabsData: TabData[];
  defaultValue?: string;
  orientation?: TabOrientation;
  className?: string;
  onTabChange?: (value: string) => void;
}

const TabbedInterface: React.FC<TabbedInterfaceProps> = ({
  tabsData,
  defaultValue,
  orientation = 'horizontal',
  className,
  onTabChange,
}) => {
  // Use the first tab as default if no defaultValue is provided
  const effectiveDefaultValue = defaultValue || (tabsData.length > 0 ? tabsData[0].value : undefined);

  return (
    <Tabs
      defaultValue={effectiveDefaultValue}
      orientation={orientation}
      onValueChange={onTabChange}
      className={cn('w-full', className)}
    >
      <TabsList
        className={cn(
          orientation === 'vertical' 
            ? 'flex-col h-auto w-auto' 
            : 'grid w-full'
        )}
        style={
          orientation === 'horizontal' 
            ? { gridTemplateColumns: `repeat(${tabsData.length}, minmax(0, 1fr))` }
            : undefined
        }
      >
        {tabsData.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              orientation === 'vertical' && 'w-full justify-start'
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabsData.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className="mt-4"
        >
          {tab.contentChildren}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default TabbedInterface; 
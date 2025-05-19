'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';

interface CategoryPillProps {
  categoryName: string;
}

const CategoryPill: React.FC<CategoryPillProps> = ({ categoryName }) => {
  const { selectedCategory, setSelectedCategory, setSearchQuery } = useAppContext();
  const isSelected = selectedCategory === categoryName;

  const handleClick = () => {
    setSelectedCategory(isSelected ? null : categoryName);
    if (!isSelected) { // If we are selecting this category
      setSearchQuery(''); // Clear search query
    }
    // TODO: Trigger video filtering based on this category (handled by VideoRecommendationsGrid listening to context)
  };

  return (
    <Badge
      variant={isSelected ? 'default' : 'outline'}
      onClick={handleClick}
      className="cursor-pointer text-sm px-3 py-1.5 hover:bg-accent transition-colors"
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
    >
      {categoryName}
    </Badge>
  );
};

export default CategoryPill; 
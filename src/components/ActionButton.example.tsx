import React, { useState } from 'react';
import ActionButton from './ActionButton';
import { Heart, Download, Trash2 } from 'lucide-react';

const ActionButtonExample: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    console.log('Button clicked!');
  };

  const handleLoadingClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">ActionButton Examples</h1>
      
      {/* Basic Variants */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Variants</h2>
        <div className="flex flex-wrap gap-4">
          <ActionButton text="Primary Button" variant="primary" onClick={handleClick} />
          <ActionButton text="Secondary Button" variant="secondary" onClick={handleClick} />
          <ActionButton text="Destructive Button" variant="destructive" onClick={handleClick} />
          <ActionButton text="Outline Button" variant="outline" onClick={handleClick} />
          <ActionButton text="Ghost Button" variant="ghost" onClick={handleClick} />
          <ActionButton text="Link Button" variant="link" onClick={handleClick} />
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Sizes</h2>
        <div className="flex flex-wrap items-center gap-4">
          <ActionButton text="Small" size="sm" onClick={handleClick} />
          <ActionButton text="Default" size="default" onClick={handleClick} />
          <ActionButton text="Large" size="lg" onClick={handleClick} />
          <ActionButton size="icon" onClick={handleClick}>
            <Heart className="h-4 w-4" />
          </ActionButton>
        </div>
      </section>

      {/* With Icons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">With Icons</h2>
        <div className="flex flex-wrap gap-4">
          <ActionButton text="Download" variant="primary" onClick={handleClick}>
            <Download className="h-4 w-4" />
          </ActionButton>
          <ActionButton text="Delete" variant="destructive" onClick={handleClick}>
            <Trash2 className="h-4 w-4" />
          </ActionButton>
          <ActionButton text="Like" variant="outline" onClick={handleClick}>
            <Heart className="h-4 w-4" />
          </ActionButton>
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Loading States</h2>
        <div className="flex flex-wrap gap-4">
          <ActionButton 
            text="Click to Load" 
            variant="primary" 
            onClick={handleLoadingClick}
            isLoading={isLoading}
          />
          <ActionButton 
            text="Always Loading" 
            variant="secondary" 
            isLoading={true}
          />
        </div>
      </section>

      {/* Disabled States */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Disabled States</h2>
        <div className="flex flex-wrap gap-4">
          <ActionButton text="Disabled Primary" variant="primary" disabled />
          <ActionButton text="Disabled Secondary" variant="secondary" disabled />
          <ActionButton text="Disabled Outline" variant="outline" disabled />
        </div>
      </section>

      {/* Custom Styling */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Custom Styling</h2>
        <div className="flex flex-wrap gap-4">
          <ActionButton 
            text="Custom Classes" 
            variant="primary" 
            className="rounded-full px-8"
            onClick={handleClick}
          />
          <ActionButton 
            text="Shadow Effect" 
            variant="secondary" 
            className="shadow-lg hover:shadow-xl transition-shadow"
            onClick={handleClick}
          />
        </div>
      </section>
    </div>
  );
};

export default ActionButtonExample; 
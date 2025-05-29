import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SevenLawsGuidanceCard from './SevenLawsGuidanceCard';
import { Lightbulb, Target, Zap, Users, Heart, Shield, Star } from 'lucide-react';

const meta: Meta<typeof SevenLawsGuidanceCard> = {
  title: 'Components/SevenLawsGuidanceCard',
  component: SevenLawsGuidanceCard,
  tags: ['autodocs'],
  argTypes: {
    lawName: {
      control: 'text',
      description: 'The name of the Seven Law',
    },
    guidanceText: {
      control: 'text',
      description: 'The guidance text or content',
    },
    isVisible: {
      control: 'boolean',
      description: 'Controls card visibility',
    },
    onDismiss: {
      action: 'dismissed',
      description: 'Function called when dismiss button is clicked',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof SevenLawsGuidanceCard>;

export const Default: Story = {
  args: {
    lawName: 'Hook',
    guidanceText: 'Capture attention immediately with a compelling opening that makes your audience want to continue.',
    isVisible: true,
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithDismissButton: Story = {
  args: {
    lawName: 'Bridge',
    guidanceText: 'Connect your hook to the main content by establishing relevance and building a logical flow that keeps your audience engaged.',
    isVisible: true,
    onDismiss: () => alert('Card dismissed!'),
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
};

export const LongContent: Story = {
  args: {
    lawName: 'Reveal',
    guidanceText: 'Unveil your main message, product, or solution in a way that feels natural and valuable to your audience. This should be a gradual process that builds anticipation and delivers on the promise made in your hook. Make sure to show rather than just tell, use concrete examples, and demonstrate clear value that resonates with your target audience.',
    isVisible: true,
    onDismiss: () => alert('Long content card dismissed!'),
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
};

export const CustomStyling: Story = {
  args: {
    lawName: 'Reward',
    guidanceText: 'Provide clear benefits and value that motivate action and make your audience feel good about their decision.',
    isVisible: true,
    className: 'border-green-200 bg-green-50 border-l-green-500',
    onDismiss: () => alert('Custom styled card dismissed!'),
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
};

export const RichContent: Story = {
  args: {
    lawName: 'Roadmap',
    guidanceText: (
      <div className="space-y-3">
        <p>Outline clear next steps and provide a path forward that makes it easy for your audience to take action.</p>
        <div className="flex items-center gap-2 text-xs text-blue-600">
          <Target className="h-3 w-3" />
          <span>Tip: Use numbered steps or bullet points</span>
        </div>
        <ul className="text-sm space-y-1 ml-4">
          <li>• Step 1: Define the immediate action</li>
          <li>• Step 2: Remove friction and barriers</li>
          <li>• Step 3: Provide clear instructions</li>
        </ul>
      </div>
    ),
    isVisible: true,
    onDismiss: () => alert('Rich content card dismissed!'),
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
};

export const AllSevenLaws: Story = {
  render: () => {
    const [visibleCards, setVisibleCards] = useState<Record<string, boolean>>({
      hook: true,
      bridge: true,
      reveal: true,
      reframe: true,
      reward: true,
      roadmap: true,
      reason: true,
    });

    const handleDismiss = (cardKey: string) => {
      setVisibleCards(prev => ({ ...prev, [cardKey]: false }));
    };

    const sevenLawsData = [
      {
        key: 'hook',
        lawName: 'Hook',
        guidanceText: (
          <div className="space-y-2">
            <p>Capture attention immediately with a compelling opening that makes your audience want to continue.</p>
            <div className="flex items-center gap-2 text-xs text-primary">
              <Zap className="h-3 w-3" />
              <span>Tip: Use questions, surprising facts, or bold statements</span>
            </div>
          </div>
        ),
      },
      {
        key: 'bridge',
        lawName: 'Bridge',
        guidanceText: 'Connect your hook to the main content by establishing relevance and building a logical flow that keeps your audience engaged.',
      },
      {
        key: 'reveal',
        lawName: 'Reveal',
        guidanceText: (
          <div className="space-y-2">
            <p>Unveil your main message, product, or solution in a way that feels natural and valuable.</p>
            <ul className="text-xs space-y-1 ml-4">
              <li>• Show, don&apos;t just tell</li>
              <li>• Use concrete examples</li>
              <li>• Demonstrate clear value</li>
            </ul>
          </div>
        ),
      },
      {
        key: 'reframe',
        lawName: 'Reframe',
        guidanceText: 'Shift perspective by addressing objections, changing viewpoints, or presenting information in a new light that resonates with your audience.',
      },
      {
        key: 'reward',
        lawName: 'Reward',
        guidanceText: (
          <div className="space-y-2">
            <p>Provide clear benefits and value that motivate action and make your audience feel good about their decision.</p>
            <div className="flex items-center gap-2 text-xs text-green-600">
              <Heart className="h-3 w-3" />
              <span>Focus on emotional and practical benefits</span>
            </div>
          </div>
        ),
      },
      {
        key: 'roadmap',
        lawName: 'Roadmap',
        guidanceText: 'Outline clear next steps and provide a path forward that makes it easy for your audience to take action.',
      },
      {
        key: 'reason',
        lawName: 'Reason',
        guidanceText: (
          <div className="space-y-2">
            <p>Give compelling reasons why your audience should act now rather than later.</p>
            <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs">
              <strong>Urgency factors:</strong> Limited time, scarcity, exclusive access, or immediate benefits
            </div>
          </div>
        ),
      },
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
        {sevenLawsData.map((law) => (
          <SevenLawsGuidanceCard
            key={law.key}
            lawName={law.lawName}
            guidanceText={law.guidanceText}
            isVisible={visibleCards[law.key]}
            onDismiss={() => handleDismiss(law.key)}
          />
        ))}
      </div>
    );
  },
};

export const HiddenCard: Story = {
  args: {
    lawName: 'Hidden Law',
    guidanceText: 'This card should not be visible because isVisible is false.',
    isVisible: false,
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '500px' }}>
        <Story />
        <p className="mt-4 text-muted-foreground text-sm">
          The card above should be hidden (isVisible = false)
        </p>
      </div>
    ),
  ],
};

export const NoGuidanceText: Story = {
  args: {
    lawName: 'Empty',
    guidanceText: '',
    isVisible: true,
    onDismiss: () => alert('Empty card dismissed!'),
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '500px' }}>
        <Story />
      </div>
    ),
  ],
};

export const InteractiveExample: Story = {
  render: () => {
    const [isVisible, setIsVisible] = useState(true);
    const [dismissCount, setDismissCount] = useState(0);

    const handleDismiss = () => {
      setIsVisible(false);
      setDismissCount(prev => prev + 1);
    };

    const handleReset = () => {
      setIsVisible(true);
    };

    return (
      <div className="space-y-4" style={{ width: '500px' }}>
        <SevenLawsGuidanceCard
          lawName="Interactive Demo"
          guidanceText={
            <div className="space-y-2">
              <p>This is an interactive demonstration of the dismiss functionality.</p>
              <p className="text-xs text-muted-foreground">
                Dismissed {dismissCount} time{dismissCount !== 1 ? 's' : ''}
              </p>
            </div>
          }
          isVisible={isVisible}
          onDismiss={handleDismiss}
        />
        
        {!isVisible && (
          <div className="p-4 border border-dashed rounded-lg text-center">
            <p className="text-muted-foreground mb-2">Card has been dismissed</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Show Card Again
            </button>
          </div>
        )}
      </div>
    );
  },
}; 
import React, { useState } from 'react';
import SevenLawsGuidanceCard from './SevenLawsGuidanceCard';
import ActionButton from './ActionButton';
import { Lightbulb, Target, Zap, Users, Heart, Shield, Star } from 'lucide-react';

const SevenLawsGuidanceCardExample: React.FC = () => {
  const [visibleCards, setVisibleCards] = useState<Record<string, boolean>>({
    hook: true,
    bridge: true,
    reveal: true,
    reframe: true,
    reward: true,
    roadmap: true,
    reason: true,
  });

  const [showAllCards, setShowAllCards] = useState(true);

  const handleDismiss = (cardKey: string) => {
    setVisibleCards(prev => ({ ...prev, [cardKey]: false }));
  };

  const resetAllCards = () => {
    setVisibleCards({
      hook: true,
      bridge: true,
      reveal: true,
      reframe: true,
      reward: true,
      roadmap: true,
      reason: true,
    });
  };

  const toggleAllCards = () => {
    setShowAllCards(!showAllCards);
  };

  // Seven Laws data with rich content
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
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold mb-2">Seven Laws Guidance Cards</h1>
        <p className="text-muted-foreground">
          Interactive guidance cards for the Seven Laws framework with dismissible functionality
        </p>
        
        <div className="flex justify-center gap-4">
          <ActionButton
            text={showAllCards ? "Hide All Cards" : "Show All Cards"}
            onClick={toggleAllCards}
            variant="outline"
          />
          <ActionButton
            text="Reset Dismissed Cards"
            onClick={resetAllCards}
            variant="secondary"
          />
        </div>
      </div>

      {/* Basic Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Basic Usage Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SevenLawsGuidanceCard
            lawName="Simple Example"
            guidanceText="This is a basic guidance card with just text content and no dismiss functionality."
          />
          
          <SevenLawsGuidanceCard
            lawName="With Dismiss"
            guidanceText="This card includes a dismiss button in the top-right corner."
            onDismiss={() => console.log('Card dismissed')}
          />
        </div>
      </section>

      {/* Seven Laws Framework */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Seven Laws Framework</h2>
        <p className="text-muted-foreground">
          Complete set of guidance cards for the Seven Laws framework. Try dismissing cards and then resetting them.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sevenLawsData.map((law) => (
            <SevenLawsGuidanceCard
              key={law.key}
              lawName={law.lawName}
              guidanceText={law.guidanceText}
              isVisible={showAllCards && visibleCards[law.key]}
              onDismiss={() => handleDismiss(law.key)}
            />
          ))}
        </div>
      </section>

      {/* Custom Styled Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Custom Styling Examples</h2>
        
        <div className="space-y-4">
          <SevenLawsGuidanceCard
            lawName="Success Theme"
            guidanceText="This card uses custom styling with a success theme and larger size."
            className="border-green-200 bg-green-50 border-l-green-500"
          />
          
          <SevenLawsGuidanceCard
            lawName="Warning Theme"
            guidanceText="Important guidance that requires immediate attention with warning styling."
            className="border-amber-200 bg-amber-50 border-l-amber-500"
            onDismiss={() => console.log('Warning dismissed')}
          />
          
          <SevenLawsGuidanceCard
            lawName="Compact Card"
            guidanceText="A more compact version with reduced padding."
            className="shadow-sm"
          />
        </div>
      </section>

      {/* Rich Content Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Rich Content Examples</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SevenLawsGuidanceCard
            lawName="Interactive Content"
            guidanceText={
              <div className="space-y-3">
                <p>This card contains interactive elements and rich formatting.</p>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">Pro tip included!</span>
                </div>
                <ActionButton
                  text="Learn More"
                  size="sm"
                  variant="outline"
                  onClick={() => alert('Learn more clicked!')}
                />
              </div>
            }
            onDismiss={() => console.log('Interactive card dismissed')}
          />
          
          <SevenLawsGuidanceCard
            lawName="Checklist Format"
            guidanceText={
              <div className="space-y-2">
                <p className="font-medium">Key elements to include:</p>
                <div className="space-y-1 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Clear value proposition</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Compelling call-to-action</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span>Social proof elements</span>
                  </label>
                </div>
              </div>
            }
          />
        </div>
      </section>

      {/* Use Case Examples */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Real-World Use Cases</h2>
        
        <div className="space-y-4">
          {/* Content Creation Guidance */}
          <SevenLawsGuidanceCard
            lawName="Content Creation"
            guidanceText={
              <div className="space-y-2">
                <p>When creating content, remember to:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-blue-500" />
                    <span>Define your target audience</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-green-500" />
                    <span>Consider user intent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span>Focus on quality</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-purple-500" />
                    <span>Build trust</span>
                  </div>
                </div>
              </div>
            }
            onDismiss={() => console.log('Content guidance dismissed')}
          />

          {/* Marketing Campaign Guidance */}
          <SevenLawsGuidanceCard
            lawName="Marketing Campaign"
            guidanceText={
              <div className="space-y-3">
                <p>Essential elements for your marketing campaign:</p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded border">
                  <div className="text-sm space-y-1">
                    <div><strong>Hook:</strong> Attention-grabbing headline</div>
                    <div><strong>Bridge:</strong> Connect to audience needs</div>
                    <div><strong>Reveal:</strong> Show your solution</div>
                    <div><strong>Reward:</strong> Highlight benefits</div>
                  </div>
                </div>
              </div>
            }
            className="border-purple-200 bg-purple-50 border-l-purple-500"
          />
        </div>
      </section>

      {/* Status Display */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-medium mb-2">Card Visibility Status:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {Object.entries(visibleCards).map(([key, visible]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${visible ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="capitalize">{key}: {visible ? 'Visible' : 'Hidden'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SevenLawsGuidanceCardExample; 
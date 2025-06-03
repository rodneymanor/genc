import React from 'react';
import GhostwriterCard from './GhostwriterCard';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

const mockGhostwriterData = [
  {
    authorName: 'rodneyai_',
    authorHandle: 'rodneyai_',
    authorAvatar: 'https://via.placeholder.com/40', // Replace with actual avatar path or remove
    hook: 'Create videos faster with AI:',
    goldenNugget: '- Generate content ideas\n- Write scripts\n- Generate video hooks\n- Structure your content\n\nAll in one tool.',
    likes: 598,
    comments: 155,
    shares: 197,
  },
  {
    authorName: 'rodneyai_',
    authorHandle: 'rodneyai_',
    authorAvatar: 'https://via.placeholder.com/40',
    hook: 'AI is not there to take your job.',
    goldenNugget: 'AI is there to take the jobs you don\'t want.\n\nUse it or get left behind.',
    likes: 291,
    comments: 150,
    shares: 183,
  },
  {
    authorName: 'rodneyai_',
    authorHandle: 'rodneyai_',
    authorAvatar: 'https://via.placeholder.com/40',
    hook: 'AI can help you:',
    goldenNugget: '- find the most recent topics\n- get the right hooks\n- create a content structure\n- never run out of content ideas\n\nBut it can\'t make you execute.',
    likes: 249,
    comments: 166,
    shares: 147,
  },
  {
    authorName: 'rodneyai_',
    authorHandle: 'rodneyai_',
    authorAvatar: 'https://via.placeholder.com/40',
    hook: 'AI is the future.',
    goldenNugget: 'Embrace it to stay ahead.',
  },
  {
    authorName: 'rodneyai_',
    authorHandle: 'rodneyai_',
    authorAvatar: 'https://via.placeholder.com/40',
    hook: 'AI will never replace human creativity.',
    goldenNugget: 'It will only augment it.',
  },
  {
    authorName: 'rodneyai_',
    authorHandle: 'rodneyai_',
    authorAvatar: 'https://via.placeholder.com/40',
    hook: 'It\'s 2025 and you can\'t find content inspiration?',
    goldenNugget: 'Let AI be your muse.',
  },
];

const GhostwriterSection = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-card border-none shadow-none">
        <CardContent className="p-6">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
            {mockGhostwriterData.map((item, index) => (
              <GhostwriterCard key={index} {...item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GhostwriterSection; 
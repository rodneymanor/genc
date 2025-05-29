import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CuratedVideoDisplayCard from './CuratedVideoDisplayCard';

const meta: Meta<typeof CuratedVideoDisplayCard> = {
  title: 'Components/CuratedVideoDisplayCard',
  component: CuratedVideoDisplayCard,
  tags: ['autodocs'],
  argTypes: {
    videoThumbnailUrl: {
      control: 'text',
      description: 'URL for the video thumbnail image',
    },
    videoTitle: {
      control: 'text',
      description: 'The title of the video',
    },
    videoDescription: {
      control: 'text',
      description: 'A short description or key takeaway of the video',
    },
    onClick: {
      action: 'clicked',
      description: 'Function to call when the card is clicked',
    },
    className: {
      control: 'text',
      description: 'Additional Tailwind classes for the Card root',
    },
  },
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof CuratedVideoDisplayCard>;

const defaultArgs = {
  videoThumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=450&fit=crop&q=80',
  videoTitle: 'Complete Guide to React Hooks',
  videoDescription: 'Learn everything about React Hooks including useState, useEffect, useContext, and custom hooks. Perfect for beginners and intermediate developers.',
  onClick: () => alert('Card Clicked!'),
};

export const Default: Story = {
  args: {
    ...defaultArgs,
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '360px' }}>
        <Story />
      </div>
    ),
  ],
};

export const ShortTitleAndDescription: Story = {
  args: {
    ...defaultArgs,
    videoTitle: 'React Hooks',
    videoDescription: 'A quick guide to React Hooks.',
  },
  decorators: [(Story: React.ComponentType) => <div style={{ width: '360px' }}><Story /></div>],
};

export const LongTitleAndDescription: Story = {
  args: {
    ...defaultArgs,
    videoTitle: 'Comprehensive Deep Dive into Advanced React Hooks Patterns and Performance Optimizations for Large Scale Applications',
    videoDescription: 'This video provides an exhaustive exploration of advanced React Hooks, including custom hook creation, performance optimization techniques, state management strategies, context API usage with hooks, and best practices for building scalable and maintainable applications. We cover real-world examples and tackle common pitfalls developers encounter when working with complex React applications.',
  },
  decorators: [(Story: React.ComponentType) => <div style={{ width: '360px' }}><Story /></div>],
};

export const CustomClassName: Story = {
  args: {
    ...defaultArgs,
    className: 'border-2 border-primary bg-primary/5 shadow-xl transform scale-95',
  },
  decorators: [(Story: React.ComponentType) => <div style={{ width: '360px' }}><Story /></div>],
};

export const NoDescription: Story = {
  args: {
    ...defaultArgs,
    videoDescription: '',
  },
  decorators: [(Story: React.ComponentType) => <div style={{ width: '360px' }}><Story /></div>],
};

export const MissingThumbnail: Story = {
  args: {
    ...defaultArgs,
    // Intentionally use a broken or placeholder URL to simulate missing image
    videoThumbnailUrl: 'https://example.com/nonexistent.jpg',
    videoTitle: 'Video with Missing Thumbnail',
  },
  decorators: [(Story: React.ComponentType) => <div style={{ width: '360px' }}><Story /></div>],
};

// Example of using it in a gallery layout
export const GalleryView: Story = {
  render: (args: typeof defaultArgs) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4 max-w-5xl">
      <CuratedVideoDisplayCard {...args} videoTitle="React Basics" videoDescription="Learn the fundamentals of React." />
      <CuratedVideoDisplayCard {...args} videoThumbnailUrl="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=450&fit=crop&q=80" videoTitle="Tailwind CSS Magic" videoDescription="Master Tailwind CSS utilities." />
      <CuratedVideoDisplayCard {...args} videoThumbnailUrl="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=450&fit=crop&q=80" videoTitle="TypeScript Power" videoDescription="Unlock TypeScript's potential." />
    </div>
  ),
  args: {
    ...defaultArgs,
  },
}; 
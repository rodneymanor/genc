import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ActionButton from './ActionButton';
import { Download, Save, Trash2, Edit, Plus, Settings } from 'lucide-react';

const meta: Meta<typeof ActionButton> = {
  title: 'Components/ActionButton',
  component: ActionButton,
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: 'Button text content',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
      description: 'Button variant style',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the button is in loading state',
    },
    onClick: {
      action: 'clicked',
      description: 'Function called when button is clicked',
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

type Story = StoryObj<typeof ActionButton>;

export const Primary: Story = {
  args: {
    text: 'Primary Button',
    variant: 'primary',
    size: 'default',
    disabled: false,
    isLoading: false,
  },
};

export const Secondary: Story = {
  args: {
    text: 'Secondary Button',
    variant: 'secondary',
    size: 'default',
    disabled: false,
    isLoading: false,
  },
};

export const Destructive: Story = {
  args: {
    text: 'Delete Item',
    variant: 'destructive',
    size: 'default',
    disabled: false,
    isLoading: false,
  },
};

export const Outline: Story = {
  args: {
    text: 'Outline Button',
    variant: 'outline',
    size: 'default',
    disabled: false,
    isLoading: false,
  },
};

export const Ghost: Story = {
  args: {
    text: 'Ghost Button',
    variant: 'ghost',
    size: 'default',
    disabled: false,
    isLoading: false,
  },
};

export const Link: Story = {
  args: {
    text: 'Link Button',
    variant: 'link',
    size: 'default',
    disabled: false,
    isLoading: false,
  },
};

export const Disabled: Story = {
  args: {
    text: 'Disabled Button',
    variant: 'primary',
    size: 'default',
    disabled: true,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    text: 'Loading...',
    variant: 'primary',
    size: 'default',
    disabled: false,
    isLoading: true,
  },
};

export const SmallSize: Story = {
  args: {
    text: 'Small Button',
    variant: 'primary',
    size: 'sm',
    disabled: false,
    isLoading: false,
  },
};

export const LargeSize: Story = {
  args: {
    text: 'Large Button',
    variant: 'primary',
    size: 'lg',
    disabled: false,
    isLoading: false,
  },
};

export const IconSize: Story = {
  args: {
    variant: 'primary',
    size: 'icon',
    disabled: false,
    isLoading: false,
    children: <Plus className="h-4 w-4" />,
  },
};

export const WithIcon: Story = {
  args: {
    text: 'Download',
    variant: 'primary',
    size: 'default',
    disabled: false,
    isLoading: false,
    children: <Download className="mr-2 h-4 w-4" />,
  },
};

export const WithIconRight: Story = {
  args: {
    text: 'Settings',
    variant: 'outline',
    size: 'default',
    disabled: false,
    isLoading: false,
    children: <Settings className="ml-2 h-4 w-4" />,
  },
};

export const LoadingWithIcon: Story = {
  args: {
    text: 'Saving...',
    variant: 'primary',
    size: 'default',
    disabled: false,
    isLoading: true,
    children: <Save className="mr-2 h-4 w-4" />,
  },
};

export const CustomStyling: Story = {
  args: {
    text: 'Custom Styled',
    variant: 'primary',
    size: 'default',
    disabled: false,
    isLoading: false,
    className: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0',
  },
};

// Showcase all variants in one story
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <ActionButton text="Primary" variant="primary" />
      <ActionButton text="Secondary" variant="secondary" />
      <ActionButton text="Destructive" variant="destructive" />
      <ActionButton text="Outline" variant="outline" />
      <ActionButton text="Ghost" variant="ghost" />
      <ActionButton text="Link" variant="link" />
    </div>
  ),
};

// Showcase all sizes
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <ActionButton text="Small" variant="primary" size="sm" />
      <ActionButton text="Default" variant="primary" size="default" />
      <ActionButton text="Large" variant="primary" size="lg" />
      <ActionButton variant="primary" size="icon">
        <Plus className="h-4 w-4" />
      </ActionButton>
    </div>
  ),
};

// Showcase different states
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <ActionButton text="Normal" variant="primary" />
      <ActionButton text="Disabled" variant="primary" disabled />
      <ActionButton text="Loading" variant="primary" isLoading />
      <ActionButton text="Loading Disabled" variant="primary" isLoading disabled />
    </div>
  ),
};

// Real-world examples
export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Form Actions</h3>
        <div className="flex gap-2">
          <ActionButton text="Save" variant="primary">
            <Save className="mr-2 h-4 w-4" />
          </ActionButton>
          <ActionButton text="Cancel" variant="outline" />
          <ActionButton text="Delete" variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
          </ActionButton>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Toolbar Actions</h3>
        <div className="flex gap-1">
          <ActionButton variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </ActionButton>
          <ActionButton variant="ghost" size="icon">
            <Download className="h-4 w-4" />
          </ActionButton>
          <ActionButton variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </ActionButton>
          <ActionButton variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </ActionButton>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Call-to-Action</h3>
        <div className="flex gap-2">
          <ActionButton text="Get Started" variant="primary" size="lg" />
          <ActionButton text="Learn More" variant="outline" size="lg" />
        </div>
      </div>
    </div>
  ),
}; 
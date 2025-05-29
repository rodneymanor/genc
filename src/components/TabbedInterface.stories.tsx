import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TabbedInterface from './TabbedInterface';
import { Settings, User, Bell, Shield, Database, FileText } from 'lucide-react';

const meta: Meta<typeof TabbedInterface> = {
  title: 'Components/TabbedInterface',
  component: TabbedInterface,
  tags: ['autodocs'],
  argTypes: {
    tabsData: {
      control: 'object',
      description: 'Array of tab objects with value, label, and contentChildren',
    },
    defaultValue: {
      control: 'text',
      description: 'Default active tab value',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Tab orientation',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    onTabChange: {
      action: 'tab-changed',
      description: 'Callback when tab changes',
    },
  },
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof TabbedInterface>;

const basicTabsData = [
  {
    value: 'overview',
    label: 'Overview',
    contentChildren: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dashboard Overview</h3>
        <p className="text-muted-foreground">
          Welcome to your dashboard. Here you can see an overview of your account activity and key metrics.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium">Total Users</h4>
            <p className="text-2xl font-bold text-primary">1,234</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium">Revenue</h4>
            <p className="text-2xl font-bold text-green-600">$12,345</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    value: 'analytics',
    label: 'Analytics',
    contentChildren: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
        <p className="text-muted-foreground">
          View detailed analytics and performance metrics for your application.
        </p>
        <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">Chart placeholder</p>
        </div>
      </div>
    ),
  },
  {
    value: 'settings',
    label: 'Settings',
    contentChildren: (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Account Settings</h3>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Email</label>
          <input type="email" className="w-full p-2 border rounded" placeholder="user@example.com" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Name</label>
          <input type="text" className="w-full p-2 border rounded" placeholder="John Doe" />
        </div>
      </div>
    ),
  },
];

export const Default: Story = {
  args: {
    tabsData: basicTabsData,
    defaultValue: 'overview',
    orientation: 'horizontal',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '600px', height: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export const VerticalOrientation: Story = {
  args: {
    tabsData: basicTabsData,
    defaultValue: 'overview',
    orientation: 'vertical',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '700px', height: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithIcons: Story = {
  args: {
    tabsData: [
      {
        value: 'profile',
        label: (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </div>
        ),
        contentChildren: (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Profile</h3>
            <p>Manage your personal information and preferences.</p>
          </div>
        ),
      },
      {
        value: 'notifications',
        label: (
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </div>
        ),
        contentChildren: (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notification Settings</h3>
            <p>Configure how you receive notifications.</p>
          </div>
        ),
      },
      {
        value: 'security',
        label: (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </div>
        ),
        contentChildren: (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Security Settings</h3>
            <p>Manage your account security and privacy settings.</p>
          </div>
        ),
      },
    ],
    defaultValue: 'profile',
    orientation: 'horizontal',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '600px', height: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const ManyTabs: Story = {
  args: {
    tabsData: [
      { value: 'tab1', label: 'Dashboard', contentChildren: <div className="p-4">Dashboard content</div> },
      { value: 'tab2', label: 'Users', contentChildren: <div className="p-4">Users management</div> },
      { value: 'tab3', label: 'Products', contentChildren: <div className="p-4">Products catalog</div> },
      { value: 'tab4', label: 'Orders', contentChildren: <div className="p-4">Orders history</div> },
      { value: 'tab5', label: 'Analytics', contentChildren: <div className="p-4">Analytics dashboard</div> },
      { value: 'tab6', label: 'Reports', contentChildren: <div className="p-4">Reports section</div> },
      { value: 'tab7', label: 'Settings', contentChildren: <div className="p-4">Application settings</div> },
    ],
    defaultValue: 'tab1',
    orientation: 'horizontal',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '800px', height: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const CustomStyling: Story = {
  args: {
    tabsData: basicTabsData,
    defaultValue: 'overview',
    orientation: 'horizontal',
    className: 'border-2 border-primary rounded-lg p-4 bg-primary/5',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '600px', height: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export const MinimalContent: Story = {
  args: {
    tabsData: [
      { value: 'tab1', label: 'Tab 1', contentChildren: <p>Simple content for tab 1</p> },
      { value: 'tab2', label: 'Tab 2', contentChildren: <p>Simple content for tab 2</p> },
      { value: 'tab3', label: 'Tab 3', contentChildren: <p>Simple content for tab 3</p> },
    ],
    defaultValue: 'tab1',
    orientation: 'horizontal',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '400px', height: '200px' }}>
        <Story />
      </div>
    ),
  ],
};

export const FormTabs: Story = {
  args: {
    tabsData: [
      {
        value: 'personal',
        label: 'Personal Info',
        contentChildren: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input type="text" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input type="text" className="w-full p-2 border rounded" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="w-full p-2 border rounded" />
            </div>
          </div>
        ),
      },
      {
        value: 'address',
        label: 'Address',
        contentChildren: (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <input type="text" className="w-full p-2 border rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input type="text" className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ZIP Code</label>
                <input type="text" className="w-full p-2 border rounded" />
              </div>
            </div>
          </div>
        ),
      },
      {
        value: 'preferences',
        label: 'Preferences',
        contentChildren: (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="newsletter" />
              <label htmlFor="newsletter">Subscribe to newsletter</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="notifications" />
              <label htmlFor="notifications">Enable notifications</label>
            </div>
          </div>
        ),
      },
    ],
    defaultValue: 'personal',
    orientation: 'horizontal',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '600px', height: '350px' }}>
        <Story />
      </div>
    ),
  ],
}; 
import React, { useState } from 'react';
import TabbedInterface from './TabbedInterface';
import ActionButton from './ActionButton';
import InputGroup from './InputGroup';
import LoadingIndicator from './LoadingIndicator';
import { User, Settings, Bell, Shield, CreditCard, FileText } from 'lucide-react';

const TabbedInterfaceExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    console.log('Active tab changed to:', value);
  };

  // Basic tabs data
  const basicTabsData = [
    {
      value: 'overview',
      label: 'Overview',
      contentChildren: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Welcome to the Overview</h3>
          <p className="text-muted-foreground">
            This is the overview tab content. Here you can see a summary of all your activities
            and important information at a glance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Total Users</h4>
              <p className="text-2xl font-bold text-primary">1,234</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Active Sessions</h4>
              <p className="text-2xl font-bold text-primary">89</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Revenue</h4>
              <p className="text-2xl font-bold text-primary">$12,345</p>
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
            View detailed analytics and insights about your application performance.
          </p>
          <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Chart placeholder</p>
              <p className="text-sm text-muted-foreground">Analytics visualization would go here</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      value: 'reports',
      label: 'Reports',
      contentChildren: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Reports</h3>
          <p className="text-muted-foreground">
            Generate and download various reports for your data.
          </p>
          <div className="space-y-3">
            <ActionButton text="Download Monthly Report" variant="primary" />
            <ActionButton text="Download User Report" variant="secondary" />
            <ActionButton text="Download Analytics Report" variant="outline" />
          </div>
        </div>
      ),
    },
  ];

  // Settings tabs with icons and forms
  const settingsTabsData = [
    {
      value: 'profile',
      label: 'Profile',
      contentChildren: (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Profile Settings</h3>
          </div>
          <div className="space-y-4">
                         <InputGroup
               label="Full Name"
               inputType="text"
               value={formData.name}
               onChange={(value: string) => setFormData(prev => ({ ...prev, name: value }))}
               placeholder="Enter your full name"
             />
             <InputGroup
               label="Email Address"
               inputType="email"
               value={formData.email}
               onChange={(value: string) => setFormData(prev => ({ ...prev, email: value }))}
               placeholder="Enter your email"
             />
             <InputGroup
               label="Bio"
               inputType="textarea"
               value={formData.bio}
               onChange={(value: string) => setFormData(prev => ({ ...prev, bio: value }))}
               placeholder="Tell us about yourself..."
               inputClassName="min-h-[100px]"
             />
            <ActionButton text="Save Changes" variant="primary" />
          </div>
        </div>
      ),
    },
    {
      value: 'notifications',
      label: 'Notifications',
      contentChildren: (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Notification Preferences</h3>
          </div>
          <div className="space-y-4">
                         <InputGroup
               label="Email Notifications"
               inputType="radio"
               options={[
                 { value: 'all', label: 'All notifications' },
                 { value: 'important', label: 'Important only' },
                 { value: 'none', label: 'None' },
               ]}
             />
             <InputGroup
               label="Push Notifications"
               inputType="radio"
               options={[
                 { value: 'enabled', label: 'Enabled' },
                 { value: 'disabled', label: 'Disabled' },
               ]}
             />
            <ActionButton text="Update Preferences" variant="primary" />
          </div>
        </div>
      ),
    },
    {
      value: 'security',
      label: 'Security',
      contentChildren: (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Security Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Add an extra layer of security to your account
              </p>
              <ActionButton text="Enable 2FA" variant="outline" />
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Change Password</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Update your password regularly for better security
              </p>
              <ActionButton text="Change Password" variant="outline" />
            </div>
          </div>
        </div>
      ),
    },
    {
      value: 'billing',
      label: 'Billing',
      contentChildren: (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Billing Information</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium">Current Plan</h4>
              <p className="text-2xl font-bold text-primary">Pro Plan</p>
              <p className="text-sm text-muted-foreground">$29/month</p>
            </div>
            <div className="space-y-3">
              <ActionButton text="Upgrade Plan" variant="primary" />
              <ActionButton text="View Billing History" variant="outline" />
              <ActionButton text="Download Invoice" variant="ghost" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Vertical tabs data
  const verticalTabsData = [
    {
      value: 'documents',
      label: 'Documents',
      contentChildren: (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Document Management</h3>
          </div>
          <p className="text-muted-foreground">
            Manage all your documents in one place. Upload, organize, and share files easily.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Contract.pdf', 'Report.docx', 'Presentation.pptx', 'Spreadsheet.xlsx'].map((doc) => (
              <div key={doc} className="p-3 border rounded-lg flex items-center justify-between">
                <span className="text-sm">{doc}</span>
                <ActionButton text="Download" size="sm" variant="outline" />
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      value: 'uploads',
      label: 'Uploads',
      contentChildren: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upload Files</h3>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <p className="text-muted-foreground mb-4">Drag and drop files here or click to browse</p>
            <ActionButton text="Choose Files" variant="primary" />
          </div>
        </div>
      ),
    },
    {
      value: 'shared',
      label: 'Shared',
      contentChildren: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Shared Files</h3>
          <p className="text-muted-foreground">Files that have been shared with you by other users.</p>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No shared files yet</p>
          </div>
        </div>
      ),
    },
  ];

  // Loading state tabs
  const loadingTabsData = [
    {
      value: 'loading1',
      label: 'Loading Content',
      contentChildren: (
        <div className="py-8">
          <LoadingIndicator size="lg" message="Loading content..." />
        </div>
      ),
    },
    {
      value: 'loading2',
      label: 'Processing',
      contentChildren: (
        <div className="py-8">
          <LoadingIndicator size="md" message="Processing data..." />
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-12">
      <h1 className="text-3xl font-bold mb-6">TabbedInterface Examples</h1>
      
      {/* Basic Horizontal Tabs */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Basic Horizontal Tabs</h2>
        <TabbedInterface
          tabsData={basicTabsData}
          defaultValue="overview"
          onTabChange={handleTabChange}
        />
        {activeTab && (
          <p className="text-sm text-muted-foreground">
            Current active tab: <span className="font-medium">{activeTab}</span>
          </p>
        )}
      </section>

      {/* Settings Tabs with Forms */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Settings Interface</h2>
        <TabbedInterface
          tabsData={settingsTabsData}
          defaultValue="profile"
          className="border rounded-lg p-6"
        />
      </section>

      {/* Vertical Tabs */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Vertical Tabs</h2>
        <div className="border rounded-lg p-6">
          <TabbedInterface
            tabsData={verticalTabsData}
            defaultValue="documents"
            orientation="vertical"
          />
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Tabs with Loading States</h2>
        <TabbedInterface
          tabsData={loadingTabsData}
          defaultValue="loading1"
        />
      </section>

      {/* Custom Styled Tabs */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Custom Styled Tabs</h2>
        <TabbedInterface
          tabsData={[
            {
              value: 'custom1',
              label: 'Custom Tab 1',
              contentChildren: (
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Custom Styled Content</h3>
                  <p className="text-muted-foreground">
                    This tab content has custom styling with gradient background.
                  </p>
                </div>
              ),
            },
            {
              value: 'custom2',
              label: 'Custom Tab 2',
              contentChildren: (
                <div className="border-l-4 border-primary pl-6">
                  <h3 className="text-lg font-semibold mb-2">Bordered Content</h3>
                  <p className="text-muted-foreground">
                    This content has a custom left border for visual emphasis.
                  </p>
                </div>
              ),
            },
          ]}
          className="bg-muted/50 p-4 rounded-lg"
        />
      </section>

      {/* Current Form Data Display */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-medium mb-2">Current Form Data (from Profile tab):</h3>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TabbedInterfaceExample; 
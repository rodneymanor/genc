# TabbedInterface Component

A reusable React component that wraps ShadCN UI's Tabs component with dynamic tab generation from props data.

## Features

- **Dynamic Tab Generation**: Create tabs from an array of data objects
- **Horizontal & Vertical Orientations**: Support for both layout orientations
- **TypeScript Support**: Fully typed with proper interfaces
- **ShadCN UI Integration**: Built on top of ShadCN's robust Tabs component
- **Accessibility**: Inherits all accessibility features from ShadCN UI
- **Customizable**: Supports custom styling and event handling

## Props

### `tabsData` (required)
- **Type**: `TabData[]`
- **Description**: Array of objects representing tabs and their content
- **Structure**:
  ```typescript
  interface TabData {
    value: string;        // Unique identifier for the tab
    label: string;        // Text displayed on the tab trigger
    contentChildren: React.ReactNode; // Content rendered when tab is active
  }
  ```

### `defaultValue` (optional)
- **Type**: `string`
- **Description**: The value of the tab that should be active by default
- **Default**: First tab's value if not provided

### `orientation` (optional)
- **Type**: `'horizontal' | 'vertical'`
- **Description**: Layout orientation for the tabs
- **Default**: `'horizontal'`

### `className` (optional)
- **Type**: `string`
- **Description**: Additional Tailwind CSS classes for the root Tabs component

### `onTabChange` (optional)
- **Type**: `(value: string) => void`
- **Description**: Callback function called when a tab changes, receives the new active tab's value

## Basic Usage

```tsx
import TabbedInterface from '@/components/TabbedInterface';

const tabsData = [
  {
    value: 'tab1',
    label: 'First Tab',
    contentChildren: <div>Content for first tab</div>
  },
  {
    value: 'tab2',
    label: 'Second Tab',
    contentChildren: <div>Content for second tab</div>
  }
];

function MyComponent() {
  return (
    <TabbedInterface
      tabsData={tabsData}
      defaultValue="tab1"
      onTabChange={(value) => console.log('Active tab:', value)}
    />
  );
}
```

## Advanced Examples

### Vertical Tabs
```tsx
<TabbedInterface
  tabsData={tabsData}
  orientation="vertical"
  className="border rounded-lg p-4"
/>
```

### With Form Content
```tsx
const formTabsData = [
  {
    value: 'profile',
    label: 'Profile',
    contentChildren: (
      <div>
        <InputGroup
          label="Name"
          inputType="text"
          value={name}
          onChange={setName}
        />
        <ActionButton text="Save" variant="primary" />
      </div>
    )
  }
];
```

### Settings Interface
```tsx
const settingsTabsData = [
  {
    value: 'general',
    label: 'General',
    contentChildren: <GeneralSettings />
  },
  {
    value: 'security',
    label: 'Security',
    contentChildren: <SecuritySettings />
  },
  {
    value: 'notifications',
    label: 'Notifications',
    contentChildren: <NotificationSettings />
  }
];

<TabbedInterface
  tabsData={settingsTabsData}
  defaultValue="general"
  className="max-w-4xl mx-auto"
/>
```

## Styling

The component uses ShadCN UI's default tab styling and can be customized using:

1. **className prop**: Add custom classes to the root Tabs component
2. **Content styling**: Style individual tab content through the `contentChildren`
3. **CSS custom properties**: Modify theme colors in your global CSS

### Custom Styling Example
```tsx
<TabbedInterface
  tabsData={tabsData}
  className="bg-muted/50 p-4 rounded-lg border"
/>
```

## Accessibility

The component inherits all accessibility features from ShadCN UI's Tabs:

- **Keyboard Navigation**: Arrow keys to navigate between tabs
- **Focus Management**: Proper focus handling and visual indicators
- **ARIA Attributes**: Proper ARIA roles and properties
- **Screen Reader Support**: Accessible to assistive technologies

## Integration with Other Components

The TabbedInterface works seamlessly with other reusable components:

```tsx
// With ActionButton
contentChildren: (
  <div>
    <p>Tab content here</p>
    <ActionButton text="Action" variant="primary" />
  </div>
)

// With InputGroup
contentChildren: (
  <div>
    <InputGroup
      label="Email"
      inputType="email"
      value={email}
      onChange={setEmail}
    />
  </div>
)

// With LoadingIndicator
contentChildren: (
  <div>
    {isLoading ? (
      <LoadingIndicator size="md" message="Loading..." />
    ) : (
      <div>Content loaded!</div>
    )}
  </div>
)
```

## Best Practices

1. **Unique Values**: Ensure each tab has a unique `value` prop
2. **Meaningful Labels**: Use clear, descriptive labels for tabs
3. **Content Organization**: Group related content logically
4. **Loading States**: Use LoadingIndicator for async content
5. **Responsive Design**: Consider tab overflow on smaller screens
6. **Error Handling**: Provide fallback content for failed loads

## Examples File

See `TabbedInterface.example.tsx` for comprehensive examples including:
- Basic horizontal tabs
- Settings interface with forms
- Vertical tabs layout
- Loading states
- Custom styling
- Real-world use cases 
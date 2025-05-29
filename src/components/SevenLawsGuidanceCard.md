# SevenLawsGuidanceCard Component

A reusable React component that wraps ShadCN UI's Card component to display guidance content for the Seven Laws framework with optional dismiss functionality.

## Features

- **Informative Design**: Styled specifically for guidance content with distinctive visual elements
- **Dismissible**: Optional dismiss functionality with X button
- **Flexible Content**: Supports both string and ReactNode content
- **Visibility Control**: Built-in visibility toggle functionality
- **Accessible**: Includes proper ARIA labels and keyboard navigation
- **Customizable**: Supports custom styling through className prop
- **Visual Hierarchy**: Includes law name with initial letter badge

## Props

### `lawName` (required)
- **Type**: `string`
- **Description**: The name of the "Seven Law" (e.g., "Hook," "Bridge")
- **Example**: `"Hook"`, `"Bridge"`, `"Reveal"`

### `guidanceText` (required)
- **Type**: `string | React.ReactNode`
- **Description**: The explanatory text or content for that law
- **Example**: Simple string or complex JSX with formatting, lists, buttons, etc.

### `isVisible` (optional)
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Controls card visibility (returns null when false)

### `onDismiss` (optional)
- **Type**: `() => void`
- **Description**: If provided, shows a dismiss 'X' button in the header
- **Behavior**: When clicked, calls the provided function

### `className` (optional)
- **Type**: `string`
- **Description**: Additional Tailwind CSS classes for the Card root
- **Example**: `"border-green-200 bg-green-50"`

## Basic Usage

```tsx
import SevenLawsGuidanceCard from '@/components/SevenLawsGuidanceCard';

function MyComponent() {
  return (
    <SevenLawsGuidanceCard
      lawName="Hook"
      guidanceText="Capture attention immediately with a compelling opening that makes your audience want to continue."
    />
  );
}
```

## Advanced Examples

### With Dismiss Functionality
```tsx
const [isVisible, setIsVisible] = useState(true);

<SevenLawsGuidanceCard
  lawName="Bridge"
  guidanceText="Connect your hook to the main content by establishing relevance."
  isVisible={isVisible}
  onDismiss={() => setIsVisible(false)}
/>
```

### Rich Content with JSX
```tsx
<SevenLawsGuidanceCard
  lawName="Reveal"
  guidanceText={
    <div className="space-y-2">
      <p>Unveil your main message in a natural way.</p>
      <ul className="text-xs space-y-1 ml-4">
        <li>• Show, don't just tell</li>
        <li>• Use concrete examples</li>
        <li>• Demonstrate clear value</li>
      </ul>
    </div>
  }
/>
```

### Custom Styling
```tsx
<SevenLawsGuidanceCard
  lawName="Reward"
  guidanceText="Provide clear benefits and value."
  className="border-green-200 bg-green-50 border-l-green-500"
  onDismiss={() => console.log('Dismissed')}
/>
```

### Interactive Content
```tsx
<SevenLawsGuidanceCard
  lawName="Roadmap"
  guidanceText={
    <div className="space-y-3">
      <p>Outline clear next steps for your audience.</p>
      <ActionButton
        text="Learn More"
        size="sm"
        variant="outline"
        onClick={() => alert('Learn more!')}
      />
    </div>
  }
/>
```

## Design System Integration

### Default Styling
The component uses a distinctive design that differentiates it as guidance content:

- **Border**: Primary color with 20% opacity
- **Background**: Primary color with 5% opacity  
- **Left Border**: Solid primary color accent (4px)
- **Shadow**: Medium shadow with hover enhancement
- **Transitions**: Smooth hover effects

### Color Themes
You can customize the color theme using the `className` prop:

```tsx
// Success theme
className="border-green-200 bg-green-50 border-l-green-500"

// Warning theme  
className="border-amber-200 bg-amber-50 border-l-amber-500"

// Info theme
className="border-blue-200 bg-blue-50 border-l-blue-500"

// Custom theme
className="border-purple-200 bg-purple-50 border-l-purple-500"
```

## Component Structure

```tsx
<Card className="styled-guidance-card">
  <CardHeader className="with-optional-dismiss">
    <CardTitle className="with-initial-badge">
      <Badge>{lawName[0]}</Badge>
      {lawName}
    </CardTitle>
    {onDismiss && <DismissButton />}
  </CardHeader>
  
  <CardContent>
    {guidanceText}
  </CardContent>
</Card>
```

## Accessibility Features

- **ARIA Labels**: Dismiss button includes descriptive aria-label
- **Keyboard Navigation**: Full keyboard support through ShadCN components
- **Focus Management**: Proper focus indicators and tab order
- **Screen Reader Support**: Semantic HTML structure with proper headings
- **Color Contrast**: Meets WCAG guidelines for text contrast

## Seven Laws Framework

The component is specifically designed for the Seven Laws framework:

1. **Hook** - Capture attention immediately
2. **Bridge** - Connect hook to main content  
3. **Reveal** - Unveil your main message
4. **Reframe** - Shift perspective or address objections
5. **Reward** - Provide clear benefits and value
6. **Roadmap** - Outline clear next steps
7. **Reason** - Give compelling reasons to act now

### Complete Framework Example
```tsx
const sevenLaws = [
  {
    name: 'Hook',
    guidance: 'Capture attention with compelling opening...'
  },
  {
    name: 'Bridge', 
    guidance: 'Connect your hook to main content...'
  },
  // ... other laws
];

{sevenLaws.map((law) => (
  <SevenLawsGuidanceCard
    key={law.name}
    lawName={law.name}
    guidanceText={law.guidance}
    onDismiss={() => handleDismiss(law.name)}
  />
))}
```

## Integration with Other Components

Works seamlessly with other reusable components:

```tsx
// With ActionButton
guidanceText={
  <div>
    <p>Guidance text here...</p>
    <ActionButton text="Take Action" variant="primary" />
  </div>
}

// With InputGroup
guidanceText={
  <div>
    <p>Fill out this form:</p>
    <InputGroup
      label="Your Goal"
      inputType="text"
      placeholder="What do you want to achieve?"
    />
  </div>
}

// With LoadingIndicator
guidanceText={
  <div>
    {isLoading ? (
      <LoadingIndicator size="sm" message="Loading guidance..." />
    ) : (
      <p>Your personalized guidance content</p>
    )}
  </div>
}
```

## Best Practices

1. **Clear Law Names**: Use concise, descriptive names for each law
2. **Actionable Guidance**: Provide specific, actionable advice
3. **Progressive Disclosure**: Use dismiss functionality to reduce clutter
4. **Consistent Styling**: Maintain visual consistency across law cards
5. **Rich Content**: Leverage ReactNode support for enhanced formatting
6. **Responsive Design**: Ensure cards work well on all screen sizes
7. **State Management**: Track visibility state for better UX

## Real-World Use Cases

- **Content Creation Tools**: Guide users through content structure
- **Marketing Campaigns**: Provide framework guidance for campaigns  
- **Educational Platforms**: Teach the Seven Laws methodology
- **Writing Assistants**: Help users apply proven frameworks
- **Coaching Applications**: Provide structured guidance to users

## Examples File

See `SevenLawsGuidanceCard.example.tsx` for comprehensive examples including:
- Basic usage patterns
- Complete Seven Laws framework implementation
- Custom styling variations
- Rich content with interactive elements
- Real-world use case demonstrations
- State management for visibility control 
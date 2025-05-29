import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import StandardizedInputGroup from './InputGroup';

const meta: Meta<typeof StandardizedInputGroup> = {
  title: 'Components/InputGroup',
  component: StandardizedInputGroup,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the input',
    },
    inputType: {
      control: 'select',
      options: ['text', 'textarea', 'select', 'radio', 'url', 'email'],
      description: 'Type of input to render',
    },
    value: {
      control: 'text',
      description: 'Current value of the input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message to display',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    onChange: {
      action: 'changed',
      description: 'Function called when value changes',
    },
    options: {
      control: 'object',
      description: 'Options for select and radio inputs',
    },
  },
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof StandardizedInputGroup>;

const selectOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

const radioOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export const TextInput: Story = {
  args: {
    label: 'Full Name',
    inputType: 'text',
    placeholder: 'Enter your full name',
    value: '',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const TextArea: Story = {
  args: {
    label: 'Description',
    inputType: 'textarea',
    placeholder: 'Enter a detailed description...',
    value: '',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export const SelectInput: Story = {
  args: {
    label: 'Choose an Option',
    inputType: 'select',
    placeholder: 'Select an option',
    options: selectOptions,
    value: '',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const RadioInput: Story = {
  args: {
    label: 'Size',
    inputType: 'radio',
    options: radioOptions,
    value: '',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const EmailInput: Story = {
  args: {
    label: 'Email Address',
    inputType: 'email',
    placeholder: 'user@example.com',
    value: '',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const UrlInput: Story = {
  args: {
    label: 'Website URL',
    inputType: 'url',
    placeholder: 'https://example.com',
    value: '',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    inputType: 'email',
    placeholder: 'user@example.com',
    value: 'invalid-email',
    errorMessage: 'Please enter a valid email address',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    inputType: 'text',
    placeholder: 'This input is disabled',
    value: 'Cannot edit this',
    disabled: true,
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithValue: Story = {
  args: {
    label: 'Pre-filled Input',
    inputType: 'text',
    placeholder: 'Enter your name',
    value: 'John Doe',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const CustomStyling: Story = {
  args: {
    label: 'Custom Styled Input',
    inputType: 'text',
    placeholder: 'Custom styling example',
    value: '',
    inputClassName: 'border-2 border-primary focus-visible:ring-primary',
    labelClassName: 'text-primary font-semibold',
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

// Interactive example with state management
export const InteractiveForm: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      description: '',
      category: '',
      size: '',
      website: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string) => (value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    };

    const validateForm = () => {
      const newErrors: Record<string, string> = {};
      
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      if (!formData.category) {
        newErrors.category = 'Please select a category';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
      if (validateForm()) {
        alert('Form submitted successfully!\n\n' + JSON.stringify(formData, null, 2));
      }
    };

    return (
      <div className="space-y-6 max-w-md">
        <h3 className="text-lg font-semibold">Interactive Form Example</h3>
        
        <StandardizedInputGroup
          label="Full Name"
          inputType="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange('name')}
          errorMessage={errors.name}
        />
        
        <StandardizedInputGroup
          label="Email Address"
          inputType="email"
          placeholder="user@example.com"
          value={formData.email}
          onChange={handleChange('email')}
          errorMessage={errors.email}
        />
        
        <StandardizedInputGroup
          label="Category"
          inputType="select"
          placeholder="Select a category"
          value={formData.category}
          onChange={handleChange('category')}
          options={[
            { value: 'business', label: 'Business' },
            { value: 'personal', label: 'Personal' },
            { value: 'education', label: 'Education' },
          ]}
          errorMessage={errors.category}
        />
        
        <StandardizedInputGroup
          label="Size Preference"
          inputType="radio"
          value={formData.size}
          onChange={handleChange('size')}
          options={radioOptions}
        />
        
        <StandardizedInputGroup
          label="Website (Optional)"
          inputType="url"
          placeholder="https://example.com"
          value={formData.website}
          onChange={handleChange('website')}
        />
        
        <StandardizedInputGroup
          label="Description"
          inputType="textarea"
          placeholder="Tell us more about yourself..."
          value={formData.description}
          onChange={handleChange('description')}
        />
        
        <button
          onClick={handleSubmit}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Submit Form
        </button>
        
        <div className="mt-4 p-3 bg-muted rounded text-sm">
          <strong>Current Form Data:</strong>
          <pre className="mt-2 text-xs">{JSON.stringify(formData, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

// Showcase all input types
export const AllInputTypes: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <StandardizedInputGroup
        label="Text Input"
        inputType="text"
        placeholder="Enter text"
        value=""
      />
      
      <StandardizedInputGroup
        label="Email Input"
        inputType="email"
        placeholder="user@example.com"
        value=""
      />
      
      <StandardizedInputGroup
        label="URL Input"
        inputType="url"
        placeholder="https://example.com"
        value=""
      />
      
      <StandardizedInputGroup
        label="Select Input"
        inputType="select"
        placeholder="Choose option"
        options={selectOptions}
        value=""
      />
      
      <div className="md:col-span-2">
        <StandardizedInputGroup
          label="Textarea Input"
          inputType="textarea"
          placeholder="Enter longer text..."
          value=""
        />
      </div>
      
      <div className="md:col-span-2">
        <StandardizedInputGroup
          label="Radio Input"
          inputType="radio"
          options={radioOptions}
          value=""
        />
      </div>
    </div>
  ),
}; 
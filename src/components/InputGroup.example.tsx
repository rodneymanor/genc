import React, { useState } from 'react';
import StandardizedInputGroup from './InputGroup';

const InputGroupExample: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    bio: '',
    country: '',
    gender: '',
    newsletter: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string) => (value: string) => {
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
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (starting with http:// or https://)';
    }

    if (!formData.country) {
      newErrors.country = 'Please select a country';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      alert('Form submitted successfully! Check console for data.');
    }
  };

  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'jp', label: 'Japan' },
    { value: 'au', label: 'Australia' },
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  const newsletterOptions = [
    { value: 'daily', label: 'Daily updates' },
    { value: 'weekly', label: 'Weekly digest' },
    { value: 'monthly', label: 'Monthly newsletter' },
    { value: 'never', label: 'No emails' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">StandardizedInputGroup Examples</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold">User Registration Form</h2>
        
        {/* Text Input */}
        <StandardizedInputGroup
          label="Full Name"
          inputType="text"
          id="name"
          value={formData.name}
          onChange={handleInputChange('name')}
          placeholder="Enter your full name"
          errorMessage={errors.name}
        />

        {/* Email Input */}
        <StandardizedInputGroup
          label="Email Address"
          inputType="email"
          id="email"
          value={formData.email}
          onChange={handleInputChange('email')}
          placeholder="Enter your email address"
          errorMessage={errors.email}
        />

        {/* URL Input */}
        <StandardizedInputGroup
          label="Website (Optional)"
          inputType="url"
          id="website"
          value={formData.website}
          onChange={handleInputChange('website')}
          placeholder="https://your-website.com"
          errorMessage={errors.website}
        />

        {/* Textarea */}
        <StandardizedInputGroup
          label="Bio"
          inputType="textarea"
          id="bio"
          value={formData.bio}
          onChange={handleInputChange('bio')}
          placeholder="Tell us about yourself..."
          inputClassName="min-h-[100px]"
        />

        {/* Select */}
        <StandardizedInputGroup
          label="Country"
          inputType="select"
          id="country"
          value={formData.country}
          onChange={handleInputChange('country')}
          placeholder="Select your country"
          options={countryOptions}
          errorMessage={errors.country}
        />

        {/* Radio Group */}
        <StandardizedInputGroup
          label="Gender"
          inputType="radio"
          id="gender"
          value={formData.gender}
          onChange={handleInputChange('gender')}
          options={genderOptions}
          errorMessage={errors.gender}
        />

        {/* Radio Group - Newsletter Preference */}
        <StandardizedInputGroup
          label="Newsletter Preference"
          inputType="radio"
          id="newsletter"
          value={formData.newsletter}
          onChange={handleInputChange('newsletter')}
          options={newsletterOptions}
        />

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors"
        >
          Submit Form
        </button>
      </form>

      {/* Individual Examples */}
      <div className="space-y-8 pt-8 border-t">
        <h2 className="text-xl font-semibold">Individual Component Examples</h2>
        
        {/* Disabled State */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium">Disabled States</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StandardizedInputGroup
              label="Disabled Text Input"
              inputType="text"
              value="Cannot edit this"
              disabled
            />
            <StandardizedInputGroup
              label="Disabled Select"
              inputType="select"
              value="us"
              options={countryOptions}
              disabled
            />
          </div>
        </section>

        {/* Error States */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium">Error States</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StandardizedInputGroup
              label="Text with Error"
              inputType="text"
              value="invalid@"
              errorMessage="This field contains invalid characters"
            />
            <StandardizedInputGroup
              label="Select with Error"
              inputType="select"
              placeholder="Please select an option"
              options={countryOptions}
              errorMessage="This field is required"
            />
          </div>
        </section>

        {/* Custom Styling */}
        <section className="space-y-4">
          <h3 className="text-lg font-medium">Custom Styling</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StandardizedInputGroup
              label="Custom Label Style"
              inputType="text"
              placeholder="Custom styled input"
              labelClassName="text-primary font-bold"
              inputClassName="border-2 border-primary focus-visible:ring-primary"
            />
            <StandardizedInputGroup
              label="Large Textarea"
              inputType="textarea"
              placeholder="This is a larger textarea..."
              inputClassName="min-h-[150px] text-lg"
            />
          </div>
        </section>
      </div>

      {/* Current Form Data Display */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="text-lg font-medium mb-2">Current Form Data:</h3>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default InputGroupExample; 
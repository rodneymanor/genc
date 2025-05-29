import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type InputType = 'text' | 'textarea' | 'select' | 'radio' | 'url' | 'email';

interface Option {
  value: string;
  label: string;
}

interface StandardizedInputGroupProps {
  label?: string;
  inputType?: InputType;
  id?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  errorMessage?: string;
  options?: Option[];
  inputClassName?: string;
  labelClassName?: string;
  disabled?: boolean;
}

const StandardizedInputGroup: React.FC<StandardizedInputGroupProps> = ({
  label,
  inputType = 'text',
  id,
  value,
  onChange,
  placeholder,
  errorMessage,
  options = [],
  inputClassName,
  labelClassName,
  disabled = false,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleSelectChange = (selectedValue: string) => {
    if (onChange) {
      onChange(selectedValue);
    }
  };

  const handleRadioChange = (selectedValue: string) => {
    if (onChange) {
      onChange(selectedValue);
    }
  };

  const renderInput = () => {
    const baseInputClasses = cn(
      errorMessage && 'border-destructive focus-visible:ring-destructive',
      inputClassName
    );

    switch (inputType) {
      case 'textarea':
        return (
          <Textarea
            id={inputId}
            value={value || ''}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={baseInputClasses}
            {...props}
          />
        );

      case 'select':
        return (
          <Select
            value={value?.toString() || ''}
            onValueChange={handleSelectChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={inputId}
              className={baseInputClasses}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            value={value?.toString() || ''}
            onValueChange={handleRadioChange}
            disabled={disabled}
            className={cn('flex flex-col space-y-2', inputClassName)}
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${inputId}-${option.value}`}
                  className={errorMessage ? 'border-destructive' : ''}
                />
                <Label
                  htmlFor={`${inputId}-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'url':
        return (
          <Input
            id={inputId}
            type="url"
            value={value || ''}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={baseInputClasses}
            {...props}
          />
        );

      case 'email':
        return (
          <Input
            id={inputId}
            type="email"
            value={value || ''}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={baseInputClasses}
            {...props}
          />
        );

      case 'text':
      default:
        return (
          <Input
            id={inputId}
            type="text"
            value={value || ''}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={baseInputClasses}
            {...props}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label
          htmlFor={inputType === 'radio' ? undefined : inputId}
          className={cn(
            'text-sm font-medium leading-none',
            disabled && 'opacity-70 cursor-not-allowed',
            errorMessage && 'text-destructive',
            labelClassName
          )}
        >
          {label}
        </Label>
      )}
      
      {renderInput()}
      
      {errorMessage && (
        <p className="text-sm text-destructive mt-1" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default StandardizedInputGroup; 
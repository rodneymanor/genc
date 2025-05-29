import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

type ActionButtonVariant = 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
type ActionButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  onClick?: () => void;
  variant?: ActionButtonVariant;
  disabled?: boolean;
  isLoading?: boolean;
  size?: ActionButtonSize;
  className?: string;
  children?: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  text,
  onClick,
  variant = 'primary',
  disabled = false,
  isLoading = false,
  size = 'default',
  className,
  children,
  ...props
}) => {
  // Map custom variants to ShadCN variants and additional styling
  const getVariantConfig = (variant: ActionButtonVariant) => {
    switch (variant) {
      case 'primary':
        return {
          shadcnVariant: 'default' as const,
          customClasses: 'bg-primary text-primary-foreground hover:bg-primary/90'
        };
      case 'secondary':
        return {
          shadcnVariant: 'secondary' as const,
          customClasses: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        };
      case 'destructive':
        return {
          shadcnVariant: 'destructive' as const,
          customClasses: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
        };
      case 'outline':
        return {
          shadcnVariant: 'outline' as const,
          customClasses: ''
        };
      case 'ghost':
        return {
          shadcnVariant: 'ghost' as const,
          customClasses: ''
        };
      case 'link':
        return {
          shadcnVariant: 'link' as const,
          customClasses: ''
        };
      default:
        return {
          shadcnVariant: 'default' as const,
          customClasses: 'bg-primary text-primary-foreground hover:bg-primary/90'
        };
    }
  };

  const { shadcnVariant, customClasses } = getVariantConfig(variant);

  return (
    <Button
      variant={shadcnVariant}
      size={size}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        customClasses,
        isLoading && 'cursor-not-allowed',
        className
      )}
      {...props}
    >
      {isLoading && (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
      {text && <span>{text}</span>}
    </Button>
  );
};

export default ActionButton; 
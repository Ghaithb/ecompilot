import React from 'react';

export const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dialog-title">{children}</div>
);

export const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="dialog-description">{children}</div>
);

export const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
  <label data-testid="label" htmlFor={htmlFor}>{children}</label>
);

export const Switch = ({ id, checked, onCheckedChange, 'aria-label': ariaLabel }: { 
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  'aria-label'?: string;
}) => (
  <button
    data-testid="switch"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    onClick={() => onCheckedChange?.(!checked)}
  />
);

export const Button = ({ 
  children,
  onClick,
  variant,
  className,
  'aria-label': ariaLabel
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: string;
  className?: string;
  'aria-label'?: string;
}) => (
  <button
    data-testid="button"
    onClick={onClick}
    className={className}
    aria-label={ariaLabel}
  >
    {children}
  </button>
);
import React from 'react';

export const DialogTitle = ({ children, ...props }: any) => (
  <h2 {...props}>{children}</h2>
);

export const DialogDescription = ({ children, ...props }: any) => (
  <p {...props}>{children}</p>
);

export const Label = ({ children, ...props }: any) => (
  <label {...props}>{children}</label>
);

export const Switch = ({ checked, onCheckedChange, ...props }: any) => (
  <input
    type="checkbox"
    role="switch"
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
    {...props}
  />
);

export const Button = ({ children, onClick, variant, ...props }: any) => (
  <button onClick={onClick} {...props}>
    {children}
  </button>
);
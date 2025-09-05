import React, { useState, useEffect, useRef } from 'react';

interface InlineEditProps {
  initialValue: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  className?: string;
  autoFocus?: boolean;
  selectOnFocus?: boolean;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  initialValue,
  placeholder = '',
  onConfirm,
  onCancel,
  className = '',
  autoFocus = true,
  selectOnFocus = true
}) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      if (selectOnFocus) {
        inputRef.current.select();
      }
    }
  }, [autoFocus, selectOnFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = value.trim();
      if (trimmedValue) {
        onConfirm(trimmedValue);
      } else {
        onCancel();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      onConfirm(trimmedValue);
    } else {
      onCancel();
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`bg-transparent border-none outline-none text-xs ${className}`}
      style={{ 
        minWidth: '80px',
        width: `${Math.max(value.length * 8, 80)}px`
      }}
    />
  );
};

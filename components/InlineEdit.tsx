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
  const hasCancelledRef = useRef(false);

  useEffect(() => {
    // コンポーネントがマウントされた時にキャンセル状態をリセット
    hasCancelledRef.current = false;
    
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      if (selectOnFocus) {
        inputRef.current.select();
      }
    }
  }, [autoFocus, selectOnFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (hasCancelledRef.current) return;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      // VSCode仕様: Enterを押した場合は空の名前でも作成する
      onConfirm(value.trim());
    } else if (e.key === 'Escape') {
      e.preventDefault();
      hasCancelledRef.current = true;
      onCancel();
    }
  };

  const handleBlur = () => {
    // VSCode仕様: フォーカスを外したら無条件キャンセル
    if (!hasCancelledRef.current) {
      hasCancelledRef.current = true;
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

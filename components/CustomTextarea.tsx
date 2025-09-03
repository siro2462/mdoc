import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface CustomTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onPaste?: (e: React.ClipboardEvent) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface CustomTextareaRef {
  focus: () => void;
  getSelectionStart: () => number;
  getSelectionEnd: () => number;
  setSelectionRange: (start: number, end: number) => void;
  getCursorPosition: () => number;
  setCursorPosition: (position: number) => void;
  insertTextAtCursor: (text: string) => void;
}

const CustomTextarea = forwardRef<CustomTextareaRef, CustomTextareaProps>(
  ({ value, onChange, onKeyDown, onPaste, placeholder, className, style }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [displayValue, setDisplayValue] = React.useState('');
    const [originalValue, setOriginalValue] = React.useState(value);

    // 表示位置から実際の位置への変換
    const convertDisplayPositionToActual = (displayPos: number): number => {
      let actualPos = 0;
      let displayIndex = 0;
      let actualIndex = 0;
      
      while (displayIndex < displayPos && actualIndex < originalValue.length) {
        if (originalValue.slice(actualIndex).match(/^!\[([^\]]*)\]\(data:image\/[^;]+;base64,[^)]+\)/)) {
          // base64画像の部分をスキップ
          const match = originalValue.slice(actualIndex).match(/^!\[([^\]]*)\]\(data:image\/[^;]+;base64,[^)]+\)/);
          if (match) {
            actualIndex += match[0].length;
            displayIndex += `![${match[1]}]([base64 image hidden])`.length;
          }
        } else {
          actualIndex++;
          displayIndex++;
        }
      }
      
      return actualIndex;
    };

    // 実際の位置から表示位置への変換
    const convertActualPositionToDisplay = (actualPos: number): number => {
      let displayPos = 0;
      let actualIndex = 0;
      
      while (actualIndex < actualPos && actualIndex < originalValue.length) {
        if (originalValue.slice(actualIndex).match(/^!\[([^\]]*)\]\(data:image\/[^;]+;base64,[^)]+\)/)) {
          // base64画像の部分をスキップ
          const match = originalValue.slice(actualIndex).match(/^!\[([^\]]*)\]\(data:image\/[^;]+;base64,[^)]+\)/);
          if (match) {
            actualIndex += match[0].length;
            displayPos += `![${match[1]}]([base64 image hidden])`.length;
          }
        } else {
          actualIndex++;
          displayPos++;
        }
      }
      
      return displayPos;
    };

    // 親コンポーネントから呼び出せるメソッドを公開
    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      getSelectionStart: () => textareaRef.current?.selectionStart || 0,
      getSelectionEnd: () => textareaRef.current?.selectionEnd || 0,
      setSelectionRange: (start: number, end: number) => {
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(start, end);
        }
      },
      getCursorPosition: () => {
        const displayPos = textareaRef.current?.selectionStart || 0;
        return convertDisplayPositionToActual(displayPos);
      },
      setCursorPosition: (position: number) => {
        if (textareaRef.current) {
          const displayPos = convertActualPositionToDisplay(position);
          textareaRef.current.setSelectionRange(displayPos, displayPos);
        }
      },
      insertTextAtCursor: (text: string) => {
        if (textareaRef.current) {
          const cursorPos = textareaRef.current.selectionStart || 0;
          const actualPos = convertDisplayPositionToActual(cursorPos);
          const newValue = originalValue.slice(0, actualPos) + text + originalValue.slice(actualPos);
          onChange(newValue);
          
          // カーソル位置を更新
          setTimeout(() => {
            if (textareaRef.current) {
              const newActualPos = actualPos + text.length;
              const newDisplayPos = convertActualPositionToDisplay(newActualPos);
              textareaRef.current.setSelectionRange(newDisplayPos, newDisplayPos);
            }
          }, 0);
        }
      }
    }));

    // base64文字列を折りたたみ表示用のテキストに変換
    const convertBase64ToFolded = (content: string): string => {
      return content.replace(
        /!\[([^\]]*)\]\(data:image\/[^;]+;base64,[^)]+\)/g,
        '![$1]([base64 image hidden])'
      );
    };

    // 折りたたみ表示から元のbase64に戻す
    const convertFoldedToBase64 = (content: string, originalContent: string): string => {
      const foldedRegex = /!\[([^\]]*)\]\(\[base64 image hidden\]\)/g;
      const base64Regex = /!\[([^\]]*)\]\(data:image\/[^;]+;base64,[^)]+\)/g;
      
      let result = content;
      let match;
      const base64Matches: string[] = [];
      
      // 元のコンテンツからbase64画像を抽出
      while ((match = base64Regex.exec(originalContent)) !== null) {
        base64Matches.push(match[0]);
      }
      
      // 折りたたみ表示を元のbase64に置換
      let base64Index = 0;
      result = result.replace(foldedRegex, (match, altText) => {
        if (base64Index < base64Matches.length) {
          const base64Match = base64Matches[base64Index];
          base64Index++;
          return base64Match;
        }
        return match;
      });
      
      return result;
    };

    // 値が変更された時の処理
    useEffect(() => {
      if (value !== originalValue) {
        setOriginalValue(value);
        setDisplayValue(convertBase64ToFolded(value));
      }
    }, [value]);

    // 表示用の値が変更された時の処理
    const handleDisplayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newDisplayValue = e.target.value;
      setDisplayValue(newDisplayValue);
      
      // 折りたたみ表示から元のbase64に戻してから親に通知
      const newOriginalValue = convertFoldedToBase64(newDisplayValue, originalValue);
      onChange(newOriginalValue);
    };

    // キーボードイベントの処理
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    // ペーストイベントの処理
    const handlePaste = (e: React.ClipboardEvent) => {
      if (onPaste) {
        onPaste(e);
      }
    };

    return (
      <textarea
        ref={textareaRef}
        value={displayValue}
        onChange={handleDisplayChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        className={className}
        style={style}
      />
    );
  }
);

CustomTextarea.displayName = 'CustomTextarea';

export default CustomTextarea;

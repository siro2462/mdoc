import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { SearchDialog } from './SearchDialog';

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
  textareaRef: React.RefObject<HTMLTextAreaElement>; // Expose textareaRef
  openSearch: () => void;
  searchText: (query: string) => { matches: number; currentMatch: number };
  searchNext: () => void;
  searchPrevious: () => void;
  replaceText: (query: string, replaceText: string) => { replaced: number };
  replaceAllText: (query: string, replaceText: string) => { replaced: number };
}

const CustomTextarea = forwardRef<CustomTextareaRef, CustomTextareaProps>(
  ({ value, onChange, onKeyDown, onPaste, placeholder, className, style }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [displayValue, setDisplayValue] = React.useState('');
    const [originalValue, setOriginalValue] = React.useState(value);
    
    // 検索機能の状態
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMatches, setSearchMatches] = useState<number[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

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
      },
      textareaRef: textareaRef, // Expose textareaRef
      openSearch: openSearch,
      searchText: performSearch,
      searchNext: searchNext,
      searchPrevious: searchPrevious,
      replaceText: replaceText,
      replaceAllText: replaceAllText
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


    // base64画像を除外したテキストを取得
    const getSearchableText = (text: string): string => {
      return text.replace(
        /!\[([^\]]*)\]\(data:image\/[^;]+;base64,[^)]+\)/g,
        '![$1]([base64 image hidden])'
      );
    };

    // 検索機能
    const findSearchMatches = (text: string, query: string): number[] => {
      if (!query.trim()) return [];
      
      const searchableText = getSearchableText(text);
      const matches: number[] = [];
      
      const searchText = searchableText.toLowerCase();
      const searchQuery = query.toLowerCase();
      
      let index = 0;
      while ((index = searchText.indexOf(searchQuery, index)) !== -1) {
        matches.push(index);
        index += searchQuery.length;
      }
      
      return matches;
    };

    const performSearch = (query: string) => {
      const matches = findSearchMatches(displayValue, query);
      setSearchMatches(matches);
      setCurrentMatchIndex(0);
      setSearchQuery(query);
      
      if (matches.length > 0 && textareaRef.current) {
        // 最初のマッチに移動
        const firstMatch = matches[0];
        const start = firstMatch;
        const end = firstMatch + query.length;
        
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(start, end);
            textareaRef.current.focus();
            
            // スクロール
            const lines = displayValue.substring(0, firstMatch).split('\n');
            const lineNumber = lines.length - 1;
            const lineHeight = 24;
            const targetPosition = 5;
            const newScrollTop = lineNumber * lineHeight - (targetPosition * lineHeight);
            textareaRef.current.scrollTop = Math.max(0, newScrollTop);
          }
        }, 0);
      }
      
      return { matches: matches.length, currentMatch: matches.length > 0 ? 1 : 0 };
    };

    const searchNext = () => {
      if (searchMatches.length === 0) return;
      
      const nextIndex = (currentMatchIndex + 1) % searchMatches.length;
      setCurrentMatchIndex(nextIndex);
      
      if (textareaRef.current) {
        const matchPos = searchMatches[nextIndex];
        const start = matchPos;
        const end = matchPos + searchQuery.length;
        
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(start, end);
            textareaRef.current.focus();
            
            // スクロール
            const lines = displayValue.substring(0, matchPos).split('\n');
            const lineNumber = lines.length - 1;
            const lineHeight = 24;
            const targetPosition = 5;
            const newScrollTop = lineNumber * lineHeight - (targetPosition * lineHeight);
            textareaRef.current.scrollTop = Math.max(0, newScrollTop);
          }
        }, 0);
      }
    };

    const searchPrevious = () => {
      if (searchMatches.length === 0) return;
      
      const prevIndex = currentMatchIndex === 0 ? searchMatches.length - 1 : currentMatchIndex - 1;
      setCurrentMatchIndex(prevIndex);
      
      if (textareaRef.current) {
        const matchPos = searchMatches[prevIndex];
        const start = matchPos;
        const end = matchPos + searchQuery.length;
        
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(start, end);
            textareaRef.current.focus();
            
            // スクロール
            const lines = displayValue.substring(0, matchPos).split('\n');
            const lineNumber = lines.length - 1;
            const lineHeight = 24;
            const targetPosition = 5;
            const newScrollTop = lineNumber * lineHeight - (targetPosition * lineHeight);
            textareaRef.current.scrollTop = Math.max(0, newScrollTop);
          }
        }, 0);
      }
    };

    // 置換機能
    const replaceText = (query: string, replaceText: string): { replaced: number } => {
      if (!query.trim() || searchMatches.length === 0) return { replaced: 0 };
      
      const currentMatch = searchMatches[currentMatchIndex];
      if (currentMatch === undefined) return { replaced: 0 };
      
      // 表示位置を実際の位置に変換
      const actualPos = convertDisplayPositionToActual(currentMatch);
      const actualEnd = convertDisplayPositionToActual(currentMatch + query.length);
      
      // 実際のテキストで置換
      const beforeText = originalValue.substring(0, actualPos);
      const afterText = originalValue.substring(actualEnd);
      const newValue = beforeText + replaceText + afterText;
      
      onChange(newValue);
      
      // 検索結果を更新
      const newMatches = findSearchMatches(newValue, query);
      setSearchMatches(newMatches);
      
      // 現在のマッチ位置を調整
      const newCurrentIndex = Math.min(currentMatchIndex, newMatches.length - 1);
      setCurrentMatchIndex(newCurrentIndex);
      
      return { replaced: 1 };
    };

    const replaceAllText = (query: string, replaceText: string): { replaced: number } => {
      if (!query.trim()) return { replaced: 0 };
      
      // 現在の検索結果を使用して置換
      if (searchMatches.length === 0) return { replaced: 0 };
      
      let newValue = originalValue;
      let replacedCount = 0;
      
      // 後ろから置換（位置がずれないように）
      for (let i = searchMatches.length - 1; i >= 0; i--) {
        const matchPos = searchMatches[i];
        const actualPos = convertDisplayPositionToActual(matchPos);
        const actualEnd = convertDisplayPositionToActual(matchPos + query.length);
        
        const beforeText = newValue.substring(0, actualPos);
        const afterText = newValue.substring(actualEnd);
        newValue = beforeText + replaceText + afterText;
        replacedCount++;
      }
      
      onChange(newValue);
      
      // 検索結果をクリア
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      
      return { replaced: replacedCount };
    };

    const openSearch = () => {
      setIsSearchOpen(true);
    };

    // 値が変更された時の処理
    useEffect(() => {
      // 親コンポーネントから渡されたpropsを常に信頼する
      setOriginalValue(value);
      setDisplayValue(convertBase64ToFolded(value));
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
      // Ctrl+F で検索を開く
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        e.stopPropagation();
        openSearch();
        return;
      }
      
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
      <>
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
        
        <SearchDialog
          isOpen={isSearchOpen}
          onClose={() => {
            setIsSearchOpen(false);
          }}
          onSearch={performSearch}
          onNext={searchNext}
          onPrevious={searchPrevious}
          onReplace={replaceText}
          onReplaceAll={replaceAllText}
          currentMatch={currentMatchIndex + 1}
          totalMatches={searchMatches.length}
          searchQuery={searchQuery}
          onQueryChange={setSearchQuery}
        />
      </>
    );
  }
);

CustomTextarea.displayName = 'CustomTextarea';

export default CustomTextarea;

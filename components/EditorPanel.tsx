import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { FileNode } from '../types';
import { Icon } from './Icon';
import { parseMarkdown } from '../utils/markdown';
import CustomTextarea, { CustomTextareaRef } from './CustomTextarea';

interface EditorPanelProps {
  activeFile: FileNode | null;
  onContentChange: (content: string) => void;
  onSave: (filePath: string, content: string) => Promise<void>;
  isAutoSaveEnabled?: boolean;
  onSaveSuccess?: () => void;
  hasUnsavedChanges?: boolean;
  onCloseFile?: () => void;
}

// 画像リサイズ関数
const resizeImage = (file: File, maxWidth: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(file.type));
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
  activeFile, 
  onContentChange, 
  onSave,
  isAutoSaveEnabled = false,
  onSaveSuccess,
  hasUnsavedChanges = false,
  onCloseFile
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const textareaRef = useRef<CustomTextareaRef>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // アクティブファイルが変更されたときにlastSavedをリセット
  useEffect(() => {
    setLastSaved(null);
    // タイマーをクリア
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
  }, [activeFile]);

  // Scroll synchronization
  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    if (textarea && lineNumbers) {
      const handleScroll = () => {
        const textareaElement = (textarea as any).textareaRef.current;
        if (textareaElement) {
          lineNumbers.scrollTop = textareaElement.scrollTop;
        }
      };
      const textareaElement = (textarea as any).textareaRef.current;
      if (textareaElement) {
        textareaElement.addEventListener('scroll', handleScroll);
        return () => {
          textareaElement.removeEventListener('scroll', handleScroll);
        };
      }
    }
  }, [activeFile]);


  // 自動保存機能
  const autoSave = useCallback(async () => {
    if (!activeFile || !activeFile.content?.trim() || !isAutoSaveEnabled) return;
    
    try {
      setIsSaving(true);
      await onSave(activeFile.path, activeFile.content);
      setLastSaved(new Date());
      onSaveSuccess?.(); // 保存成功時にコールバックを呼び出し
    } catch (error) {
      console.error('Auto save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [activeFile, onSave, isAutoSaveEnabled, onSaveSuccess]);

  // 自動保存のデバウンス用タイマー
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // コンテンツ変更時の処理
  const handleContentChange = (newContent: string) => {
    onContentChange(newContent);
    
    // 自動保存（デバウンス）
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(autoSave, 1000);
  };

  // 画像アップロード処理
  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const base64 = await resizeImage(file, 1024);
      
      // エディタに実際のbase64データを挿入
      const markdownImage = `![${file.name}](${base64})`;
      
      // 現在のカーソル位置に画像を挿入
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.insertTextAtCursor(markdownImage);
        textarea.focus();
      } else {
        // フォールバック: 末尾に挿入
        const currentContent = activeFile?.content || '';
        const newValue = currentContent + markdownImage;
        onContentChange(newValue);
      }
    } catch (error) {
      console.error("Image processing failed:", error);
      alert("Failed to process image.");
    }
  }, [activeFile?.content, onContentChange]);

  // クリップボードからの画像貼り付け
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    // 画像データがあるかチェック
    let hasImage = false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        hasImage = true;
        break;
      }
    }
    
    if (hasImage) {
      e.preventDefault();
      
      // 画像データを処理
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            // ファイル名を生成
            const timestamp = new Date().getTime();
            const extension = file.type.split('/')[1] || 'png';
            const fileName = `screenshot-${timestamp}.${extension}`;
            
            // 新しいFileオブジェクトを作成
            const imageFile = new File([file], fileName, { type: file.type });
            
            // 画像アップロード処理を実行
            handleImageUpload(imageFile).catch(error => {
              console.error('Failed to process pasted image:', error);
            });
          }
          break;
        }
      }
    }
  }, [handleImageUpload]);

  const lineCount = activeFile?.content ? activeFile.content.split('\n').length : 0;
  const lineNumbers = Array.from({ length: lineCount || 1 }, (_, i) => i + 1);

  return (
    <div ref={editorContainerRef} className="flex flex-col h-full bg-light-bg dark:bg-dark-bg">
      {/* Tabs - Fixed Header */}
      <div className="flex-shrink-0 bg-light-bg-secondary dark:bg-dark-bg-secondary h-9 flex items-center justify-between sticky top-0 z-10">
        {activeFile && (
          <>
            <div className="inline-flex items-center h-full px-4 bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text group">
              <Icon name="markdown" className="w-4 h-4 mr-2 text-light-text-secondary dark:text-dark-text-secondary" />
              <span>{activeFile.name}</span>
              {isSaving && (
                <Icon name="loading" className="w-4 h-4 ml-2 animate-spin text-light-text-secondary dark:text-dark-text-secondary" />
              )}
              {lastSaved && !hasUnsavedChanges && (
                <span className="ml-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <div className="ml-2 w-4 h-4 relative">
                {hasUnsavedChanges ? (
                  <>
                    <div className="group-hover:hidden absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full animate-pulse"></div>
                    </div>
                    {onCloseFile && (
                      <button
                        onClick={onCloseFile}
                        className="absolute inset-0 flex items-center justify-center p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-opacity opacity-0 group-hover:opacity-100"
                        title="Close file"
                      >
                        <Icon name="chrome-close" className="w-3 h-3 text-light-text-secondary dark:text-dark-text-secondary" />
                      </button>
                    )}
                  </>
                ) : onCloseFile ? (
                  <button
                    onClick={onCloseFile}
                    className="absolute inset-0 flex items-center justify-center p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-opacity opacity-0 group-hover:opacity-100"
                    title="Close file"
                  >
                    <Icon name="chrome-close" className="w-3 h-3 text-light-text-secondary dark:text-dark-text-secondary" />
                  </button>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex font-mono text-sm overflow-hidden min-h-0">
        {/* Code Content */}
        <div className="flex-1 relative overflow-y-auto flex">
          {/* Line Numbers */}
          <div 
            ref={lineNumbersRef}
            className="flex-shrink-0 w-12 p-2 pl-4 text-right text-light-text-secondary dark:text-dark-text-secondary bg-transparent select-none overflow-hidden"
          >
            {lineNumbers.map((line) => (
              <span key={line} className="block leading-6 h-6">{line}</span>
            ))}
          </div>
          <CustomTextarea
            ref={textareaRef}
            value={activeFile?.content || ''}
            onChange={handleContentChange}
            onPaste={handlePaste}
            className="flex-1 h-full p-2 bg-transparent text-light-text dark:text-dark-text resize-none outline-none border-none scrollbar-auto-hide leading-6"
            placeholder={activeFile ? "Start typing your markdown... (Ctrl+V for images)" : "No file selected"}
          />
        </div>
      </div>
    </div>
  );
};
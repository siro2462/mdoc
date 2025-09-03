import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { FileNode } from '../types';
import { Icon } from './Icon';
import { parseMarkdown } from '../utils/markdown';
import CustomTextarea, { CustomTextareaRef } from './CustomTextarea';

interface EditorPanelProps {
  activeFile: FileNode | null;
  onContentChange: (content: string) => void;
  onSave: (filePath: string, content: string) => Promise<void>;
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
  onSave 
}) => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const textareaRef = useRef<CustomTextareaRef>(null);

  // アクティブファイルが変更されたときにコンテンツを読み込み
  useEffect(() => {
    if (activeFile && activeFile.content) {
      setContent(activeFile.content);
    } else {
      setContent('');
    }
    setLastSaved(null);
  }, [activeFile]);

  // 自動保存機能
  const autoSave = useCallback(async () => {
    if (!activeFile || !content.trim()) return;
    
    try {
      setIsSaving(true);
      await onSave(activeFile.path, content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [activeFile, content, onSave]);

  // コンテンツ変更時の処理
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onContentChange(newContent);
    updateCursorPosition();
    
    // 自動保存（デバウンス）
    const timeoutId = setTimeout(autoSave, 1000);
    return () => clearTimeout(timeoutId);
  };

  // カーソル位置の計算（CustomTextarea用に簡略化）
  const updateCursorPosition = () => {
    // CustomTextareaでは表示用の値でカーソル位置を計算
    const lines = content.split('\n');
    setCursorPosition({ line: lines.length, column: 1 });
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
        const newValue = content + markdownImage;
        handleContentChange(newValue);
      }
    } catch (error) {
      console.error("Image processing failed:", error);
      alert("Failed to process image.");
    }
  }, [content, handleContentChange]);

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

  const lineCount = content.split('\n').length;

  return (
    <div className="flex flex-col flex-grow bg-light-bg dark:bg-dark-bg">
      {/* Tabs - Fixed Header */}
      <div className="flex-shrink-0 bg-light-bg-secondary dark:bg-dark-bg-secondary h-9 flex items-center justify-between sticky top-0 z-10">
        {activeFile && (
          <>
            <div className="inline-flex items-center h-full px-4 bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
              <Icon name="file-text" className="w-4 h-4 mr-2" />
              <span>{activeFile.name}</span>
              {isSaving && (
                <Icon name="loading" className="w-3 h-3 ml-2 animate-spin" />
              )}
              {lastSaved && (
                <span className="ml-2 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex items-center px-2">
              <button 
                className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
                onClick={() => autoSave()}
                disabled={isSaving}
              >
                <Icon name="save" className="w-3 h-3" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Code Editor */}
      <div className="flex-grow flex font-mono text-sm">
        {/* Line Numbers */}
        <div className="w-12 text-right pr-4 py-2 text-light-text-secondary dark:text-dark-text-secondary select-none overflow-hidden">
          {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
            <div key={i} className={cursorPosition.line === i + 1 ? 'bg-light-accent/20 dark:bg-dark-accent/20' : ''}>
              {i + 1}
            </div>
          ))}
        </div>
        
        {/* Code Content */}
        <div className="flex-grow relative">
          <CustomTextarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onPaste={handlePaste}
            className="w-full h-full p-2 bg-transparent text-light-text dark:text-dark-text resize-none outline-none border-none"
            placeholder={activeFile ? "Start typing your markdown... (Ctrl+V for images)" : "No file selected"}
          />
        </div>
      </div>
    </div>
  );
};
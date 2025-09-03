import React, { useCallback, useRef, useState, useEffect } from 'react';
import CustomTextarea, { CustomTextareaRef } from './CustomTextarea';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageInsert?: (imageName: string, base64Data: string) => void;
  onSave?: () => void;
  isAutoSaveEnabled: boolean;
  hasUnsavedChanges: boolean;
}

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



const Editor: React.FC<EditorProps> = ({ value, onChange, onImageInsert, onSave, isAutoSaveEnabled, hasUnsavedChanges }) => {
  const textareaRef = useRef<CustomTextareaRef>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  
  // ローカル値とpropsの値を同期
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Ctrl+Sのキーボードショートカット
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (onSave && !isAutoSaveEnabled) {
        onSave();
      }
    }
  }, [onSave, isAutoSaveEnabled]);
  

  

  
    // ローカルでの変更を管理
  const handleLocalChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };
  
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
          const newValue = localValue + markdownImage;
          onChange(newValue);
        }
        
        // 画像データを親コンポーネントに通知
        if (onImageInsert) {
            onImageInsert(file.name, base64);
        }
    } catch (error) {
        console.error("Image processing failed:", error);
        alert("Failed to process image.");
    }
  }, [localValue, onChange, onImageInsert]);
  
  // クリップボードからの画像貼り付け（より安全な実装）
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageUpload(e.dataTransfer.files[0]);
    }
  };




  return (
    <div className="h-full flex flex-col relative" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
        {isDragging && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center text-white text-2xl font-bold z-10 pointer-events-none">
                Drop image to upload
            </div>
        )}
        {/* 変更状態の表示 */}
        {!isAutoSaveEnabled && hasUnsavedChanges && (
          <div className="absolute top-2 right-2 z-20">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Unsaved changes"></div>
          </div>
        )}
        
        {/* リッチエディタ（画像表示 + テキスト編集） */}
        <div className="flex-grow w-full h-full p-4 font-mono text-sm bg-white dark:bg-[#1e1e1e]">
          <CustomTextarea
            ref={textareaRef}
            value={localValue}
            onChange={handleLocalChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className="w-full h-full p-0 font-mono text-sm bg-transparent outline-none resize-none leading-relaxed tracking-wide text-[#1e1e1e] dark:text-[#d4d4d4]"
            style={{ whiteSpace: 'pre-wrap' }}
            placeholder="Start typing your Markdown here... (Ctrl+V for images)"
          />
        </div>
    </div>
  );
};

export default Editor;

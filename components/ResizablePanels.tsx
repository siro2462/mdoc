import React, { useState, useRef, useCallback, ReactNode } from 'react';

// パネルサイズの定数
const PANEL_CONSTANTS = {
  DEFAULT_LEFT_WIDTH: 10,
  DEFAULT_RIGHT_WIDTH: 45,
  MIN_LEFT_WIDTH: 1,
  MIN_RIGHT_WIDTH: 15,
  MIN_CENTER_WIDTH: 15,
} as const;

interface ResizablePanelsProps {
  children: ReactNode[];
  onScrollSync?: (scrollTop: number) => void;
}

const ResizablePanels: React.FC<ResizablePanelsProps> = ({ children, onScrollSync }) => {
  const [leftWidth, setLeftWidth] = useState(PANEL_CONSTANTS.DEFAULT_LEFT_WIDTH);
  const [rightWidth, setRightWidth] = useState(PANEL_CONSTANTS.DEFAULT_RIGHT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingDivider = useRef<string | null>(null);
  const leftWidthRef = useRef(leftWidth);
  const rightWidthRef = useRef(rightWidth);
  const scrollContainerRef = useRef<HTMLDivElement>(null);



  // スクロール同期ハンドラー
  // エディターとプレビューのスクロール位置を同期するためのコールバック
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (onScrollSync) {
      onScrollSync(e.currentTarget.scrollTop);
    }
  }, [onScrollSync]);

  // stateが変更されたときにrefの値を更新
  // ドラッグ中のパフォーマンス向上のため、refで最新値を保持
  React.useEffect(() => {
    leftWidthRef.current = leftWidth;
  }, [leftWidth]);

  React.useEffect(() => {
    rightWidthRef.current = rightWidth;
  }, [rightWidth]);

  const handleMouseDown = (divider: 'left' | 'right') => {
    draggingDivider.current = divider;
    setIsDragging(true);
  };

  const handleMouseUp = useCallback(() => {
    draggingDivider.current = null;
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingDivider.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left;
    let percentage = (newX / containerRect.width) * 100;
    
    // より細かい制御とスムーズな移動
    if (draggingDivider.current === 'left') {
      const maxLeft = 100 - rightWidthRef.current - PANEL_CONSTANTS.MIN_CENTER_WIDTH;
      const minLeft = PANEL_CONSTANTS.MIN_LEFT_WIDTH;
      percentage = Math.max(minLeft, Math.min(percentage, maxLeft));
      setLeftWidth(percentage);
      leftWidthRef.current = percentage;
    } else { // 'right'
      const newRightWidth = 100 - percentage;
      const maxRight = 100 - leftWidthRef.current - PANEL_CONSTANTS.MIN_CENTER_WIDTH;
      const minRight = PANEL_CONSTANTS.MIN_RIGHT_WIDTH;
      const clampedRight = Math.max(minRight, Math.min(newRightWidth, maxRight));
      setRightWidth(clampedRight);
      rightWidthRef.current = clampedRight;
    }
  }, []);
  
  // ドラッグ状態に応じてマウスイベントリスナーを管理
  // isDraggingを依存関係にすることで、マウスイベントリスナーが正しく追加・削除される
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const middleWidth = 100 - leftWidth - rightWidth;
  
  return (
    <div 
      ref={containerRef} 
      className={`flex h-full w-full overflow-hidden ${isDragging ? 'cursor-col-resize' : ''}`}
    >
      {/* Left Panel */}
      <div style={{ width: `${leftWidth}%` }} className="h-full overflow-hidden">
        {children[0]}
      </div>

      {/* Left Divider - Invisible but functional */}
      <div
        className="w-1 h-full cursor-col-resize bg-light-bg-secondary dark:bg-dark-bg-secondary hover:bg-blue-500 transition-all duration-150 relative group"
        onMouseDown={() => handleMouseDown('left')}
        title="Drag to resize panels"
        style={{ marginLeft: '-1px' }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-0.5 h-8 bg-blue-500 rounded-full"></div>
        </div>
      </div>

      {/* Middle and Right Panels Container */}
      <div 
        ref={scrollContainerRef}
        style={{ width: `${middleWidth + rightWidth}%` }} 
        className="h-full overflow-hidden"
        onScroll={handleScroll}
      >
        <div className="flex h-full">
          {/* Middle Panel */}
          <div 
            style={{ 
              width: `${(middleWidth / (middleWidth + rightWidth)) * 100}%`
            }} 
            className="h-full flex flex-col overflow-hidden"
          >
            {children[1]}
          </div>

          {/* Right Divider - Invisible but functional */}
          <div
            className="w-1 h-full cursor-col-resize bg-light-bg-secondary dark:bg-dark-bg-secondary hover:bg-blue-500 transition-all duration-150 relative group"
            onMouseDown={() => handleMouseDown('right')}
            title="Drag to resize panels"
            style={{ marginLeft: '-1px' }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-0.5 h-8 bg-blue-500 rounded-full"></div>
            </div>
          </div>

          {/* Right Panel */}
          <div 
            style={{ 
              width: `${(rightWidth / (middleWidth + rightWidth)) * 100}%`
            }} 
            className="h-full overflow-y-auto"
          >
            {children[2]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResizablePanels;

import React, { useState, useRef, useCallback, ReactNode, useEffect } from 'react';

interface ResizablePanelsProps {
  children: ReactNode[];
  onScrollSync?: (scrollTop: number) => void;
}

const ResizablePanels: React.FC<ResizablePanelsProps> = ({ children, onScrollSync }) => {
  const [leftWidth, setLeftWidth] = useState(25);
  const [rightWidth, setRightWidth] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingDivider = useRef<string | null>(null);
  const leftWidthRef = useRef(leftWidth);
  const rightWidthRef = useRef(rightWidth);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // スクロール同期ハンドラー
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (onScrollSync) {
      onScrollSync(e.currentTarget.scrollTop);
    }
  }, [onScrollSync]);

  // stateが変更されたときにrefの値を更新
  React.useEffect(() => {
    leftWidthRef.current = leftWidth;
  }, [leftWidth]);

  React.useEffect(() => {
    rightWidthRef.current = rightWidth;
  }, [rightWidth]);

  const handleMouseDown = (divider: 'left' | 'right') => {
    console.log('Mouse down on divider:', divider);
    draggingDivider.current = divider;
    setIsDragging(true);
  };

  const handleMouseUp = useCallback(() => {
    console.log('Mouse up, stopping drag');
    draggingDivider.current = null;
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingDivider.current || !containerRef.current) return;

    console.log('Mouse move, dragging:', draggingDivider.current);
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = e.clientX - containerRect.left;
    let percentage = (newX / containerRect.width) * 100;
    
    console.log('Mouse position:', newX, 'Container width:', containerRect.width, 'Percentage:', percentage);
    
    // より細かい制御とスムーズな移動
    if (draggingDivider.current === 'left') {
        const maxLeft = 100 - rightWidthRef.current - 15; // 中央パネルに最低15%を確保
        const minLeft = 15; // 左パネルの最小幅
        percentage = Math.max(minLeft, Math.min(percentage, maxLeft));
        console.log('Setting left width to:', percentage);
        setLeftWidth(percentage);
        leftWidthRef.current = percentage;
    } else { // 'right'
        const newRightWidth = 100 - percentage;
        const maxRight = 100 - leftWidthRef.current - 15; // 中央パネルに最低15%を確保
        const minRight = 15; // 右パネルの最小幅
        const clampedRight = Math.max(minRight, Math.min(newRightWidth, maxRight));
        console.log('Setting right width to:', clampedRight);
        setRightWidth(clampedRight);
        rightWidthRef.current = clampedRight;
    }
  }, []);
  
  // isDraggingを依存関係にすることで、マウスイベントリスナーが正しく追加・削除される
  React.useEffect(() => {
    if (isDragging) {
        console.log('Adding mouse event listeners');
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mouseleave', handleMouseUp);
    } else {
        console.log('Removing mouse event listeners');
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

      {/* Middle and Right Panels Container with Scroll */}
      <div 
        ref={scrollContainerRef}
        style={{ width: `${middleWidth + rightWidth}%` }} 
        className="h-full overflow-y-auto overflow-x-hidden"
        onScroll={handleScroll}
      >
        <div className="flex h-full">
          {/* Middle Panel */}
          <div style={{ width: `${(middleWidth / (middleWidth + rightWidth)) * 100}%` }} className="h-full flex flex-col">
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
          <div style={{ width: `${(rightWidth / (middleWidth + rightWidth)) * 100}%` }} className="h-full">
            {children[2]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResizablePanels;

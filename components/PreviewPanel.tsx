import React, { useState, useEffect, useRef } from 'react';
import { parseMarkdown } from '../utils/markdown';
import { Icon } from './Icon';

interface PreviewPanelProps {
  content: string;
  isDarkMode: boolean;
  onExportHtml?: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  content, 
  isDarkMode, 
  onExportHtml
}) => {
  const [parsedContent, setParsedContent] = useState('');
  const [toc, setToc] = useState<Array<{ level: number; text: string; id: string }>>([]);
  const [showToc, setShowToc] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // TOCリンククリックハンドラー
  const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Markdownコンテンツが変更されたときにパース
  useEffect(() => {
    try {
      const result = parseMarkdown(content, isDarkMode);
      setParsedContent(result.html);
      setToc(result.toc);
    } catch (error) {
      console.error('Failed to parse markdown:', error);
      setParsedContent('<div class="error">Failed to parse markdown</div>');
    }
  }, [content, isDarkMode]);



  return (
    <aside ref={previewContainerRef} className="w-full h-full bg-light-bg-secondary dark:bg-dark-bg-secondary flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-light-bg-secondary dark:bg-dark-bg-secondary h-9 flex items-center justify-end sticky top-0 z-10 px-4">
        <div className="flex items-center space-x-2">
          {toc.length > 0 && (
            <button
              onClick={() => setShowToc(!showToc)}
              className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
              title="Toggle Table of Contents"
            >
              <Icon name="three-bars" className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
            </button>
          )}
          {onExportHtml && (
            <button
              onClick={onExportHtml}
              className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
              title="Export to HTML"
            >
              <Icon name="export" className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
            </button>
          )}
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Preview Content */}
        <div className="flex-grow bg-light-bg-secondary dark:bg-dark-bg-secondary overflow-y-auto scrollbar-auto-hide">
          <div 
            className="p-4"
            dangerouslySetInnerHTML={{ __html: parsedContent }}
          />
        </div>

        {/* Table of Contents */}
        {showToc && toc.length > 0 && (
          <div className="h-48 border-t border-light-border dark:border-dark-border overflow-y-auto scrollbar-auto-hide bg-light-bg dark:bg-dark-bg flex-shrink-0">
            <div className="p-4">
              <h3 className="text-sm font-semibold mb-2 text-light-text dark:text-dark-text">
                Table of Contents
              </h3>
              <ul className="space-y-1">
                {toc.map((item, index) => (
                  <li key={index}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => handleTocClick(e, item.id)}
                      className="block text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text cursor-pointer"
                      style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
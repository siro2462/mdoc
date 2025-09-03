import React, { useState, useEffect } from 'react';
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
    <aside className="w-full h-full bg-light-bg-secondary dark:bg-dark-bg-secondary flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-light-bg-secondary dark:bg-dark-bg-secondary h-9 flex items-center justify-between sticky top-0 z-10 px-4">
        <h2 className="text-xs uppercase font-bold text-light-text-secondary dark:text-dark-text-secondary">
          Preview
        </h2>
        <div className="flex items-center space-x-2">
          {toc.length > 0 && (
            <button
              onClick={() => setShowToc(!showToc)}
              className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
              title="Toggle Table of Contents"
            >
              <Icon name="list" className="w-3 h-3" />
            </button>
          )}
          {onExportHtml && (
            <button
              onClick={onExportHtml}
              className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
              title="Export to HTML"
            >
              <Icon name="download" className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow flex">
        {/* Table of Contents */}
        {showToc && toc.length > 0 && (
          <div className="w-48 border-r border-light-border dark:border-dark-border overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold mb-2 text-light-text dark:text-dark-text">
                Table of Contents
              </h3>
              <ul className="space-y-1">
                {toc.map((item, index) => (
                  <li key={index}>
                    <a
                      href={`#${item.id}`}
                      className="block text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text"
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

        {/* Preview Content */}
        <div className="flex-grow bg-light-bg-secondary dark:bg-dark-bg-secondary">
          <div 
            className="p-4"
            dangerouslySetInnerHTML={{ __html: parsedContent }}
          />
        </div>
      </div>
    </aside>
  );
};
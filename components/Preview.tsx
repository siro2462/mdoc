import React, { useEffect, useState, useRef } from 'react';
import { parseAndSanitizeMarkdown } from '../utils/markdownProcessor.ts';

interface PreviewProps {
  content: string;
  isDarkMode: boolean;
  imageData?: Map<string, string>;
}

export const getQiitaStyle = (isDarkMode: boolean) => {
    const light = {
        bg: '#ffffff',
        text: '#1e1e1e',
        heading: '#1e1e1e',
        link: '#0066cc',
        border: '#d4d4d4',
        codeBg: '#f3f3f3',
        codeText: '#1e1e1e',
        preBg: '#f3f3f3',
        preText: '#1e1e1e',
        blockquoteText: '#6a737d',
        blockquoteBorder: '#d4d4d4',
        tableHeaderBg: '#f3f3f3',
    };
    const dark = {
        bg: '#1e1e1e',
        text: '#d4d4d4',
        heading: '#ffffff',
        link: '#4fc1ff',
        border: '#3c3c3c',
        codeBg: '#2d2d2d',
        codeText: '#d4d4d4',
        preBg: '#2d2d2d',
        preText: '#d4d4d4',
        blockquoteText: '#a0a0a0',
        blockquoteBorder: '#3c3c3c',
        tableHeaderBg: '#2d2d2d',
    };
    const theme = isDarkMode ? dark : light;
    return `
    .qiita-body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "Hiragino Kaku Gothic ProN", "メイリオ", meiryo, sans-serif;
        font-size: 16px;
        line-height: 1.7;
        color: ${theme.text};
        background-color: ${theme.bg};
    }
    .qiita-body h1, .qiita-body h2, .qiita-body h3, .qiita-body h4, .qiita-body h5, .qiita-body h6 {
        color: ${theme.heading};
        font-weight: 600;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        border-bottom: 1px solid ${theme.border};
        padding-bottom: 0.3em;
    }
    .qiita-body h1 { font-size: 2em; }
    .qiita-body h2 { font-size: 1.5em; }
    .qiita-body h3 { font-size: 1.25em; }
    .qiita-body a {
        color: ${theme.link};
        text-decoration: none;
    }
    .qiita-body a:hover { text-decoration: underline; }
    .qiita-body p { margin: 1em 0; }
    .qiita-body ul, .qiita-body ol { margin: 1em 0; padding-left: 2em; }
    .qiita-body li { margin: 0.4em 0; }
    .qiita-body code {
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
        background-color: ${theme.codeBg};
        color: ${theme.codeText};
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-size: 85%;
    }
    .qiita-body pre {
        background-color: ${theme.preBg};
        color: ${theme.preText};
        padding: 1em;
        border-radius: 6px;
        overflow-x: auto;
    }
    .qiita-body pre code {
        background-color: transparent;
        padding: 0;
    }
    .qiita-body blockquote {
        border-left: 0.25em solid ${theme.blockquoteBorder};
        padding: 0 1em;
        color: ${theme.blockquoteText};
        margin: 1em 0;
    }
    .qiita-body table {
        border-collapse: collapse;
        margin: 1em 0;
        display: block;
        width: 100%;
        overflow: auto;
    }
    .qiita-body th, .qiita-body td {
        border: 1px solid ${theme.border};
        padding: 0.6em 1em;
    }
    .qiita-body th {
        background-color: ${theme.tableHeaderBg};
        font-weight: 600;
    }
    .qiita-body img { max-width: 100%; height: auto; }
    .qiita-body hr { border: 0; border-top: 1px solid ${theme.border}; margin: 1.5em 0; }
    .qiita-body .task-list-item { list-style-type: none; }
    .qiita-body .task-list-item-checkbox { margin: 0 0.2em 0.25em -1.6em; vertical-align: middle; }
    `;
};

const Preview: React.FC<PreviewProps> = ({ content, isDarkMode, imageData }) => {
  const [html, setHtml] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    let isMounted = true;
    const renderMarkdown = async () => {
      try {
        let processedContent = content;
        
        // 画像の省略表示を実際のbase64データに置換（既存の処理）
        if (imageData && imageData.size > 0) {
          imageData.forEach((base64Data, imageName) => {
            const placeholder = `![${imageName}](data:image/*;base64,...)`;
            const actualImage = `![${imageName}](${base64Data})`;
            processedContent = processedContent.replace(placeholder, actualImage);
          });
        }
        
        const processedHtml = await parseAndSanitizeMarkdown(processedContent);
        if (isMounted) {
          setHtml(processedHtml);
        }
      } catch (error) {
        console.error("Failed to parse markdown:", error);
        if (isMounted) {
          setHtml("<p>Error rendering Markdown.</p>");
        }
      }
    };

    renderMarkdown();
    
    return () => { isMounted = false };
  }, [content, imageData]);

  useEffect(() => {
    // Scope highlighting to the preview container for efficiency
    if (previewRef.current && window.hljs) {
        const codeBlocks = previewRef.current.querySelectorAll('pre code');
        codeBlocks.forEach((block) => {
            window.hljs.highlightElement(block as HTMLElement);
        });
    }
  }, [html]);

  return (
    <div className="h-full bg-[#fafafa] dark:bg-[#1e1e1e] p-1 overflow-auto">
      <style>{getQiitaStyle(isDarkMode)}</style>
      <div 
        ref={previewRef}
        className="qiita-body p-4 md:p-6 max-w-none min-h-full"
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    </div>
  );
};

export default Preview;

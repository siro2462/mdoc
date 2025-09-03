import React from 'react';
import { SunIcon, MoonIcon, FolderOpenIcon, DownloadIcon } from './icons.tsx';
import { File as FileType } from '../types.ts';
import { getQiitaStyle } from './Preview.tsx';
import { parseAndSanitizeMarkdown } from '../utils/markdownProcessor.ts';

interface ToolbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isAutoSaveEnabled: boolean;
  toggleAutoSave: () => void;
  activeFile: FileType | null;
  editorContent: string;
  imageData: Map<string, string>;
  projectPath: string | null;
}

const Toolbar: React.FC<ToolbarProps> = ({ isDarkMode, toggleDarkMode, isAutoSaveEnabled, toggleAutoSave, activeFile, editorContent, imageData, projectPath }) => {

  const handleExportHtml = async () => {
    if (!activeFile) return;

    try {
        // エディタの内容をそのまま使用（Base64は既に含まれている）
        const processedContent = editorContent;
        const contentHtml = await parseAndSanitizeMarkdown(processedContent);
        const qiitaStyles = getQiitaStyle(isDarkMode);

        const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${activeFile.name}</title>
            <style>
              ${qiitaStyles}
              body {
                margin: 0;
                padding: 0;
                background-color: ${isDarkMode ? '#1e1e1e' : '#ffffff'};
                color: ${isDarkMode ? '#d4d4d4' : '#1e1e1e'};
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
                line-height: 1.6;
              }
              .qiita-body {
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
              }
              @media (max-width: 768px) {
                .qiita-body {
                  padding: 1rem;
                }
              }
            </style>
          </head>
          <body>
            <div class="qiita-body">${contentHtml}</div>
          </body>
          </html>
        `;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeFile.name.replace(/\.md$/, '')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export HTML:", error);
        alert("An error occurred while exporting to HTML.");
    }
  };

  return (
    <header className="flex items-center justify-between p-2 bg-white dark:bg-[#2d2d2d] border-b border-[#d4d4d4] dark:border-[#3c3c3c] shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-[#1e1e1e] dark:text-[#ffffff]">MDoc</h1>
          {projectPath && (
            <span className="text-xs text-[#6a737d] dark:text-[#a0a0a0] truncate max-w-48" title={projectPath}>
              {projectPath}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {/* 自動保存トグル */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#1e1e1e] dark:text-[#d4d4d4]">Auto Save</span>
            <button
              onClick={toggleAutoSave}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                isAutoSaveEnabled 
                  ? 'bg-blue-600' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              title={isAutoSaveEnabled ? "Auto Save: ON" : "Auto Save: OFF"}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  isAutoSaveEnabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <button 
            onClick={handleExportHtml}
            disabled={!activeFile}
            className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
            title="Export as single HTML file"
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export HTML
          </button>
          <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-[#f3f3f3] dark:hover:bg-[#3c3c3c] transition-colors" title="Toggle Dark Mode">
            {isDarkMode ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-gray-600" />}
          </button>
        </div>
      </header>
  );
};

export default Toolbar;

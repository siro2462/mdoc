import React from 'react';
import { Icon } from './Icon';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  onOpenProject?: () => void;
  onExportHtml?: () => void;
  activeFile?: string | null;
  projectPath?: string;
  isAutoSaveEnabled?: boolean;
  toggleAutoSave?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  theme, 
  toggleTheme, 
  onOpenProject,
  onExportHtml,
  activeFile,
  projectPath,
  isAutoSaveEnabled,
  toggleAutoSave
}) => {
  // プロジェクトフォルダ名を取得
  const projectName = projectPath ? projectPath.split(/[/\\]/).pop() || projectPath : '';
  
  // 中央のタイトルを構築
  const centerTitle = activeFile && projectName 
    ? `${activeFile} - ${projectName} - MDoc`
    : projectName 
    ? `${projectName} - MDoc`
    : 'MDoc';

  return (
    <header className="flex items-center justify-between h-7 bg-light-bg-tertiary dark:bg-dark-bg-tertiary px-4" style={{ WebkitAppRegion: 'drag' }}>
      {/* 左端のアイコン */}
      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
        <Icon name="markdown" className="w-3.5 h-3.5 text-light-text dark:text-dark-text" />
      </div>
      
      {/* 中央のタイトル */}
      <div className="flex-1 flex justify-center">
        <h1 className="text-sm text-light-text dark:text-dark-text truncate">
          {centerTitle}
        </h1>
      </div>
      
      {/* 右側のボタン */}
      <div className="flex items-center space-x-2" style={{ WebkitAppRegion: 'no-drag' }}>
        {onOpenProject && (
          <button
            onClick={onOpenProject}
            className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
            title="Open Project Folder"
          >
            <Icon name="folder-opened" className="w-3.5 h-3.5" />
          </button>
        )}
        
        {onExportHtml && activeFile && (
          <button
            onClick={onExportHtml}
            className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
            title="Export to HTML"
          >
            <Icon name="export" className="w-3.5 h-3.5" />
          </button>
        )}
        
        {toggleAutoSave && (
          <button
            onClick={toggleAutoSave}
            className={`p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors ${isAutoSaveEnabled ? 'text-green-500' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}
            title={`${isAutoSaveEnabled ? 'Disable' : 'Enable'} Auto Save`}
          >
            <Icon name="save" className="w-3.5 h-3.5" />
          </button>
        )}
        
        <button
          onClick={toggleTheme}
          className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
          title={`Switch to ${theme === Theme.LIGHT ? 'Dark' : 'Light'} Mode`}
        >
          <Icon name="color-mode" className="w-3.5 h-3.5" />
        </button>
        
        {/* ウィンドウコントロールボタン */}
        {window.electronAPI && (
          <div className="flex items-center ml-4 space-x-1">
            <button
              onClick={() => window.electronAPI.minimizeWindow()}
              className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
              title="Minimize"
            >
              <Icon name="chrome-minimize" className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.electronAPI.maximizeWindow()}
              className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
              title="Maximize"
            >
              <Icon name="chrome-maximize" className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.electronAPI.closeWindow()}
              className="p-1 rounded hover:bg-red-500 hover:text-white transition-colors"
              title="Close"
            >
              <Icon name="chrome-close" className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Icon } from './Icon';
import type { FileNode } from '../types';
import { FileType } from '../types';

interface FileExplorerProps {
  files: FileNode[];
  activeFile: FileNode | null;
  onFileSelect: (file: FileNode) => void;
  onOpenProject?: () => void;
  onCreateFolder?: () => void;
  onCreateFile?: () => void;
  projectPath?: string;
}

const getIconForFile = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  const iconMap: { [key: string]: string } = {
    'js': 'file',
    'ts': 'file',
    'jsx': 'file',
    'tsx': 'file',
    'json': 'file',
    'css': 'file',
    'html': 'file',
    'md': 'markdown',
    'txt': 'file',
  };
  
  return iconMap[extension] || 'file'; 
};

const FileTreeNode: React.FC<{
  node: FileNode;
  activeFile: FileNode | null;
  onFileSelect: (file: FileNode) => void;
  level: number;
}> = ({ node, activeFile, onFileSelect, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === 'directory';

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node);
    }
  };

  const isActive = activeFile?.id === node.id;
  const itemBg = isActive
    ? 'bg-light-accent/20 dark:bg-dark-accent/20'
    : '';
  const itemTextColor = isActive
    ? 'text-light-accent dark:text-dark-accent'
    : 'text-light-text-secondary dark:text-dark-text-secondary';

  return (
    <>
      <div
        onClick={handleToggle}
        className={`flex items-center cursor-pointer px-2 py-1 rounded ${itemBg} ${itemTextColor} hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary`}
      >
        {/* インデント用スペーサー */}
        <div style={{ width: `${level * 16}px` }} />

        {/* アイコンエリア（固定幅） */}
        <div className="w-4 h-4 mr-2 flex items-center justify-center">
          {isFolder ? (
            <Icon
              name={isOpen ? 'chevron-down' : 'chevron-right'}
              className="w-3 h-3 text-light-text-secondary dark:text-dark-text-secondary"
            />
          ) : (
            <Icon name={getIconForFile(node.name)} className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
          )}
        </div>

        {/* ファイル名 */}
        <span className="truncate text-xs">{node.name}</span>
      </div>
      {isFolder && isOpen && node.children && (
        <div className="overflow-hidden transition-all duration-200 ease-in-out">
          {node.children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, 
  activeFile, 
  onFileSelect, 
  onOpenProject,
  onCreateFolder,
  onCreateFile,
  projectPath 
}) => {
  return (
    <aside className="w-full h-full bg-light-bg-secondary dark:bg-dark-bg-secondary flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-2">
        <div className="text-xs uppercase text-light-text-secondary dark:text-dark-text-secondary font-bold">
          Explorer
        </div>
        <div className="flex items-center space-x-1">
          {onCreateFolder && (
            <button
              onClick={onCreateFolder}
              className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
              title="New Folder"
            >
              <Icon name="new-folder" className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
            </button>
          )}
          {onCreateFile && (
            <button
              onClick={onCreateFile}
              className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
              title="New File"
            >
              <Icon name="new-file" className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
            </button>
          )}
          {onOpenProject && (
            <button
              onClick={onOpenProject}
              className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
              title="Open Project Folder"
            >
              <Icon name="folder-opened" className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
            </button>
          )}
        </div>
      </div>

      {/* Project Path */}
      {projectPath && (
        <div className="px-2 py-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
          <div className="truncate" title={projectPath}>
            {projectPath.split(/[/\\]/).pop() || projectPath}
          </div>
        </div>
      )}

      {/* File Tree */}
      <div className="flex-grow overflow-y-auto scrollbar-auto-hide p-2">
        {files.length === 0 ? (
          <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
            <Icon name="folder-opened" className="w-12 h-12 mx-auto mb-2 opacity-50 text-light-text-secondary dark:text-dark-text-secondary" />
            <p className="text-xs">No project folder opened</p>
            {onOpenProject && (
              <button
                onClick={onOpenProject}
                className="mt-2 px-3 py-1 text-xs bg-light-accent dark:bg-dark-accent text-white rounded hover:bg-light-accent/80 dark:hover:bg-dark-accent/80"
              >
                Open Folder
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {files.map((file) => (
              <FileTreeNode 
                key={file.id} 
                node={file} 
                activeFile={activeFile} 
                onFileSelect={onFileSelect} 
                level={0} 
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

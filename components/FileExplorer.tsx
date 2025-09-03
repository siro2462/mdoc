import React, { useState } from 'react';
import { Icon } from './Icon';
import type { FileNode } from '../types';
import { FileType } from '../types';

interface FileExplorerProps {
  files: FileNode[];
  activeFile: FileNode | null;
  onFileSelect: (file: FileNode) => void;
  onOpenProject?: () => void;
  projectPath?: string;
}

const FileTreeNode: React.FC<{
  node: FileNode;
  activeFile: FileNode | null;
  onFileSelect: (file: FileNode) => void;
  level: number;
}> = ({ node, activeFile, onFileSelect, level }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isFolder = node.type === FileType.FOLDER;

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
    : 'hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary';
  const itemTextColor = isActive
    ? 'text-light-accent dark:text-dark-accent'
    : 'text-light-text-secondary dark:text-dark-text-secondary';

  const getIconName = () => {
    if (isFolder) {
      return isOpen ? 'folder-open' : 'folder';
    }
    return node.name.endsWith('.md') ? 'file-text' : 'file';
  };

  return (
    <>
      <div
        onClick={handleToggle}
        className={`flex items-center cursor-pointer px-2 py-1 rounded ${itemBg} ${itemTextColor}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {isFolder ? (
          <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} className="w-3 h-3 mr-1 flex-shrink-0" />
        ) : (
          <div className="w-3 mr-1"></div> // Placeholder for alignment
        )}
        <Icon name={getIconName()} className="w-4 h-4 mr-2 flex-shrink-0" />
        <span className="truncate text-xs">{node.name}</span>
      </div>
      {isFolder && isOpen && node.children && (
        <div>
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
  projectPath 
}) => {
  return (
    <aside className="w-full h-full bg-light-bg-secondary dark:bg-dark-bg-secondary flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-2">
        <div className="text-xs uppercase text-light-text-secondary dark:text-dark-text-secondary font-bold">
          Explorer
        </div>
        {onOpenProject && (
          <button
            onClick={onOpenProject}
            className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
            title="Open Project Folder"
          >
            <Icon name="folder-plus" className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Project Path */}
      {projectPath && (
        <div className="px-2 py-1 text-xs text-light-text-secondary dark:text-dark-text-secondary">
          <div className="truncate" title={projectPath}>
            📁 {projectPath.split(/[/\\]/).pop() || projectPath}
          </div>
        </div>
      )}

      {/* File Tree */}
      <div className="flex-grow overflow-y-auto p-2">
        {files.length === 0 ? (
          <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
            <Icon name="folder" className="w-8 h-8 mx-auto mb-2 opacity-50" />
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

import React, { useState } from 'react';
import { FileSystemNode, File as FileType } from '../types.ts';
import { FolderIcon, FolderOpenIcon, FileIcon, ChevronRightIcon, ChevronDownIcon, NewFileIcon, NewFolderIcon, RefreshIcon } from './icons.tsx';

interface FileTreeProps {
  nodes: FileSystemNode[];
  onFileSelect: (file: FileType) => void;
  activeFileId: string | null;
  onRefresh?: () => void;
  onCreateFile?: (parentPath?: string) => void;
  onCreateFolder?: (parentPath?: string) => void;
}

const Node: React.FC<{ node: FileSystemNode; onFileSelect: (file: FileType) => void; activeFileId: string | null; level: number }> = ({ node, onFileSelect, activeFileId, level }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (node.type === 'directory') {
    return (
      <div>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center cursor-pointer p-1.5 hover:bg-[#f3f3f3] dark:hover:bg-[#2d2d2d] rounded"
          style={{ paddingLeft: `${level * 1.25}rem` }}
        >
          {/* 展開/折りたたみアイコン */}
          <div className="w-4 h-4 mr-1 flex items-center justify-center">
            {isOpen ? (
              <ChevronDownIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRightIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          {/* フォルダアイコン */}
          {isOpen ? <FolderOpenIcon className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" /> : <FolderIcon className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />}
          <span className="font-medium text-sm">{node.name}</span>
        </div>
        {isOpen && node.children && (
          <div>
            {node.children.map((child) => (
              <Node key={child.id} node={child} onFileSelect={onFileSelect} activeFileId={activeFileId} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  } else { // File
    const isActive = node.id === activeFileId;
    return (
      <div
        onClick={() => onFileSelect(node)}
        className={`flex items-center cursor-pointer p-1.5 rounded ${isActive ? 'bg-[#007acc] dark:bg-[#007acc]' : 'hover:bg-[#f3f3f3] dark:hover:bg-[#2d2d2d]'}`}
        style={{ paddingLeft: `${level * 1.25}rem` }}
      >
        {/* ファイルの場合は矢印アイコンのスペースを確保 */}
        <div className="w-4 h-4 mr-1"></div>
        <FileIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
        <span className={`text-sm ${isActive ? 'font-semibold text-white' : ''}`}>{node.name}</span>
      </div>
    );
  }
};

const FileTree: React.FC<FileTreeProps> = ({ nodes, onFileSelect, activeFileId, onRefresh, onCreateFile, onCreateFolder }) => {
  console.log('FileTree render - nodes:', nodes);
  console.log('FileTree render - nodes count:', nodes.length);
  
  return (
    <div className="h-full bg-[#f3f3f3] dark:bg-[#252526] border-r border-[#d4d4d4] dark:border-[#3c3c3c] flex flex-col">
      {/* ツールバー */}
      <div className="p-2 border-b border-[#d4d4d4] dark:border-[#3c3c3c] bg-[#e3e3e3] dark:bg-[#2d2d2d] flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onCreateFile && onCreateFile()}
            className="p-1.5 rounded hover:bg-[#e3e3e3] dark:hover:bg-[#3c3c3c] transition-colors"
            title="New File"
          >
            <NewFileIcon className="w-4 h-4 text-[#1e1e1e] dark:text-[#d4d4d4]" />
          </button>
          <button
            onClick={() => onCreateFolder && onCreateFolder()}
            className="p-1.5 rounded hover:bg-[#e3e3e3] dark:hover:bg-[#3c3c3c] transition-colors"
            title="New Folder"
          >
            <NewFolderIcon className="w-4 h-4 text-[#1e1e1e] dark:text-[#d4d4d4]" />
          </button>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded hover:bg-[#e3e3e3] dark:hover:bg-[#3c3c3c] transition-colors"
          >
            <RefreshIcon className="w-4 h-4 text-[#1e1e1e] dark:text-[#d4d4d4]" />
          </button>
      </div>
      
      {/* ファイルツリー */}
      <div className="flex-1 p-2 overflow-hidden bg-[#f3f3f3] dark:bg-[#252526]">
        {nodes.length === 0 ? (
          <div className="text-[#6a737d] dark:text-[#a0a0a0] text-sm p-4 text-center">
            No files found. Open a project folder to get started.
          </div>
        ) : (
          nodes.map((node) => (
            <Node key={node.id} node={node} onFileSelect={onFileSelect} activeFileId={activeFileId} level={0} />
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(FileTree);

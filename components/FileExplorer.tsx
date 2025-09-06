import React, { useState, useRef } from 'react';
import { Icon } from './Icon';
import { InlineEdit } from './InlineEdit';
import type { FileNode } from '../types';
import { FileType } from '../types';

interface FileExplorerProps {
  files: FileNode[];
  activeFile: FileNode | null;
  onFileSelect: (file: FileNode) => void;
  onOpenProject?: () => void;
  onCreateFolder?: () => void;
  onCreateFile?: () => void;
  onCreateFolderInPath?: (folderName: string, parentPath: string) => Promise<void>;
  onCreateFileInPath?: (fileName: string, parentPath: string) => Promise<void>;
  onCreateFileInSameDirectory?: (fileName: string, filePath: string) => Promise<void>;
  onRefresh?: () => void;
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
  onCreateFolderInPath?: (folderName: string, parentPath: string) => Promise<void>;
  onCreateFileInPath?: (fileName: string, parentPath: string) => Promise<void>;
  onCreateFileInSameDirectory?: (fileName: string, filePath: string) => Promise<void>;
  level: number;
}> = ({ node, activeFile, onFileSelect, onCreateFolderInPath, onCreateFileInPath, onCreateFileInSameDirectory, level }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const isFolder = node.type === 'directory';

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node);
    }
  };

  const handleCreateFolder = () => {
    if (onCreateFolderInPath && isFolder && !isCreatingFolder && !isCreatingFile) {
      setIsCreatingFolder(true);
    }
  };

  const handleCreateFile = () => {
    if (onCreateFileInPath && isFolder && !isCreatingFolder && !isCreatingFile) {
      setIsCreatingFile(true);
    }
  };

  const handleFolderConfirm = async (folderName: string) => {
    if (onCreateFolderInPath) {
      try {
        // VSCode仕様: 空の名前でもそのまま作成
        await onCreateFolderInPath(folderName.trim(), node.path);
        // 新しく作成されたフォルダは自動的に開かない
        // setIsOpen(true); を削除
      } catch (error) {
        console.error('Failed to create folder:', error);
        // エラーが発生した場合も編集モードを終了（ロック状態を防ぐ）
      }
    }
    setIsCreatingFolder(false);
  };

  const handleFileConfirm = async (fileName: string) => {
    if (onCreateFileInPath) {
      try {
        // VSCode仕様: 空の名前でもそのまま作成
        const trimmedName = fileName.trim();
        // ファイル名に.md拡張子を強制的に追加（空の名前の場合は.mdのみ）
        const fileNameWithExt = trimmedName.endsWith('.md') ? trimmedName : `${trimmedName}.md`;
        await onCreateFileInPath(fileNameWithExt, node.path);
      } catch (error) {
        console.error('Failed to create file:', error);
        // エラーが発生した場合も編集モードを終了（ロック状態を防ぐ）
      }
    }
    setIsCreatingFile(false);
  };

  const handleCancel = () => {
    setIsCreatingFolder(false);
    setIsCreatingFile(false);
  };

  const isActive = activeFile?.id === node.id;
  const itemBg = isActive
    ? 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary'
    : '';
  const itemTextColor = isActive
    ? 'text-light-text dark:text-dark-text font-medium'
    : 'text-light-text-secondary dark:text-dark-text-secondary';

  return (
    <>
      <div
        onClick={handleToggle}
        className={`flex items-center cursor-pointer px-1 py-0.5 ${itemBg} ${itemTextColor} hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors duration-150`}
      >
        {/* インデント用スペーサー */}
        <div style={{ width: `${level * 16}px` }} />

        {/* アイコンエリア（固定幅） */}
        <div className="w-4 h-4 mr-2 flex items-center justify-center">
          {isFolder ? (
            <Icon
              name={isOpen ? 'chevron-down' : 'chevron-right'}
              className={`w-3 h-3 ${isActive ? 'text-light-text dark:text-dark-text' : 'text-light-text-secondary dark:text-dark-text-secondary'}`}
            />
          ) : (
            <Icon 
              name={getIconForFile(node.name)} 
              className={`w-4 h-4 ${isActive ? 'text-light-text dark:text-dark-text' : 'text-light-text-secondary dark:text-dark-text-secondary'}`} 
            />
          )}
        </div>

        {/* ファイル名またはインライン編集 */}
        {isCreatingFolder ? (
          <InlineEdit
            initialValue=""
            placeholder="フォルダ名を入力"
            onConfirm={handleFolderConfirm}
            onCancel={handleCancel}
            className="text-xs"
          />
        ) : isCreatingFile ? (
          <InlineEdit
            initialValue=""
            placeholder="ファイル名を入力（.mdは自動追加）"
            onConfirm={handleFileConfirm}
            onCancel={handleCancel}
            className="text-xs"
          />
        ) : (
          <span className="truncate text-xs">{node.name}</span>
        )}
      </div>
      

      {isFolder && isOpen && node.children && (
        <div className="overflow-hidden transition-all duration-200 ease-in-out">
          {node.children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              onCreateFolderInPath={onCreateFolderInPath}
              onCreateFileInPath={onCreateFileInPath}
              onCreateFileInSameDirectory={onCreateFileInSameDirectory}
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
  onCreateFolderInPath,
  onCreateFileInPath,
  onCreateFileInSameDirectory,
  onRefresh,
  projectPath 
}) => {
  const [isCreatingRootFolder, setIsCreatingRootFolder] = useState(false);
  const [isCreatingRootFile, setIsCreatingRootFile] = useState(false);
  const [isCreatingFileInSameDir, setIsCreatingFileInSameDir] = useState(false);
  const lastClickTimeRef = useRef<number>(0);

  const handleRootFolderConfirm = async (folderName: string) => {
    if (onCreateFolderInPath && projectPath) {
      try {
        // VSCode仕様: 空の名前でもそのまま作成
        await onCreateFolderInPath(folderName.trim(), projectPath);
      } catch (error) {
        console.error('Failed to create root folder:', error);
        // エラーが発生した場合も編集モードを終了（ロック状態を防ぐ）
      }
    }
    setIsCreatingRootFolder(false);
  };

  const handleRootFileConfirm = async (fileName: string) => {
    if (onCreateFileInPath && projectPath) {
      try {
        // VSCode仕様: 空の名前でもそのまま作成
        const trimmedName = fileName.trim();
        // ファイル名に.md拡張子を強制的に追加（空の名前の場合は.mdのみ）
        const fileNameWithExt = trimmedName.endsWith('.md') ? trimmedName : `${trimmedName}.md`;
        await onCreateFileInPath(fileNameWithExt, projectPath);
      } catch (error) {
        console.error('Failed to create root file:', error);
        // エラーが発生した場合も編集モードを終了（ロック状態を防ぐ）
      }
    }
    setIsCreatingRootFile(false);
  };

  const handleSameDirFileConfirm = async (fileName: string) => {
    if (onCreateFileInSameDirectory && activeFile) {
      try {
        // VSCode仕様: 空の名前でもそのまま作成
        const trimmedName = fileName.trim();
        // ファイル名に.md拡張子を強制的に追加（空の名前の場合は.mdのみ）
        const fileNameWithExt = trimmedName.endsWith('.md') ? trimmedName : `${trimmedName}.md`;
        await onCreateFileInSameDirectory(fileNameWithExt, activeFile.path);
      } catch (error) {
        console.error('Failed to create file in same directory:', error);
        // エラーが発生した場合も編集モードを終了（ロック状態を防ぐ）
      }
    }
    setIsCreatingFileInSameDir(false);
  };

  const handleRootCancel = () => {
    setIsCreatingRootFolder(false);
    setIsCreatingRootFile(false);
    setIsCreatingFileInSameDir(false);
  };
  return (
    <aside className="w-full h-full bg-light-bg-secondary dark:bg-dark-bg-secondary flex flex-col group">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-0.5">
        {/* Project Path */}
        {projectPath && (
          <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            <div className="truncate" title={projectPath}>
              {projectPath.split(/[/\\]/).pop() || projectPath}
            </div>
          </div>
        )}
        
        {/* Buttons */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onCreateFolderInPath && (
            <button
              onClick={() => {
                const now = Date.now();
                // デバウンス: 500ms以内の連続クリックを無視
                if (now - lastClickTimeRef.current < 500) return;
                lastClickTimeRef.current = now;
                
                // VSCode仕様: 既にフォルダ作成モードがアクティブな場合は何もしない（入力画面をそのまま表示）
                // 他の作成モードがアクティブな場合は何もしない
                if (isCreatingRootFile || isCreatingFileInSameDir) return;
                
                // フォルダ作成モードを開始（既にアクティブな場合は何もしない）
                if (!isCreatingRootFolder) {
                  setIsCreatingRootFolder(true);
                }
              }}
              disabled={isCreatingRootFile || isCreatingFileInSameDir}
              className={`p-1 rounded transition-colors ${
                isCreatingRootFile || isCreatingFileInSameDir
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
              }`}
              title="New Folder"
            >
              <Icon name="new-folder" className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
            </button>
          )}
          {activeFile && onCreateFileInSameDirectory ? (
            <button
              onClick={() => {
                const now = Date.now();
                // デバウンス: 500ms以内の連続クリックを無視
                if (now - lastClickTimeRef.current < 500) return;
                lastClickTimeRef.current = now;
                
                // VSCode仕様: 既に同じディレクトリファイル作成モードがアクティブな場合は何もしない（入力画面をそのまま表示）
                // 他の作成モードがアクティブな場合は何もしない
                if (isCreatingRootFolder || isCreatingRootFile) return;
                
                // 同じディレクトリファイル作成モードを開始（既にアクティブな場合は何もしない）
                if (!isCreatingFileInSameDir) {
                  setIsCreatingFileInSameDir(true);
                }
              }}
              disabled={isCreatingRootFolder || isCreatingRootFile}
              className={`p-1 rounded transition-colors ${
                isCreatingRootFolder || isCreatingRootFile
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
              }`}
              title="New File in Same Directory"
            >
              <Icon name="new-file" className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
            </button>
          ) : onCreateFileInPath ? (
            <button
              onClick={() => {
                const now = Date.now();
                // デバウンス: 500ms以内の連続クリックを無視
                if (now - lastClickTimeRef.current < 500) return;
                lastClickTimeRef.current = now;
                
                // VSCode仕様: 既にルートファイル作成モードがアクティブな場合は何もしない（入力画面をそのまま表示）
                // 他の作成モードがアクティブな場合は何もしない
                if (isCreatingRootFolder || isCreatingFileInSameDir) return;
                
                // ルートファイル作成モードを開始（既にアクティブな場合は何もしない）
                if (!isCreatingRootFile) {
                  setIsCreatingRootFile(true);
                }
              }}
              disabled={isCreatingRootFolder || isCreatingFileInSameDir}
              className={`p-1 rounded transition-colors ${
                isCreatingRootFolder || isCreatingFileInSameDir
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary'
              }`}
              title="New File"
            >
              <Icon name="new-file" className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
            </button>
          ) : null}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary"
              title="Refresh"
            >
              <Icon name="refresh" className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary" />
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

      {/* File Tree */}
      <div className="flex-grow overflow-y-auto scrollbar-auto-hide px-2">
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
          <div className="space-y-0">
            {/* Root level inline editing */}
            {isCreatingRootFolder && (
              <div className="flex items-center px-1 py-0.5">
                <div className="w-4 h-4 mr-2 flex items-center justify-center">
                  <Icon name="chevron-right" className="w-3 h-3 text-light-text-secondary dark:text-dark-text-secondary" />
                </div>
                <InlineEdit
                  initialValue=""
                  placeholder="フォルダ名を入力"
                  onConfirm={handleRootFolderConfirm}
                  onCancel={handleRootCancel}
                  className="text-xs"
                />
              </div>
            )}
            
            {isCreatingRootFile && (
              <div className="flex items-center px-1 py-0.5">
                <div className="w-4 h-4 mr-2 flex items-center justify-center">
                  <Icon name="chevron-right" className="w-3 h-3 text-light-text-secondary dark:text-dark-text-secondary" />
                </div>
                <InlineEdit
                  initialValue=""
                  placeholder="ファイル名を入力（.mdは自動追加）"
                  onConfirm={handleRootFileConfirm}
                  onCancel={handleRootCancel}
                  className="text-xs"
                />
              </div>
            )}
            
            {isCreatingFileInSameDir && (
              <div className="flex items-center px-1 py-0.5">
                <div className="w-4 h-4 mr-2 flex items-center justify-center">
                  <Icon name="chevron-right" className="w-3 h-3 text-light-text-secondary dark:text-dark-text-secondary" />
                </div>
                <InlineEdit
                  initialValue=""
                  placeholder="ファイル名を入力（.mdは自動追加）"
                  onConfirm={handleSameDirFileConfirm}
                  onCancel={handleRootCancel}
                  className="text-xs"
                />
              </div>
            )}
            
            {files.map((file) => (
              <FileTreeNode 
                key={file.id} 
                node={file} 
                activeFile={activeFile} 
                onFileSelect={onFileSelect}
                onCreateFolderInPath={onCreateFolderInPath}
                onCreateFileInPath={onCreateFileInPath}
                onCreateFileInSameDirectory={onCreateFileInSameDirectory}
                level={0}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

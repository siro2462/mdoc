
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { FileExplorer } from './components/FileExplorer';
import { EditorPanel } from './components/EditorPanel';
import { PreviewPanel } from './components/PreviewPanel';
import ResizablePanels from './components/ResizablePanels';
import { ConfirmDialog } from './components/ConfirmDialog';
import { InputDialog } from './components/InputDialog';
import { Theme, FileType, type FileNode, type ProjectData } from './types';

// 状態をイミュータブルに更新するためのヘルパー関数
const updateFileNode = (nodes: FileNode[], filePath: string, newContent: string): FileNode[] => {
  return nodes.map(node => {
    if (node.path === filePath) {
      return { ...node, content: newContent };
    }
    if (node.children) {
      return { ...node, children: updateFileNode(node.children, filePath, newContent) };
    }
    return node;
  });
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  // currentContent stateを削除
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [inputDialogConfig, setInputDialogConfig] = useState<{
    title: string;
    placeholder: string;
    onConfirm: (value: string) => void;
  } | null>(null);

  useEffect(() => {
    if (theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));
  };

  const toggleAutoSave = () => {
    setIsAutoSaveEnabled(prev => !prev);
  };

  // ファイルを閉じる（未保存の場合は警告）
  const handleCloseFile = () => {
    if (hasUnsavedChanges) {
      // カスタム確認ダイアログを表示
      setShowConfirmDialog(true);
    } else {
      // 未保存の変更がない場合はそのまま閉じる
      setActiveFile(null);
      setHasUnsavedChanges(false);
    }
  };

  // 確認ダイアログのハンドラー
  const handleConfirmYes = () => {
    // 保存してから閉じる
    if (activeFile && activeFile.content) {
      handleSave(activeFile.path, activeFile.content)
        .then(() => {
          setActiveFile(null);
          setHasUnsavedChanges(false);
          setShowConfirmDialog(false);
        })
        .catch(error => {
          console.error('Failed to save file:', error);
          // 保存に失敗した場合は閉じない
        });
    }
  };

  const handleConfirmNo = () => {
    // 保存せずに閉じる
    setActiveFile(null);
    setHasUnsavedChanges(false);
    setShowConfirmDialog(false);
  };

  const handleConfirmCancel = () => {
    // キャンセル：何もしない
    setShowConfirmDialog(false);
  };

  // Ctrl + S で保存
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      return; // CustomTextarea で処理するため除外
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (activeFile && activeFile.content) {
        handleSave(activeFile.path, activeFile.content).catch(error => {
          console.error('Failed to save file:', error);
        });
      }
    }
  }, [activeFile]);

  // キーボードイベントリスナーを追加
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // スクロール同期ハンドラー
  const handleScrollSync = (scrollTop: number) => {
    // エディターとプレビューのスクロール位置を同期
    // この機能は将来的に拡張可能
  };

  // プロジェクトフォルダを開く
  const handleOpenProject = async () => {
    if (!window.electronAPI) {
      console.error('Electron API not available');
      return;
    }

    try {
      setIsLoading(true);
      const result = await window.electronAPI.openProjectFolder();
      if (result) {
        setProjectData(result);
        // 最初のMarkdownファイルを自動選択
        const firstMdFile = findFirstMarkdownFile(result.nodes);
        if (firstMdFile) {
          await handleFileSelect(firstMdFile);
        }
      }
    } catch (error) {
      console.error('Failed to open project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 新しいフォルダを作成（ルートレベル）
  const handleCreateFolder = () => {
    if (!window.electronAPI || !projectData) {
      console.error('Electron API not available or no project opened');
      return;
    }

    setInputDialogConfig({
      title: 'Create New Folder',
      placeholder: 'Enter folder name',
      onConfirm: async (folderName: string) => {
        try {
          const result = await window.electronAPI.createFolder(folderName);
          if (result.success) {
            // プロジェクトデータを再読み込み
            const updatedProject = await window.electronAPI.getProjectData();
            if (updatedProject) {
              setProjectData(updatedProject);
            }
          } else {
            alert(`Failed to create folder: ${result.error}`);
          }
        } catch (error) {
          console.error('Failed to create folder:', error);
          alert('Failed to create folder. Please try again.');
        }
      }
    });
    setShowInputDialog(true);
  };

  // 新しいフォルダを作成（指定されたパス内）
  const handleCreateFolderInPath = async (folderName: string, parentPath: string) => {
    if (!window.electronAPI) {
      console.error('Electron API not available');
      return;
    }

    try {
      const result = await window.electronAPI.createFolder(folderName, parentPath);
      if (result.success) {
        // プロジェクトデータを再読み込み
        const updatedProject = await window.electronAPI.getProjectData();
        if (updatedProject) {
          setProjectData(updatedProject);
        }
      } else {
        // エラーメッセージは表示せず、単純にキャンセル
        console.error('Failed to create folder:', result.error);
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
      // エラーメッセージは表示せず、単純にキャンセル
    }
  };

  // 新しいファイルを作成（ルートレベル）
  const handleCreateFile = () => {
    if (!window.electronAPI || !projectData) {
      console.error('Electron API not available or no project opened');
      return;
    }

    setInputDialogConfig({
      title: 'Create New File',
      placeholder: 'Enter file name (with extension)',
      onConfirm: async (fileName: string) => {
        try {
          const result = await window.electronAPI.createFile(fileName);
          if (result.success) {
            // プロジェクトデータを再読み込み
            const updatedProject = await window.electronAPI.getProjectData();
            if (updatedProject) {
              setProjectData(updatedProject);
              // 新しく作成されたファイルを選択
              const newFile = findFileByName(updatedProject.nodes, fileName);
              if (newFile) {
                await handleFileSelect(newFile);
              }
            }
          } else {
            alert(`Failed to create file: ${result.error}`);
          }
        } catch (error) {
          console.error('Failed to create file:', error);
          alert('Failed to create file. Please try again.');
        }
      }
    });
    setShowInputDialog(true);
  };

  // 新しいファイルを作成（指定されたパス内）
  const handleCreateFileInPath = async (fileName: string, parentPath: string) => {
    if (!window.electronAPI) {
      console.error('Electron API not available');
      return;
    }

    try {
      const result = await window.electronAPI.createFile(fileName, parentPath);
      if (result.success) {
        // プロジェクトデータを再読み込み
        const updatedProject = await window.electronAPI.getProjectData();
        if (updatedProject) {
          setProjectData(updatedProject);
          // 新しく作成されたファイルを選択
          const newFile = findFileByName(updatedProject.nodes, fileName);
          if (newFile) {
            await handleFileSelect(newFile);
          }
        }
      } else {
        // エラーメッセージは表示せず、単純にキャンセル
        console.error('Failed to create file:', result.error);
      }
    } catch (error) {
      console.error('Failed to create file:', error);
      // エラーメッセージは表示せず、単純にキャンセル
    }
  };

  // ファイルパスから親ディレクトリを取得するヘルパー関数
  const getParentDirectory = (filePath: string): string => {
    const lastSlashIndex = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
    return lastSlashIndex > 0 ? filePath.substring(0, lastSlashIndex) : '';
  };

  // 選択中のファイルと同じ階層にファイルを作成
  const handleCreateFileInSameDirectory = async (fileName: string, filePath: string) => {
    if (!window.electronAPI) {
      console.error('Electron API not available');
      return;
    }

    try {
      // ファイルパスから親ディレクトリを取得
      const parentDir = getParentDirectory(filePath);
      
      const result = await window.electronAPI.createFile(fileName, parentDir);
      if (result.success) {
        // プロジェクトデータを再読み込み
        const updatedProject = await window.electronAPI.getProjectData();
        if (updatedProject) {
          setProjectData(updatedProject);
          // 新しく作成されたファイルを選択
          const newFile = findFileByName(updatedProject.nodes, fileName);
          if (newFile) {
            await handleFileSelect(newFile);
          }
        }
      } else {
        // エラーメッセージは表示せず、単純にキャンセル
        console.error('Failed to create file:', result.error);
      }
    } catch (error) {
      console.error('Failed to create file in same directory:', error);
      // エラーメッセージは表示せず、単純にキャンセル
    }
  };

  // プロジェクトをリフレッシュ
  const handleRefresh = async () => {
    if (!window.electronAPI || !projectData) {
      console.error('Electron API not available or no project opened');
      return;
    }

    try {
      setIsLoading(true);
      const updatedProject = await window.electronAPI.getProjectData();
      if (updatedProject) {
        setProjectData(updatedProject);
      }
    } catch (error) {
      console.error('Failed to refresh project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ファイルノードを再帰的に検索する汎用関数
  const findFileNode = (nodes: FileNode[], predicate: (node: FileNode) => boolean): FileNode | null => {
    for (const node of nodes) {
      if (predicate(node)) {
        return node;
      }
      if (node.children) {
        const found = findFileNode(node.children, predicate);
        if (found) return found;
      }
    }
    return null;
  };

  // 最初のMarkdownファイルを見つける
  const findFirstMarkdownFile = (nodes: FileNode[]): FileNode | null => {
    return findFileNode(nodes, node => node.type === FileType.FILE && node.name.endsWith('.md'));
  };

  // ファイル名でファイルを見つける
  const findFileByName = (nodes: FileNode[], fileName: string): FileNode | null => {
    return findFileNode(nodes, node => node.name === fileName);
  };

  // ファイル選択
  const handleFileSelect = async (file: FileNode) => {
    if (file.type === FileType.FILE && file.name.endsWith('.md')) {
      // ファイルの内容を読み込み（projectData内の内容は信頼しない）
      let contentToLoad = '';
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.readFile(file.path);
          if (result.success && result.content) {
            contentToLoad = result.content;
          }
        } catch (error) {
          console.error('Failed to read file:', error);
          contentToLoad = ''; // 読み込み失敗時は空にする
        }
      }
      
      // 読み込んだ内容で新しいFileNodeオブジェクトを作成してstateを更新
      const newActiveFile = { ...file, content: contentToLoad };
      
      setActiveFile(newActiveFile);
      setHasUnsavedChanges(false);

      // projectData内の対応するファイルノードも更新（実際のファイル内容で）
      if (projectData) {
        setProjectData(prevData => ({
          ...prevData!,
          nodes: updateFileNode(prevData!.nodes, file.path, contentToLoad),
        }));
      }
    }
  };

  // コンテンツ変更
  const handleContentChange = (content: string) => {
    if (!activeFile || !projectData) return;

    // activeFileをイミュータブルに更新
    const newActiveFile = { ...activeFile, content };
    setActiveFile(newActiveFile);
    
    // projectData全体をイミュータブルに更新
    setProjectData(prevData => ({
      ...prevData!,
      nodes: updateFileNode(prevData!.nodes, activeFile.path, content),
    }));

    setHasUnsavedChanges(true);
  };

  // ファイル保存
  const handleSave = async (filePath: string, content: string) => {
    if (!window.electronAPI) {
      console.error('Electron API not available');
      return;
    }

    try {
      const result = await window.electronAPI.writeFile(filePath, content);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save file');
      }
      setHasUnsavedChanges(false); // 保存成功時に未保存状態をリセット
    } catch (error) {
      console.error('Failed to save file:', error);
      throw error;
    }
  };

  // HTML出力
  const handleExportHtml = async () => {
    if (!activeFile || !window.electronAPI) {
      console.error('No active file or Electron API not available');
      return;
    }

    try {
      const result = await window.electronAPI.exportToHtml(
        activeFile.path, 
        activeFile.content || '', // currentContentの代わりにactiveFile.contentを使用
        false // エクスポートは常にライトモードで出力
      );
      
      if (result.success) {
        // 成功通知を表示（実際のアプリではトースト通知など）
        alert(`HTML exported successfully to: ${result.htmlPath}`);
      } else {
        throw new Error(result.error || 'Failed to export HTML');
      }
    } catch (error) {
      console.error('Failed to export HTML:', error);
      alert(`Failed to export HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans text-sm antialiased text-light-text dark:text-dark-text bg-light-bg dark:bg-dark-bg overflow-hidden">
      {/* 固定ヘッダー - 高さ28px (h-7) */}
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme}
        activeFile={activeFile?.name}
        projectPath={projectData?.projectPath}
        isAutoSaveEnabled={isAutoSaveEnabled}
        toggleAutoSave={toggleAutoSave}
      />
      
      {/* メインコンテンツ領域 - 残りのスペースを常に占有 */}
      <main className="flex w-full overflow-hidden" style={{ height: 'calc(100vh - 28px - 20px)' }}>
        <ResizablePanels onScrollSync={handleScrollSync}>
          <FileExplorer
            files={projectData?.nodes || []}
            activeFile={activeFile}
            onFileSelect={handleFileSelect}
            onOpenProject={handleOpenProject}
            onCreateFolder={handleCreateFolder}
            onCreateFile={handleCreateFile}
            onCreateFolderInPath={handleCreateFolderInPath}
            onCreateFileInPath={handleCreateFileInPath}
            onCreateFileInSameDirectory={handleCreateFileInSameDirectory}
            onRefresh={handleRefresh}
            projectPath={projectData?.projectPath}
          />
          
          <EditorPanel 
            activeFile={activeFile} 
            onContentChange={handleContentChange}
            onSave={handleSave}
            isAutoSaveEnabled={isAutoSaveEnabled}
            onSaveSuccess={() => setHasUnsavedChanges(false)}
            hasUnsavedChanges={hasUnsavedChanges}
            onCloseFile={handleCloseFile}
          />
          
          <PreviewPanel 
            content={activeFile?.content || ''}
            isDarkMode={theme === Theme.DARK}
            onExportHtml={handleExportHtml}
          />
        </ResizablePanels>
      </main>
      
      {/* 固定フッター - 高さ20px (h-5) */}
      <footer className="flex items-center justify-between px-4 h-5 bg-light-accent dark:bg-dark-accent text-white text-xs">
        <div>
          {isLoading ? 'Loading...' : (projectData ? 'Ready' : 'No project')}
        </div>
        <div className="flex items-center space-x-4">
          <div>Ln 1, Col 1</div>
          <div>Spaces: 2</div>
          <div>UTF-8</div>
          <div>Markdown</div>
        </div>
      </footer>

      {/* 確認ダイアログ */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="変更の保存"
        message={`"${activeFile?.name}"の変更を保存しますか？\n\n保存しないと変更内容が失われます。`}
        onYes={handleConfirmYes}
        onNo={handleConfirmNo}
        onCancel={handleConfirmCancel}
        yesText="はい"
        noText="いいえ"
        cancelText="キャンセル"
      />

      {/* 入力ダイアログ */}
      {inputDialogConfig && (
        <InputDialog
          isOpen={showInputDialog}
          onClose={() => setShowInputDialog(false)}
          onConfirm={inputDialogConfig.onConfirm}
          title={inputDialogConfig.title}
          placeholder={inputDialogConfig.placeholder}
        />
      )}
    </div>
  );
};

export default App;

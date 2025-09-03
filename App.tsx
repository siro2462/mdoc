
import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { FileExplorer } from './components/FileExplorer';
import { EditorPanel } from './components/EditorPanel';
import { PreviewPanel } from './components/PreviewPanel';
import ResizablePanels from './components/ResizablePanels';
import { Theme, FileType, type FileNode, type ProjectData } from './types';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  const [currentContent, setCurrentContent] = useState('');
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollSyncRef = useRef<HTMLDivElement>(null);

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

  // スクロール同期ハンドラー
  const handleScrollSync = (scrollTop: number) => {
    // エディターとプレビューのスクロール位置を同期
    // この機能は将来的に拡張可能
    console.log('Scroll position:', scrollTop);
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
          setActiveFile(firstMdFile);
          setCurrentContent(firstMdFile.content || '');
        }
      }
    } catch (error) {
      console.error('Failed to open project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 最初のMarkdownファイルを見つける
  const findFirstMarkdownFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === FileType.FILE && node.name.endsWith('.md')) {
        return node;
      }
      if (node.children) {
        const found = findFirstMarkdownFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  // ファイル選択
  const handleFileSelect = async (file: FileNode) => {
    if (file.type === FileType.FILE && file.name.endsWith('.md')) {
      setActiveFile(file);
      
      // ファイルの内容を読み込み
      if (file.content) {
        setCurrentContent(file.content);
      } else if (window.electronAPI) {
        try {
          const result = await window.electronAPI.readFile(file.path);
          if (result.success && result.content) {
            setCurrentContent(result.content);
            // ファイルノードを更新
            file.content = result.content;
          }
        } catch (error) {
          console.error('Failed to read file:', error);
        }
      }
    }
  };

  // コンテンツ変更
  const handleContentChange = (content: string) => {
    setCurrentContent(content);
    if (activeFile) {
      activeFile.content = content;
    }
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
        currentContent, 
        theme === Theme.DARK
      );
      
      if (result.success) {
        console.log('HTML exported successfully:', result.htmlPath);
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
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme}
        onOpenProject={handleOpenProject}
        onExportHtml={handleExportHtml}
        activeFile={activeFile?.name}
        projectPath={projectData?.projectPath}
      />
      
      <main className="flex flex-grow w-full overflow-hidden">
        <ResizablePanels onScrollSync={handleScrollSync}>
          <FileExplorer
            files={projectData?.nodes || []}
            activeFile={activeFile}
            onFileSelect={handleFileSelect}
            onOpenProject={handleOpenProject}
            projectPath={projectData?.projectPath}
          />
          
          <EditorPanel 
            activeFile={activeFile} 
            onContentChange={handleContentChange}
            onSave={handleSave}
          />
          
          <PreviewPanel 
            content={currentContent}
            isDarkMode={theme === Theme.DARK}
            onExportHtml={handleExportHtml}
          />
        </ResizablePanels>
      </main>
      
      <footer className="flex items-center justify-between px-4 h-6 bg-light-accent dark:bg-dark-accent text-white text-xs">
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
    </div>
  );
};

export default App;

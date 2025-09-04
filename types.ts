
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

export enum FileType {
  FILE = 'file',
  FOLDER = 'directory'
}

export interface FileNode {
  id: string;
  type: FileType;
  name: string;
  path: string;
  icon?: string;
  content?: string;
  children?: FileNode[];
}

export interface ProjectData {
  projectPath: string;
  nodes: FileNode[];
}

export interface MarkdownParseResult {
  html: string;
  toc: Array<{ level: number; text: string; id: string }>;
}

// SVGコンポーネントの型定義
declare module '*.svg' {
  import React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.svg?react' {
  import React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}



// Electron APIの型定義
declare global {
  interface Window {
    electronAPI: {
      openProjectFolder: () => Promise<ProjectData | null>;
      openProjectFromPath: (projectPath: string) => Promise<ProjectData | null>;
      readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
      writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
      getFileInfo: (filePath: string) => Promise<{ success: boolean; isDirectory?: boolean; size?: number; modified?: string; error?: string }>;
      exportToHtml: (markdownPath: string, content: string, isDarkMode: boolean) => Promise<{ success: boolean; htmlPath?: string; error?: string }>;
      processImage: (imagePath: string) => Promise<{ success: boolean; error?: string }>;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      onFileSystemChange: (callback: (event: any, data: any) => void) => void;
    };
    process: {
      env: {
        NODE_ENV: string;
      };
    };
  }
}

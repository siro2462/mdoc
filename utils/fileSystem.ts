
import fs from 'fs-extra';
import path from 'path';

export interface FileNode {
  id: string;
  type: 'file' | 'directory';
  name: string;
  path: string;
  content?: string;
  children?: FileNode[];
}

export interface ProjectData {
  projectPath: string;
  nodes: FileNode[];
}

// プロジェクトフォルダをスキャン
export async function scanProjectFolder(folderPath: string): Promise<ProjectData> {
  const hiddenFiles = ['.git', '.DS_Store', '.gitignore', '.vscode', 'node_modules', '.mdoc'];
  
  async function scanDirectory(dirPath: string): Promise<FileNode[]> {
    try {
      const items = await fs.readdir(dirPath);
      const nodes: FileNode[] = [];
      
      for (const item of items) {
        // 隠しファイルを除外
        if (hiddenFiles.includes(item) || item.startsWith('.')) {
          continue;
        }
        
        const fullPath = path.join(dirPath, item);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
          const children = await scanDirectory(fullPath);
          nodes.push({
            id: fullPath,
            type: 'directory',
            name: item,
            path: fullPath,
            children
          });
        } else if (item.endsWith('.md')) {
          // Markdownファイルのみ読み込み
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            // ファイルサイズが大きすぎる場合はスキップ
            if (content.length > 10 * 1024 * 1024) { // 10MB制限
              console.warn(`File too large, skipping: ${fullPath} (${content.length} bytes)`);
              continue;
            }
            nodes.push({
              id: fullPath,
              type: 'file',
              name: item,
              path: fullPath,
              content
            });
          } catch (error) {
            console.error(`Failed to read file: ${fullPath}`, error);
          }
        }
      }
      
      return nodes.sort((a, b) => {
        // ディレクトリを先に、ファイルを後に
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error(`Failed to scan directory: ${dirPath}`, error);
      return [];
    }
  }
  
  return {
    projectPath: folderPath,
    nodes: await scanDirectory(folderPath)
  };
}

// ファイルを読み込み
export async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`, error);
    throw error;
  }
}

// ファイルに書き込み
export async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    console.error(`Failed to write file: ${filePath}`, error);
    throw error;
  }
}

// ファイル情報を取得
export async function getFileInfo(filePath: string) {
  try {
    const stats = await fs.stat(filePath);
    return {
      success: true,
      isDirectory: stats.isDirectory(),
      size: stats.size,
      modified: stats.mtime.toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// HTMLファイルを出力
export async function exportToHtml(markdownPath: string, htmlPath: string, content: string, isDarkMode: boolean = false): Promise<void> {
  try {
    const title = path.basename(markdownPath, '.md');
    const htmlContent = generateHtmlFile(content, title, isDarkMode);
    await fs.writeFile(htmlPath, htmlContent, 'utf-8');
  } catch (error) {
    console.error(`Failed to export HTML: ${htmlPath}`, error);
    throw error;
  }
}

// HTMLファイル生成（ユーティリティ関数）
function generateHtmlFile(content: string, title: string, isDarkMode: boolean = false): string {
  // 簡易的なHTML生成（実際の実装ではmarkdown.tsの関数を使用）
  const darkModeClass = isDarkMode ? 'dark' : '';
  return `<!DOCTYPE html>
<html lang="ja" class="${darkModeClass}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.6; }
    .dark { background-color: #0d1117; color: #e1e4e8; }
    pre { background-color: #f6f8fa; padding: 16px; border-radius: 3px; overflow-x: auto; }
    .dark pre { background-color: #161b22; }
    code { background-color: rgba(27, 31, 35, 0.05); padding: 0.2em 0.4em; border-radius: 3px; }
    .dark code { background-color: rgba(110, 118, 129, 0.4); }
  </style>
</head>
<body>
  <div class="markdown-content">
    ${content}
  </div>
</body>
</html>`;
}
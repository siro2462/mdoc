const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const MarkdownIt = require('markdown-it');

let mainWindow;

// Markdown-itの設定
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false, // タイトルバーを削除
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // アイコンファイルがあれば
    show: false
  });

  // 開発環境ではローカルサーバー、本番環境ではビルドされたファイルを読み込み
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
    // DevToolsのエラーログを抑制
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      if (message.includes('Autofill.enable') || message.includes('Autofill.setAddresses')) {
        return; // Autofillエラーを非表示
      }
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // メニューバーを完全に無効化
  const { Menu } = require('electron');
  Menu.setApplicationMenu(null);
  
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC通信の設定
ipcMain.handle('open-project-folder', async () => {
  console.log('open-project-folder called');
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    
    console.log('Dialog result:', result);
    
    if (!result.canceled && result.filePaths.length > 0) {
      const projectPath = result.filePaths[0];
      console.log('Selected project path:', projectPath);
      const scanResult = await scanProjectFolder(projectPath);
      console.log('Scan result:', scanResult);
      return scanResult;
    }
    return null;
  } catch (error) {
    console.error('Error in open-project-folder:', error);
    throw error;
  }
});

// 保存されたパスから直接プロジェクトを開く（ダイアログなし）
ipcMain.handle('open-project-from-path', async (event, projectPath) => {
  console.log('open-project-from-path called with:', projectPath);
  try {
    // パスの存在確認
    const stats = await fs.stat(projectPath);
    if (!stats.isDirectory()) {
      console.error('Path is not a directory:', projectPath);
      return null;
    }
    
    console.log('Opening project from saved path:', projectPath);
    const scanResult = await scanProjectFolder(projectPath);
    console.log('Scan result:', scanResult);
    
    // 結果の検証
    if (!scanResult || !scanResult.nodes) {
      console.error('Invalid scan result:', scanResult);
      return null;
    }
    
    return scanResult;
  } catch (error) {
    console.error('Error in open-project-from-path:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return null;
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-file-info', async (event, filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      success: true,
      isDirectory: stats.isDirectory(),
      size: stats.size,
      modified: stats.mtime.toISOString() // Dateオブジェクトを文字列に変換
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// HTML出力機能
ipcMain.handle('export-to-html', async (event, markdownPath, content, isDarkMode) => {
  try {
    const htmlPath = markdownPath.replace(/\.md$/, '.html');
    const title = path.basename(markdownPath, '.md');
    
    // HTMLコンテンツを生成
    const htmlContent = generateHtmlFile(content, title, isDarkMode);
    
    // ファイルに書き込み
    await fs.writeFile(htmlPath, htmlContent, 'utf-8');
    
    return { success: true, htmlPath };
  } catch (error) {
    console.error('Error in export-to-html:', error);
    return { success: false, error: error.message };
  }
});

// 画像処理機能
ipcMain.handle('process-image', async (event, imagePath) => {
  try {
    const imageInfo = await processImage(imagePath);
    return { success: true, imageInfo };
  } catch (error) {
    console.error('Error in process-image:', error);
    return { success: false, error: error.message };
  }
});

// ウィンドウコントロール機能
ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// プロジェクトフォルダのスキャン
async function scanProjectFolder(folderPath) {
  const hiddenFiles = ['.git', '.DS_Store', '.gitignore', '.vscode', 'node_modules'];
  
  async function scanDirectory(dirPath) {
    try {
      const items = await fs.readdir(dirPath);
      const nodes = [];
      
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

// HTMLファイル生成
function generateHtmlFile(content, title, isDarkMode = false) {
  const darkModeClass = isDarkMode ? 'dark' : '';
  const darkModeStyles = isDarkMode ? `
    body { background-color: #0d1117; color: #e1e4e8; }
    pre { background-color: #161b22; }
    code { background-color: rgba(110, 118, 129, 0.4); }
    h1, h2 { border-bottom-color: #30363d; }
    blockquote { color: #8b949e; border-left-color: #30363d; }
    hr { background-color: #30363d; }
  ` : '';
  
  // MarkdownをHTMLに変換
  const markdownHtml = md.render(content);
  
  return `<!DOCTYPE html>
<html lang="ja" class="${darkModeClass}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; 
      line-height: 1.6; 
      margin: 0; 
      padding: 20px; 
      max-width: 800px; 
      margin: 0 auto; 
    }
    pre { 
      background-color: #f6f8fa; 
      padding: 16px; 
      border-radius: 3px; 
      overflow-x: auto; 
      margin-bottom: 16px; 
    }
    code { 
      background-color: rgba(27, 31, 35, 0.05); 
      padding: 0.2em 0.4em; 
      border-radius: 3px; 
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; 
    }
    h1, h2 { 
      border-bottom: 1px solid #eaecef; 
      padding-bottom: 0.3em; 
    }
    blockquote { 
      padding: 0 1em; 
      color: #6a737d; 
      border-left: 0.25em solid #dfe2e5; 
      margin: 0 0 16px 0; 
    }
    img { 
      max-width: 100%; 
      height: auto; 
    }
    table { 
      border-spacing: 0; 
      border-collapse: collapse; 
      width: 100%; 
    }
    table th, table td { 
      padding: 6px 13px; 
      border: 1px solid #dfe2e5; 
    }
    table th { 
      background-color: #f6f8fa; 
      font-weight: 600; 
    }
    ${darkModeStyles}
  </style>
</head>
<body>
  <div class="markdown-content">
    ${markdownHtml}
  </div>
</body>
</html>`;
}

// 画像処理（簡易版）
async function processImage(imagePath) {
  try {
    const imageBuffer = await fs.readFile(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    }[ext] || 'image/png';
    
    return {
      base64: `data:${mimeType};base64,${base64}`,
      width: 800, // 仮の値
      height: 600, // 仮の値
      originalSize: imageBuffer.length,
      resizedSize: imageBuffer.length
    };
  } catch (error) {
    console.error(`Failed to process image: ${imagePath}`, error);
    throw error;
  }
}

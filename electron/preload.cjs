const { contextBridge, ipcRenderer } = require('electron');

// レンダラープロセスで使用できるAPIを公開
contextBridge.exposeInMainWorld('electronAPI', {
  // プロジェクトフォルダを開く
  openProjectFolder: () => ipcRenderer.invoke('open-project-folder'),
  
  // 保存されたパスから直接プロジェクトを開く（ダイアログなし）
  openProjectFromPath: (projectPath) => ipcRenderer.invoke('open-project-from-path', projectPath),
  
  // ファイルを読み込む
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // ファイルに書き込む
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  
  // ファイル情報を取得
  getFileInfo: (filePath) => ipcRenderer.invoke('get-file-info', filePath),
  
  // HTML出力
  exportToHtml: (markdownPath, content, isDarkMode) => ipcRenderer.invoke('export-to-html', markdownPath, content, isDarkMode),
  
  // 画像処理
  processImage: (imagePath) => ipcRenderer.invoke('process-image', imagePath),
  
  // ウィンドウコントロール
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // ファイル・フォルダ作成
  createFolder: (folderName, parentPath) => ipcRenderer.invoke('create-folder', folderName, parentPath),
  createFile: (fileName, parentPath) => ipcRenderer.invoke('create-file', fileName, parentPath),
  
  // プロジェクトデータを取得
  getProjectData: () => ipcRenderer.invoke('get-project-data'),
  
  // ファイルシステムの変更を監視
  onFileSystemChange: (callback) => {
    // 将来的にファイルシステム監視を実装する場合の準備
    ipcRenderer.on('file-system-change', callback);
  }
});

// セキュリティのため、Node.jsのAPIは直接公開しない
contextBridge.exposeInMainWorld('process', {
  env: {
    NODE_ENV: process.env.NODE_ENV
  }
});

import fs from 'fs-extra';
import path from 'path';

export interface ImageInfo {
  base64: string;
  width: number;
  height: number;
  originalSize: number;
  resizedSize: number;
}

// 画像をbase64に変換し、必要に応じてリサイズ
export async function processImage(imagePath: string): Promise<ImageInfo> {
  try {
    // ファイルを読み込み
    const imageBuffer = await fs.readFile(imagePath);
    const originalSize = imageBuffer.length;
    
    // 画像の情報を取得（簡易版）
    const imageInfo = await getImageInfo(imageBuffer);
    
    // 長辺が1024pxを超える場合はリサイズ
    let processedBuffer = imageBuffer;
    let finalWidth = imageInfo.width;
    let finalHeight = imageInfo.height;
    
    if (imageInfo.width > 1024 || imageInfo.height > 1024) {
      const resized = await resizeImage(imageBuffer, 1024);
      processedBuffer = resized.buffer;
      finalWidth = resized.width;
      finalHeight = resized.height;
    }
    
    // base64に変換
    const base64 = processedBuffer.toString('base64');
    const mimeType = getMimeType(imagePath);
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    return {
      base64: dataUrl,
      width: finalWidth,
      height: finalHeight,
      originalSize,
      resizedSize: processedBuffer.length
    };
  } catch (error) {
    console.error(`Failed to process image: ${imagePath}`, error);
    throw error;
  }
}

// 画像の基本情報を取得（簡易版）
async function getImageInfo(buffer: Buffer): Promise<{ width: number; height: number; format: string }> {
  // 簡易的な画像情報取得（実際の実装ではsharpやjimpなどのライブラリを使用）
  // ここでは仮の実装として、ファイル拡張子から推測
  const format = 'image/png'; // 仮の値
  
  // 実際の実装では、画像ライブラリを使用して正確な情報を取得
  // 例: sharp(buffer).metadata()
  
  return {
    width: 800, // 仮の値
    height: 600, // 仮の値
    format
  };
}

// 画像をリサイズ（簡易版）
async function resizeImage(buffer: Buffer, maxSize: number): Promise<{ buffer: Buffer; width: number; height: number }> {
  // 簡易的なリサイズ実装（実際の実装ではsharpやjimpなどのライブラリを使用）
  // ここでは仮の実装として、元のバッファをそのまま返す
  
  // 実際の実装では以下のようになります：
  // const sharp = require('sharp');
  // const resized = await sharp(buffer)
  //   .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
  //   .toBuffer();
  // const metadata = await sharp(resized).metadata();
  
  return {
    buffer,
    width: 800, // 仮の値
    height: 600 // 仮の値
  };
}

// MIMEタイプを取得
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  
  return mimeTypes[ext] || 'image/png';
}

// Markdown内の画像パスをbase64に置換
export function replaceImagePaths(markdownContent: string, projectPath: string): string {
  // 画像パスの正規表現
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  return markdownContent.replace(imageRegex, async (match, alt, imagePath) => {
    try {
      // 相対パスを絶対パスに変換
      const absolutePath = path.isAbsolute(imagePath) 
        ? imagePath 
        : path.join(projectPath, imagePath);
      
      // ファイルの存在確認
      if (!await fs.pathExists(absolutePath)) {
        console.warn(`Image file not found: ${absolutePath}`);
        return match; // 元のマークダウンをそのまま返す
      }
      
      // 画像を処理
      const imageInfo = await processImage(absolutePath);
      
      // base64に置換
      return `![${alt}](${imageInfo.base64})`;
    } catch (error) {
      console.error(`Failed to process image: ${imagePath}`, error);
      return match; // エラーの場合は元のマークダウンをそのまま返す
    }
  });
}

// 画像ファイルのサイズをチェック
export function isImageFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
  return imageExtensions.includes(ext);
}

// 画像ファイルのサイズ制限をチェック
export async function checkImageSize(filePath: string, maxSize: number = 5 * 1024 * 1024): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size <= maxSize;
  } catch (error) {
    console.error(`Failed to check image size: ${filePath}`, error);
    return false;
  }
}

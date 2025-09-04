import React from 'react';

// アイコンを静的にインポート
import ChevronDownIcon from '../src/assets/icons/chevron-down.svg?react';
import ChevronRightIcon from '../src/assets/icons/chevron-right.svg?react';
import ChromeCloseIcon from '../src/assets/icons/chrome-close.svg?react';
import ChromeMaximizeIcon from '../src/assets/icons/chrome-maximize.svg?react';
import ChromeMinimizeIcon from '../src/assets/icons/chrome-minimize.svg?react';
import ColorModeIcon from '../src/assets/icons/color-mode.svg?react';
import ExportIcon from '../src/assets/icons/export.svg?react';
import FileIcon from '../src/assets/icons/file.svg?react';
import FolderOpenedIcon from '../src/assets/icons/folder-opened.svg?react';
import FolderIcon from '../src/assets/icons/folder.svg?react';
import LoadingIcon from '../src/assets/icons/loading.svg?react';
import MarkdownIcon from '../src/assets/icons/markdown.svg?react';
import NewFileIcon from '../src/assets/icons/new-file.svg?react';
import NewFolderIcon from '../src/assets/icons/new-folder.svg?react';
import SaveIcon from '../src/assets/icons/save.svg?react';
import ThreeBarsIcon from '../src/assets/icons/three-bars.svg?react';
import WarningIcon from '../src/assets/icons/warning.svg?react';

// アイコンマップ - セキュリティのため、許可されたアイコンのみを定義
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'chevron-down': ChevronDownIcon,
  'chevron-right': ChevronRightIcon,
  'chrome-close': ChromeCloseIcon,
  'chrome-maximize': ChromeMaximizeIcon,
  'chrome-minimize': ChromeMinimizeIcon,
  'color-mode': ColorModeIcon,
  'export': ExportIcon,
  'file': FileIcon,
  'folder-opened': FolderOpenedIcon,
  'folder': FolderIcon,
  'loading': LoadingIcon,
  'markdown': MarkdownIcon,
  'new-file': NewFileIcon,
  'new-folder': NewFolderIcon,
  'save': SaveIcon,
  'three-bars': ThreeBarsIcon,
  'warning': WarningIcon,
};

interface IconProps {
  name: string | null;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = 'w-4 h-4' }) => {
  // nameがnullの場合は何も表示しない
  if (!name) {
    return null;
  }

  // アイコンマップから取得
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    // フォールバックアイコン
    return (
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="currentColor"
        className={className}
      >
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13V2a6 6 0 1 1 0 12z"/>
      </svg>
    );
  }

  return <IconComponent className={className} />;
};

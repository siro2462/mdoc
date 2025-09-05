import React from 'react';

// アイコンを静的にインポート
import ChevronDownIcon from '../public/icons/chevron-down.svg?react';
import ChevronRightIcon from '../public/icons/chevron-right.svg?react';
import ChromeCloseIcon from '../public/icons/chrome-close.svg?react';
import ChromeMaximizeIcon from '../public/icons/chrome-maximize.svg?react';
import ChromeMinimizeIcon from '../public/icons/chrome-minimize.svg?react';
import ColorModeIcon from '../public/icons/color-mode.svg?react';
import ExportIcon from '../public/icons/export.svg?react';
import FileIcon from '../public/icons/file.svg?react';
import FolderOpenedIcon from '../public/icons/folder-opened.svg?react';
import FolderIcon from '../public/icons/folder.svg?react';
import LoadingIcon from '../public/icons/loading.svg?react';
import MarkdownIcon from '../public/icons/markdown.svg?react';
import NewFileIcon from '../public/icons/new-file.svg?react';
import NewFolderIcon from '../public/icons/new-folder.svg?react';
import SaveIcon from '../public/icons/save.svg?react';
import ThreeBarsIcon from '../public/icons/three-bars.svg?react';
import WarningIcon from '../public/icons/warning.svg?react';
import ArrowDownIcon from '../public/icons/arrow-down.svg?react';
import ArrowUpIcon from '../public/icons/arrow-up.svg?react';
import ReplaceAllIcon from '../public/icons/replace-all.svg?react';
import ReplaceIcon from '../public/icons/replace.svg?react';
import SearchIcon from '../public/icons/search.svg?react';
import RefreshIcon from '../public/icons/refresh.svg?react';

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
  'arrow-down': ArrowDownIcon,
  'arrow-up': ArrowUpIcon,
  'replace-all': ReplaceAllIcon,
  'replace': ReplaceIcon,
  'search': SearchIcon,
  'refresh': RefreshIcon,
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

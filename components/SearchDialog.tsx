import React from 'react';
import { Icon } from './Icon';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onReplace: (query: string, replaceText: string) => void;
  onReplaceAll: (query: string, replaceText: string) => void;
  currentMatch: number;
  totalMatches: number;
  searchQuery: string;
  onQueryChange: (query: string) => void;
}

const IconButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, ariaLabel, title, disabled = false, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      className={`grid place-items-center text-[rgb(220,220,220)] dark:text-[rgb(220,220,220)] text-[rgb(60,60,60)] transition-colors rounded ${
        disabled
          ? 'bg-[rgb(40,40,40)] dark:bg-[rgb(40,40,40)] bg-[rgb(240,240,240)] text-[rgb(100,100,100)] dark:text-[rgb(100,100,100)] text-[rgb(150,150,150)] cursor-not-allowed'
          : 'hover:bg-[rgb(70,70,70)] dark:hover:bg-[rgb(70,70,70)] hover:bg-[rgb(200,200,200)] cursor-pointer'
      } ${className || 'w-6 h-6'}`}
    >
      {children}
    </button>
  );
};

export const SearchDialog: React.FC<SearchDialogProps> = ({
  isOpen,
  onClose,
  onSearch,
  onNext,
  onPrevious,
  onReplace,
  onReplaceAll,
  currentMatch,
  totalMatches,
  searchQuery,
  onQueryChange
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [showReplace, setShowReplace] = React.useState(false);
  const [replaceQuery, setReplaceQuery] = React.useState('');

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onSearch(searchQuery);
      } else if (e.key === 'F3' || (e.shiftKey && e.key === 'F3')) {
        e.preventDefault();
        if (e.shiftKey) {
          onPrevious();
        } else {
          onNext();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious, searchQuery, onSearch]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    onQueryChange(newQuery);
    // 自動検索は停止 - 検索ボタンまたはEnterキーでのみ検索
  };

  const currentOf = totalMatches === 0 ? "0/0" : `${currentMatch}/${totalMatches}`;

  if (!isOpen) return null;

  return (
    <div className="absolute top-2 right-3 z-20">
      <div className="flex flex-col bg-[rgb(51,51,51)] dark:bg-[rgb(51,51,51)] bg-[rgb(248,248,248)] shadow-xl w-[360px] overflow-hidden relative">
        {/* 左側の青いネオン線 */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-300 dark:bg-blue-300 bg-blue-500 shadow-[0_0_4px_rgba(147,197,253,0.3)] dark:shadow-[0_0_4px_rgba(147,197,253,0.3)] shadow-[0_0_4px_rgba(59,130,246,0.4)]"></div>
        {/* 検索行 */}
        <div className="flex items-center px-2 py-0.5">
          {/* 置換ボタン領域 */}
          <div className="flex items-center justify-center w-4 h-6 -ml-1">
            <IconButton 
              ariaLabel="置換を表示/非表示" 
              onClick={() => setShowReplace(!showReplace)}
              title="置換"
              className={`w-3 transition-all duration-200 ${showReplace ? 'h-12' : 'h-6'} ${showReplace ? 'flex items-center justify-center mt-6' : ''}`}
            >
              {showReplace ? (
                <Icon name="chevron-down" className="w-3 h-3" />
              ) : (
                <Icon name="chevron-right" className="w-3 h-3" />
              )}
            </IconButton>
          </div>

          <div className="w-56 flex items-center gap-1 bg-[rgb(30,30,30)] dark:bg-[rgb(30,30,30)] bg-[rgb(255,255,255)] px-2 py-0.5  ">
            <Icon name="search" className="w-3 h-3 opacity-70" />
            <input
              ref={inputRef}
              className="flex-1 bg-transparent outline-none text-[rgb(220,220,220)] dark:text-[rgb(220,220,220)] text-[rgb(60,60,60)] placeholder:text-[rgb(140,140,140)] dark:placeholder:text-[rgb(140,140,140)] placeholder:text-[rgb(100,100,100)] text-xs"
              placeholder="検索（Ctrl+Fで切替）"
              value={searchQuery}
              onChange={handleQueryChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSearch(searchQuery);
                }
              }}
            />
            <div className="text-[10px] tabular-nums text-[rgb(160,160,160)] dark:text-[rgb(160,160,160)] text-[rgb(100,100,100)] px-1">
              {currentOf}
            </div>
          </div>

          {/* Navigate */}
          <div className="flex items-center gap-1 ml-auto">
            <IconButton 
              ariaLabel="前を検索" 
              onClick={() => {
                onSearch(searchQuery);
                onPrevious();
              }}
            >
              <Icon name="arrow-up" className="w-3 h-3" />
            </IconButton>
            <IconButton 
              ariaLabel="次を検索" 
              onClick={() => {
                onSearch(searchQuery);
                onNext();
              }}
            >
              <Icon name="arrow-down" className="w-3 h-3" />
            </IconButton>
          </div>

          <IconButton ariaLabel="閉じる" onClick={onClose}>
            <Icon name="chrome-close" className="w-3 h-3" />
          </IconButton>
        </div>

        {/* 置換行 */}
        {showReplace && (
          <div className="flex items-center px-2 pb-0.5">
            {/* 置換ボタン領域（検索行と同じ幅・高さ） */}
            <div className="w-4 h-6 flex items-center justify-center -ml-1">
              {/* 空の領域で位置合わせ */}
            </div>

            <div className="w-56 flex items-center gap-1 bg-[rgb(30,30,30)] dark:bg-[rgb(30,30,30)] bg-[rgb(255,255,255)] px-2 py-0.5  ">
              <input
                className="flex-1 bg-transparent outline-none text-[rgb(220,220,220)] dark:text-[rgb(220,220,220)] text-[rgb(60,60,60)] placeholder:text-[rgb(140,140,140)] dark:placeholder:text-[rgb(140,140,140)] placeholder:text-[rgb(100,100,100)] text-xs"
                placeholder="置換"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
              />
            </div>
            
            {/* 置換ボタン */}
            <div className="flex items-center gap-1 ml-auto">
              <IconButton
                ariaLabel="置換"
                onClick={() => onReplace(searchQuery, replaceQuery)}
                title="置換"
              >
                <Icon name="replace" className="w-3 h-3" />
              </IconButton>
              <IconButton
                ariaLabel="すべて置換"
                onClick={() => onReplaceAll(searchQuery, replaceQuery)}
                title="すべて置換"
              >
                <Icon name="replace-all" className="w-3 h-3" />
              </IconButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

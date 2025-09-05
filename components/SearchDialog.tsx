import React from 'react';
import { SearchIcon, ChevronUpIcon, ChevronDownIcon, ChevronRightIcon, XIcon } from './icons/SearchIcons';

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
      className={`grid place-items-center border text-[rgb(220,220,220)] transition-colors ${
        disabled
          ? 'border-[rgb(60,60,60)] bg-[rgb(40,40,40)] text-[rgb(100,100,100)] cursor-not-allowed'
          : 'border-[rgb(80,80,80)] bg-[rgb(58,58,58)] hover:bg-[rgb(70,70,70)] cursor-pointer'
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
      <div className="flex flex-col gap-1 bg-[rgb(51,51,51)] border border-[rgb(80,80,80)] shadow-xl w-[400px] overflow-hidden">
        {/* 検索行 */}
        <div className="flex items-start gap-1 px-2 py-1">
          {/* 置換ボタン領域 */}
          <div className="flex items-center justify-center w-4 h-6">
            <IconButton 
              ariaLabel="置換を表示/非表示" 
              onClick={() => setShowReplace(!showReplace)}
              title="置換"
              className={`w-3 transition-all duration-200 ${showReplace ? 'h-12' : 'h-6'}`}
            >
              <ChevronRightIcon className={`w-3 h-3 transition-transform ${showReplace ? 'rotate-90' : ''}`} />
            </IconButton>
          </div>

          <div className="flex-1 flex items-center gap-1 bg-[rgb(30,30,30)] px-2 py-1 border border-[rgb(70,70,70)] focus-within:border-[rgb(110,110,110)]">
            <SearchIcon className="w-3 h-3 opacity-70" />
            <input
              ref={inputRef}
              className="flex-1 bg-transparent outline-none text-[rgb(220,220,220)] placeholder:text-[rgb(140,140,140)] text-sm"
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
            <div className="text-[10px] tabular-nums text-[rgb(160,160,160)] px-1">
              {currentOf}
            </div>
          </div>

          {/* Navigate */}
          <div className="flex items-center gap-1">
            <IconButton 
              ariaLabel="前を検索" 
              onClick={() => {
                onSearch(searchQuery);
                onPrevious();
              }}
            >
              <ChevronUpIcon className="w-3 h-3" />
            </IconButton>
            <IconButton 
              ariaLabel="次を検索" 
              onClick={() => {
                onSearch(searchQuery);
                onNext();
              }}
            >
              <ChevronDownIcon className="w-3 h-3" />
            </IconButton>
          </div>

          <IconButton ariaLabel="閉じる" onClick={onClose}>
            <XIcon className="w-3 h-3" />
          </IconButton>
        </div>

        {/* 置換行 */}
        {showReplace && (
          <div className="flex items-center gap-1 px-2 pb-1">
            {/* 置換ボタン領域（検索行と同じ幅・高さ） */}
            <div className="w-4 h-6 flex items-center justify-center">
              {/* 空の領域で位置合わせ */}
            </div>

            <div className="flex-1 flex items-center gap-1 bg-[rgb(30,30,30)] px-2 py-1 border border-[rgb(70,70,70)] focus-within:border-[rgb(110,110,110)]">
              <input
                className="flex-1 bg-transparent outline-none text-[rgb(220,220,220)] placeholder:text-[rgb(140,140,140)] text-sm"
                placeholder="置換"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
              />
            </div>
            
            {/* 置換ボタン */}
            <div className="flex items-center gap-1">
              <button
                className="px-2 h-6 border border-[rgb(80,80,80)] bg-[rgb(58,58,58)] hover:bg-[rgb(70,70,70)] text-[rgb(220,220,220)] text-xs transition-colors"
                onClick={() => onReplace(searchQuery, replaceQuery)}
                title="置換"
              >
                置換
              </button>
              <button
                className="px-2 h-6 border border-[rgb(80,80,80)] bg-[rgb(58,58,58)] hover:bg-[rgb(70,70,70)] text-[rgb(220,220,220)] text-xs transition-colors"
                onClick={() => onReplaceAll(searchQuery, replaceQuery)}
                title="すべて置換"
              >
                すべて置換
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

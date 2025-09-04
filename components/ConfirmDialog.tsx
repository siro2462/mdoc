import React from 'react';
import { Icon } from './Icon';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onYes: () => void;
  onNo: () => void;
  onCancel: () => void;
  yesText?: string;
  noText?: string;
  cancelText?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onYes,
  onNo,
  onCancel,
  yesText = 'はい',
  noText = 'いいえ',
  cancelText = 'キャンセル'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center">
            <Icon name="warning" className="w-5 h-5 text-orange-500 mr-2" />
            <h3 className="text-lg font-medium text-light-text dark:text-dark-text">
              {title}
            </h3>
          </div>
        </div>

        {/* メッセージ */}
        <div className="p-4">
          <p className="text-light-text dark:text-dark-text whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* ボタン */}
        <div className="flex justify-end space-x-2 p-4 border-t border-light-border dark:border-dark-border">
          <button
            onClick={onYes}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            {yesText}
          </button>
          <button
            onClick={onNo}
            className="px-4 py-2 text-sm font-medium text-light-text dark:text-dark-text bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
          >
            {noText}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

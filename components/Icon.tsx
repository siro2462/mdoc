import React, { useState, useEffect } from 'react';

interface IconProps {
  name: string | null;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = 'w-4 h-4' }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // nameがnullの場合は何も表示しない
  if (!name) {
    return null;
  }

  useEffect(() => {
    const loadSvg = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/svg/${name}.svg`);
        if (response.ok) {
          const svgText = await response.text();
          setSvgContent(svgText);
        } else {
          // SVGファイルが見つからない場合は、フォールバックアイコンを使用
          setSvgContent('<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13V2a6 6 0 1 1 0 12z"/></svg>');
        }
      } catch (error) {
        console.error(`Failed to load SVG: ${name}`, error);
        // エラーの場合もフォールバックアイコンを使用
        setSvgContent('<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13V2a6 6 0 1 1 0 12z"/></svg>');
      } finally {
        setIsLoading(false);
      }
    };

    loadSvg();
  }, [name]);

  if (isLoading) {
    return <div className={`${className} animate-pulse bg-gray-300 dark:bg-gray-600 rounded`} />;
  }

  // SVGコンテンツをdangerouslySetInnerHTMLでレンダリング
  return <div dangerouslySetInnerHTML={{ __html: svgContent }} className={className} />;
};

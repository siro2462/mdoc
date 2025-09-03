import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

// Markdown-itの設定（簡易版）
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return hljs.highlightAuto(str).value;
  }
});

// Qiita風のCSSスタイル
const qiitaStyles = `
<style>
  .markdown-preview {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #24292e;
    max-width: 100%;
    word-wrap: break-word;
  }

  .markdown-preview h1,
  .markdown-preview h2,
  .markdown-preview h3,
  .markdown-preview h4,
  .markdown-preview h5,
  .markdown-preview h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }

  .markdown-preview h1 {
    font-size: 2em;
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.3em;
  }

  .markdown-preview h2 {
    font-size: 1.5em;
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.3em;
  }

  .markdown-preview h3 {
    font-size: 1.25em;
  }

  .markdown-preview p {
    margin-top: 0;
    margin-bottom: 16px;
  }

  .markdown-preview blockquote {
    padding: 0 1em;
    color: #6a737d;
    border-left: 0.25em solid #dfe2e5;
    margin: 0 0 16px 0;
  }

  .markdown-preview ul,
  .markdown-preview ol {
    padding-left: 2em;
    margin-bottom: 16px;
  }

  .markdown-preview li {
    margin-bottom: 0.25em;
  }

  .markdown-preview code {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(27, 31, 35, 0.05);
    border-radius: 3px;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  }

  .markdown-preview pre {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #f6f8fa;
    border-radius: 3px;
    margin-bottom: 16px;
  }

  .markdown-preview pre code {
    padding: 0;
    background-color: transparent;
  }

  .markdown-preview table {
    border-spacing: 0;
    border-collapse: collapse;
    margin-bottom: 16px;
    width: 100%;
  }

  .markdown-preview table th,
  .markdown-preview table td {
    padding: 6px 13px;
    border: 1px solid #dfe2e5;
  }

  .markdown-preview table th {
    font-weight: 600;
    background-color: #f6f8fa;
  }

  .markdown-preview img {
    max-width: 100%;
    height: auto;
  }

  .markdown-preview hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: #e1e4e8;
    border: 0;
  }

  .markdown-preview .task-list-item {
    list-style-type: none;
  }

  .markdown-preview .task-list-item input[type="checkbox"] {
    margin: 0 0.2em 0.25em -1.4em;
    vertical-align: middle;
  }
</style>
`;

// ダークモード用のCSSスタイル
const darkModeStyles = `
<style>
  .markdown-preview {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #e1e4e8;
    max-width: 100%;
    word-wrap: break-word;
  }

  .markdown-preview h1,
  .markdown-preview h2,
  .markdown-preview h3,
  .markdown-preview h4,
  .markdown-preview h5,
  .markdown-preview h6 {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
  }

  .markdown-preview h1 {
    font-size: 2em;
    border-bottom: 1px solid #30363d;
    padding-bottom: 0.3em;
  }

  .markdown-preview h2 {
    font-size: 1.5em;
    border-bottom: 1px solid #30363d;
    padding-bottom: 0.3em;
  }

  .markdown-preview h3 {
    font-size: 1.25em;
  }

  .markdown-preview p {
    margin-top: 0;
    margin-bottom: 16px;
  }

  .markdown-preview blockquote {
    padding: 0 1em;
    color: #8b949e;
    border-left: 0.25em solid #30363d;
    margin: 0 0 16px 0;
  }

  .markdown-preview ul,
  .markdown-preview ol {
    padding-left: 2em;
    margin-bottom: 16px;
  }

  .markdown-preview li {
    margin-bottom: 0.25em;
  }

  .markdown-preview code {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(110, 118, 129, 0.4);
    border-radius: 3px;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  }

  .markdown-preview pre {
    padding: 16px;
    overflow: auto;
    font-size: 85%;
    line-height: 1.45;
    background-color: #161b22;
    border-radius: 3px;
    margin-bottom: 16px;
  }

  .markdown-preview pre code {
    padding: 0;
    background-color: transparent;
  }

  .markdown-preview table {
    border-spacing: 0;
    border-collapse: collapse;
    margin-bottom: 16px;
    width: 100%;
  }

  .markdown-preview table th,
  .markdown-preview table td {
    padding: 6px 13px;
    border: 1px solid #30363d;
  }

  .markdown-preview table th {
    font-weight: 600;
    background-color: #161b22;
  }

  .markdown-preview img {
    max-width: 100%;
    height: auto;
  }

  .markdown-preview hr {
    height: 0.25em;
    padding: 0;
    margin: 24px 0;
    background-color: #30363d;
    border: 0;
  }

  .markdown-preview .task-list-item {
    list-style-type: none;
  }

  .markdown-preview .task-list-item input[type="checkbox"] {
    margin: 0 0.2em 0.25em -1.4em;
    vertical-align: middle;
  }
</style>
`;

export interface MarkdownParseResult {
  html: string;
  toc: Array<{ level: number; text: string; id: string }>;
}

export function parseMarkdown(content: string, isDarkMode: boolean = false): MarkdownParseResult {
  // 目次を抽出
  const toc: Array<{ level: number; text: string; id: string }> = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      toc.push({ level, text, id });
    }
  });

  // MarkdownをHTMLに変換
  const html = md.render(content);
  
  // スタイルを適用
  const styles = isDarkMode ? darkModeStyles : qiitaStyles;
  const fullHtml = `${styles}<div class="markdown-preview">${html}</div>`;

  return {
    html: fullHtml,
    toc
  };
}

export function generateHtmlFile(content: string, title: string, isDarkMode: boolean = false): string {
  const { html } = parseMarkdown(content, isDarkMode);
  
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body>
  ${html}
</body>
</html>`;
}

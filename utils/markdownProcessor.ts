import { marked } from 'marked';
import DOMPurify from 'dompurify';

declare global {
    interface Window {
        hljs: any;
    }
}

const renderer = new marked.Renderer();

// Open links in a new tab
renderer.link = (href, title, text) => {
  const link = marked.Renderer.prototype.link.call(renderer, href, title, text);
  return link.replace('<a', "<a target='_blank' rel='noopener noreferrer'");
};

marked.setOptions({
  renderer,
  gfm: true,
  breaks: true,
  pedantic: false,
  highlight: (code, lang) => {
    const language = window.hljs.getLanguage(lang) ? lang : 'plaintext';
    return window.hljs.highlight(code, { language }).value;
  },
});

export const parseAndSanitizeMarkdown = async (markdown: string): Promise<string> => {
  // Use await since marked.parse is now async
  const rawHtml = await marked.parse(markdown);
  return DOMPurify.sanitize(rawHtml as string);
};


import React from 'react';
import type { FileNode } from './types';
import { FileType } from './types';

export const fileSystem: FileNode[] = [
  {
    name: '.vscode',
    type: FileType.FOLDER,
    icon: 'folder',
    children: [
      { name: 'settings.json', type: FileType.FILE, icon: 'json' },
    ],
  },
  {
    name: 'public',
    type: FileType.FOLDER,
    icon: 'folder',
    children: [
        { name: 'index.html', type: FileType.FILE, icon: 'html' },
        { name: 'vite.svg', type: FileType.FILE, icon: 'svg' },
    ]
  },
  {
    name: 'src',
    type: FileType.FOLDER,
    icon: 'folder',
    children: [
      { name: 'App.tsx', type: FileType.FILE, icon: 'react' },
      { name: 'index.tsx', type: FileType.FILE, icon: 'react' },
      { name: 'types.ts', type: FileType.FILE, icon: 'typescript' },
    ],
  },
  { name: 'package.json', type: FileType.FILE, icon: 'json' },
  { name: 'tsconfig.json', type: FileType.FILE, icon: 'json' },
];

const codeContent: Record<string, { code: string; preview: React.ReactNode }> = {
  'App.tsx': {
    code: `import React, { useState } from 'react';

const App: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <div className="app-container">
      <h1>Hello, World!</h1>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
};

export default App;`,
    preview: (
      <div className="p-8 bg-white rounded-lg shadow-md text-gray-800">
        <h1 className="text-3xl font-bold mb-4">Hello, World!</h1>
        <p className="mb-4">You clicked 0 times</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Click me
        </button>
      </div>
    ),
  },
  'index.html': {
    code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
    preview: (
      <div className="p-8 bg-white rounded-lg shadow-md text-gray-800">
        <h1 className="text-2xl font-bold">HTML Document</h1>
        <p>This is a basic HTML structure.</p>
        <div className="mt-4 p-4 border border-gray-300 rounded">
            Rendered content will appear here.
        </div>
      </div>
    ),
  },
  'package.json': {
    code: `{
  "name": "react-app",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.4.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}`,
    preview: (
      <div className="p-8 bg-white rounded-lg shadow-md text-gray-800">
        <h2 className="text-xl font-bold mb-2">Package Info</h2>
        <div className="space-y-2">
            <p><strong>Name:</strong> react-app</p>
            <p><strong>Version:</strong> 1.0.0</p>
        </div>
      </div>
    ),
  },
  'types.ts': {
    code: `export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export interface User {
  id: number;
  name: string;
  email?: string;
}
`,
    preview: (
      <div className="p-8 bg-white rounded-lg shadow-md text-gray-800">
        <h2 className="text-xl font-bold mb-2">Type Definitions</h2>
        <p>This file defines TypeScript types and enums for the project.</p>
        <pre className="mt-4 p-2 bg-gray-100 rounded text-sm">
            <code>
{`enum Theme { ... }
interface User { ... }`}
            </code>
        </pre>
      </div>
    ),
  },
  'Default': {
      code: `// Select a file to view its content.`,
      preview: <div className="p-8 text-center text-gray-500">Select a file to see its preview.</div>
  }
};

export const getFileContent = (fileName: string) => {
    return codeContent[fileName] || codeContent['Default'];
}

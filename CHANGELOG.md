# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub repository setup
- Comprehensive documentation
- Contributing guidelines
- Architecture documentation

## [1.0.0] - 2024-09-04

### Added
- **Core Features**
  - Modern Markdown editor with live preview
  - Project folder management with file tree
  - Real-time Markdown to HTML conversion
  - Auto-save functionality (1 second delay)
  - Export to single HTML file with embedded CSS

- **User Interface**
  - Resizable panels with drag-and-drop splitters
  - Light/Dark mode theme switching
  - Responsive layout design
  - Intuitive file explorer with folder tree
  - Monaco editor with syntax highlighting

- **Markdown Support**
  - Full Markdown syntax support
  - Code block syntax highlighting
  - Table of Contents auto-generation
  - Qiita-style rendering
  - Support for headers, lists, links, images, tables, quotes

- **Technical Features**
  - Electron-based desktop application
  - React + TypeScript frontend
  - Vite build system for fast development
  - Tailwind CSS for styling
  - SVG icon system with vite-plugin-svgr
  - File system watching for real-time updates

- **Export Capabilities**
  - Single HTML file export
  - Embedded CSS for portability
  - Preserves all formatting and styling
  - Works on any system without dependencies

- **Performance Optimizations**
  - Debounced auto-save to prevent excessive file writes
  - Efficient file tree rendering
  - Optimized Markdown parsing
  - Memory-efficient component design

### Technical Details
- **Frontend**: React 18.2.0 + TypeScript 5.8.2
- **Desktop**: Electron 38.0.0
- **Build**: Vite 5.4.0
- **Styling**: Tailwind CSS
- **Markdown**: markdown-it 14.0.0 + highlight.js 11.9.0
- **Icons**: Custom SVG icons with vite-plugin-svgr
- **Packaging**: electron-builder 25.1.0

### Security
- Sandboxed renderer process
- Secure IPC communication
- SVG icon validation and allowlisting
- No eval() usage to prevent code injection
- Context isolation enabled

### Installation
- Windows NSIS installer
- Desktop and Start Menu shortcuts
- One-click installation process
- Automatic uninstaller

## [0.1.0] - 2024-09-01

### Added
- Initial project setup
- Basic Electron + React structure
- File system integration
- Markdown parsing foundation
- Basic UI components

---

## Release Notes

### Version 1.0.0
This is the first stable release of MDoc, featuring a complete Markdown editing experience with live preview, project management, and HTML export capabilities. The application is built with modern web technologies and packaged as a native desktop application for Windows.

**Key Highlights:**
- 🎯 **Complete Markdown Editor** - Full-featured editor with live preview
- 📁 **Project Management** - Open and manage entire project folders
- 🎨 **Modern UI** - Clean, responsive interface with theme support
- ⚡ **Performance** - Fast, efficient, and memory-optimized
- 🔒 **Security** - Secure architecture following best practices
- 📦 **Easy Installation** - Simple Windows installer

**System Requirements:**
- Windows 10/11 (64-bit)
- 4GB RAM minimum, 8GB recommended
- 200MB available disk space
- 1024x768 minimum display resolution

**What's Next:**
- Plugin system for extensibility
- Multi-window support
- Cloud sync capabilities
- Collaborative editing features
- Mobile companion app

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to contribute to MDoc.

## Support

- **Bug Reports**: [GitHub Issues](https://github.com/your-username/mdoc/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-username/mdoc/discussions)
- **Documentation**: [Project Wiki](https://github.com/your-username/mdoc/wiki)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

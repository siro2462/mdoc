# Contributing to MDoc

Thank you for your interest in contributing to MDoc! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** 8+
- **Git** 2.0+
- **Windows 10/11** (for development)

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/your-username/mdoc.git
   cd mdoc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run Electron in development mode**
   ```bash
   npm run electron:dev
   ```

## 🛠️ Development Guidelines

### Code Style

- **TypeScript** - Use TypeScript for all new code
- **ESLint** - Follow the project's ESLint configuration
- **Prettier** - Use Prettier for code formatting
- **Naming** - Use descriptive, camelCase names

### Component Guidelines

- **Functional components** - Use React functional components with hooks
- **TypeScript interfaces** - Define proper interfaces for props
- **Error boundaries** - Wrap components in error boundaries when appropriate
- **Accessibility** - Follow WCAG guidelines for accessibility

### File Structure

```
src/
├── components/          # React components
├── assets/             # Static assets
├── utils/              # Utility functions
└── types.ts           # TypeScript definitions
```

## 🐛 Bug Reports

### Before Reporting

1. **Check existing issues** - Search for similar issues
2. **Test latest version** - Ensure you're using the latest release
3. **Gather information** - Collect relevant details

### Bug Report Template

```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. Windows 11]
- MDoc Version: [e.g. 1.0.0]
- Node.js Version: [e.g. 18.17.0]

## Additional Context
Any other context about the problem
```

## 💡 Feature Requests

### Before Requesting

1. **Check existing features** - Ensure the feature doesn't already exist
2. **Search discussions** - Look for similar feature requests
3. **Consider scope** - Ensure the feature fits the project's scope

### Feature Request Template

```markdown
## Feature Description
Brief description of the feature

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How would you like this feature to work?

## Alternatives Considered
What other solutions have you considered?

## Additional Context
Any other context about the feature request
```

## 🔧 Pull Request Process

### Before Submitting

1. **Create a branch** - Use a descriptive branch name
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make changes** - Implement your changes
3. **Test thoroughly** - Ensure your changes work correctly
4. **Update documentation** - Update relevant documentation
5. **Commit changes** - Use clear, descriptive commit messages

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(editor): add syntax highlighting for code blocks
fix(export): resolve HTML export encoding issue
docs(readme): update installation instructions
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on Windows 10
- [ ] Tested on Windows 11
- [ ] Tested with different file types
- [ ] Tested export functionality

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 🧪 Testing

### Manual Testing

1. **Basic functionality** - Test core features
2. **Edge cases** - Test with unusual inputs
3. **Performance** - Test with large files
4. **Cross-platform** - Test on different Windows versions

### Test Scenarios

- **File operations** - Open, edit, save files
- **Export functionality** - Export to HTML
- **Theme switching** - Light/dark mode
- **Keyboard shortcuts** - All shortcuts work
- **Error handling** - Graceful error handling

## 📝 Documentation

### Code Documentation

- **JSDoc comments** - Document functions and classes
- **README updates** - Update relevant documentation
- **Type definitions** - Add proper TypeScript types

### User Documentation

- **Screenshots** - Add screenshots for new features
- **Usage examples** - Provide clear examples
- **Troubleshooting** - Update troubleshooting guides

## 🎨 Design Guidelines

### UI/UX Principles

- **Consistency** - Follow existing design patterns
- **Accessibility** - Ensure accessibility compliance
- **Responsiveness** - Design for different screen sizes
- **Performance** - Optimize for smooth user experience

### Icon Guidelines

- **SVG format** - Use SVG for all icons
- **Consistent style** - Follow the established icon style
- **Appropriate size** - Use appropriate icon sizes
- **Accessibility** - Include proper alt text

## 🚀 Release Process

### Version Numbering

- **Major** (1.0.0) - Breaking changes
- **Minor** (1.1.0) - New features
- **Patch** (1.0.1) - Bug fixes

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Release notes prepared

## 🤝 Community Guidelines

### Code of Conduct

- **Be respectful** - Treat everyone with respect
- **Be constructive** - Provide constructive feedback
- **Be patient** - Be patient with new contributors
- **Be inclusive** - Welcome contributors from all backgrounds

### Communication

- **GitHub Issues** - Use for bug reports and feature requests
- **GitHub Discussions** - Use for general discussion
- **Pull Requests** - Use for code contributions

## 📞 Getting Help

- **GitHub Issues** - [Create an issue](https://github.com/your-username/mdoc/issues)
- **GitHub Discussions** - [Start a discussion](https://github.com/your-username/mdoc/discussions)
- **Email** - [Contact us](mailto:support@mdoc.app)

## 🙏 Recognition

Contributors will be recognized in:
- **README.md** - Contributor list
- **Release notes** - Contribution acknowledgments
- **GitHub** - Contributor statistics

Thank you for contributing to MDoc! 🎉

# Pyrogit

<div align="center">

```
   ██████╗ ██╗   ██╗██████╗  ██████╗  ██████╗ ██╗████████╗
   ██╔══██╗╚██╗ ██╔╝██╔══██╗██╔═══██╗██╔════╝ ██║╚══██╔══╝
   ██████╔╝ ╚████╔╝ ██████╔╝██║   ██║██║  ███╗██║   ██║
   ██╔═══╝   ╚██╔╝  ██╔══██╗██║   ██║██║   ██║██║   ██║
   ██║        ██║   ██║  ██║╚██████╔╝╚██████╔╝██║   ██║
   ╚═╝        ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝   ╚═╝
```

**A beautiful Terminal User Interface for managing GitHub Pull Requests**

**Anger coded this because managing team reviews in GitHub's UI, is amazing (cough)**

[![Tests](https://github.com/KristenGarnier/Pyrogit/actions/workflows/test.yaml/badge.svg)](https://github.com/KristenGarnier/Pyrogit/actions/workflows/test.yaml)
[![Build & Release](https://github.com/KristenGarnier/Pyrogit/actions/workflows/build.yaml/badge.svg)](https://github.com/KristenGarnier/Pyrogit/actions/workflows/build.yaml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/runtime-Bun-orange.svg)](https://bun.sh)

_Manage your GitHub PRs with style and efficiency_

[📦 Install](#installation) • [🚀 Usage](#usage) • [✨ Features](#features) • [🛠️ Development](#development)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Installation](#-installation)
- [💻 Usage](#-usage)
- [🎨 Interface](#-interface)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Development](#️-development)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

### 🎯 Core Functionality

- **Pull Request Management**: View, filter, and navigate through your GitHub PRs
- **Real-time Updates**: Live synchronization with GitHub API
- **Intelligent Filtering**: Search and filter PRs by status, author, labels, and more
- **Keyboard Navigation**: Full keyboard-driven interface for power users

### 🎨 User Experience

- **Beautiful TUI**: Modern terminal interface built with [OpenTUI](https://opentui.org)
- **Multiple Themes**: 20+ built-in themes including Dracula, Nord, Catppuccin, and more
- **Responsive Design**: Adapts to different terminal sizes
- **Intuitive Navigation**: Familiar GitHub-like interface in your terminal

### 🔧 Developer Experience

- **TypeScript**: Full type safety and excellent developer experience
- **Hot Reload**: Instant updates during development
- **Comprehensive Testing**: 74 tests with 97%+ code coverage
- **Modern Tooling**: Built with Bun, Biome, and GitHub Actions

## 🚀 Installation

### Automated Installation (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/KristenGarnier/Pyrogit/main/install.sh | sh
```

This will automatically:

- Detect your OS and architecture
- Download the latest release
- Install to `/usr/local/bin/pyrogit`

### Manual Installation

1. Download the latest release for your platform from [Releases](https://github.com/KristenGarnier/Pyrogit/releases)
2. Make it executable: `chmod +x pyrogit-*`
3. Move to your PATH: `sudo mv pyrogit-* /usr/local/bin/pyrogit`

### From Source

```bash
# Clone the repository
git clone https://github.com/KristenGarnier/Pyrogit.git
cd Pyrogit

# Install dependencies
bun install

# Build
bun build --compile --outfile pyrogit infrastructure/react/src/index.tsx

# Run
./pyrogit
```

### Supported Platforms

| OS    | Architectures |
| ----- | ------------- |
| Linux | x64, ARM64    |
| macOS | x64, ARM64    |

## 🔐 Configuration

### GitHub Authentication

Pyrogit requires a GitHub Personal Access Token to access your repositories:

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Create a new token with `repo` permissions
3. The app will prompt you for a token when missing one

### Theme Configuration

Pyrogit saves your theme preference automatically. Available themes include:

- `catppuccin-mocha` (default)
- `dracula`
- `nord`
- `tokyo-night`
- `solarized-dark`
- And 15+ more...

## 💻 Usage

### Getting Started

```bash
# Start Pyrogit
pyrogit

# Or run in development mode
bun dev
```

### Navigation

| Key            | Action                   |
| -------------- | ------------------------ |
| `↑/↓` or `j/k` | Navigate PRs             |
| `o`            | Open PR in browser       |
| `c`            | Copy PR URL to clipboard |
| `/`            | Search/Filter PRs        |
| `Tab`          | Switch between views     |
| `r`            | Refresh data             |
| `?`            | Show help                |

### Filtering & Search

- **Text Search**: Type to filter PRs by title, description, or author

### Views

- **Pull Requests**: Main view of all your PRs

## 🎨 Interface

Pyrogit features a modern, GitHub-inspired terminal interface with:

### 🎭 Themes

Choose from 20+ beautiful themes:

- 🌙 **Dracula** - Dark and mysterious
- ❄️ **Nord** - Arctic-inspired cool tones
- 🐱 **Catppuccin** - Warm and cozy
- ☀️ **Solarized** - Carefully balanced
- And many more...

### 📊 Pull Request Display

- **Status indicators**: Open, merged, closed
- **Author avatars**: Visual identification
- **Labels and milestones**: Color-coded organization
- **Timestamps**: Relative time display
- **Review status**: Approved, changes requested, pending

## 🏗️ Architecture

Pyrogit follows Clean Architecture principles:

```
├── domain/           # Business entities and rules
├── application/      # Use cases and interfaces
├── infrastructure/   # External concerns (UI, API, storage)
│   ├── react/        # TUI implementation with React
│   └── services/     # GitHub API, file storage, etc.
└── __test__/         # Comprehensive test suite
```

### Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime
- **Language**: TypeScript for type safety
- **UI Framework**: [OpenTUI](https://opentui.org) + React
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) stores
- **API Client**: [Octokit](https://github.com/octokit/octokit.js) for GitHub
- **Search**: [Fuse.js](https://fusejs.io/) for fuzzy search
- **Testing**: Bun test + React Testing Library
- **Linting**: [Biome](https://biomejs.dev/) for fast formatting/linting
- **Build**: Bun's native compilation for distributables

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh) >= 1.3.0
- GitHub Personal Access Token (for API access)

### Setup

```bash
# Clone the repository
git clone https://github.com/KristenGarnier/Pyrogit.git
cd Pyrogit

# Install dependencies
bun install

# Start development server
bun dev
```

### Testing

```bash
# Run tests
bun test

# Run tests with coverage
bun test --coverage

# Run linting
bunx @biomejs/biome check .

# Run security audit
bun audit
```

### Building

```bash
# Build for current platform
bun build --compile --outfile pyrogit infrastructure/react/src/index.tsx

# Run the built binary
./pyrogit
```

### Project Structure

```
Pyrogit/
├── infrastructure/
│   ├── react/src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # React hooks
│   │   ├── stores/         # Zustand state management
│   │   ├── themes/         # Color schemes
│   │   └── utils/          # Helper functions
│   └── services/           # External integrations
├── domain/                 # Business logic
├── application/            # Use cases
├── __test__/              # Test suite
├── package.json
├── tsconfig.json
└── bunfig.toml
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `bun test`
5. Format code: `bunx @biomejs/biome format --write .`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Quality

- **Tests**: All code must have corresponding tests
- **Coverage**: Maintain >95% code coverage
- **Linting**: Code must pass Biome checks
- **Types**: Full TypeScript coverage required

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

[⭐ Star us on GitHub](https://github.com/KristenGarnier/Pyrogit) • [🐛 Report bugs](https://github.com/KristenGarnier/Pyrogit/issues) • [💡 Request features](https://github.com/KristenGarnier/Pyrogit/discussions)

</div></content>
<parameter name="filePath">README.md

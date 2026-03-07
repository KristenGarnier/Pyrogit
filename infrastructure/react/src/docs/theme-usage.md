# Themes Usage Guide

This application supports **23 beautiful themes** with fast switching capabilities via keyboard shortcuts.

## 🎨 Available Themes

### Catppuccin Family

- **1**: `catppuccin-mocha` - Dark, warm brown tones
- **2**: `catppuccin-latte` - Light, creamy colors
- **3**: `catppuccin-frappe` - Dark, cool purple tones
- **4**: `catppuccin-macchiato` - Dark, balanced tones

### Popular Dark Themes

- **5**: `tokyo-night` - Dark, blue-based professional theme
- **6**: `dracula` - Classic dark purple theme
- **7**: `one-dark` - Dark, purple-blue tones
- **8**: `one-dark-pro` - Enhanced One Dark variant

### Modern Themes

- **9**: `monokai` - Classic vibrant theme
- **0**: `monokai-pro` - Enhanced Monokai
- **q**: `gruvbox-dark` - Retro terminal colors
- **w**: `gruvbox-light` - Light variant of Gruvbox

### Designer Themes

- **e**: `nord` - Cold, arctic color palette
- **r**: `night-owl` - Dark blue-green theme
- **t**: `material-dark` - Material Design dark theme
- **y**: `material-light` - Material Design light theme

### Platform Themes

- **u**: `github-dark` - GitHub's dark theme
- **i**: `github-dark-dimmed` - Dimmed GitHub dark
- **o**: `github-light` - GitHub's light theme

### Classic & Vintage

- **p**: `solarized-dark` - Scientific color scheme
- **a**: `solarized-light` - Light Solarized variant

### Ayu Family

- **s**: `ayu-dark` - Dark, minimal theme
- **d**: `ayu-light` - Light, clean theme
- **f**: `ayu-mirage` - Mixed, balanced theme

### Colorful Themes

- **g**: `cobalt2` - Bright blue-based theme
- **h**: `shades-of-purple` - Purple-focused theme
- **j**: `vitesse` - Modern, fast-paced theme

## ⌨️ Usage

### Quick Theme Switching

Press any of the following keys to switch themes instantly:

**Catppuccin (1-4) • Tokyo Night (5) • Dracula (6)**  
**One Dark (7-8) • Monokai (9-0) • Gruvbox (q-w)**

**Nord (e) • Night Owl (r) • Material (t-y)**  
**GitHub (u-i-o) • Solarized (p-a) • Ayu (s-d-f)**

**Cobalt2 (g) • Shades of Purple (h) • Vitesse (j)**

### Theme Information

- **Press `t`** to see current theme and available options
- Theme preference is automatically saved and restored

### Light Theme Detection

The icon changes color when using light themes:

- 🎨 Dark themes (muted icon)
- 🎨 Light themes (highlight icon)

## 🔧 Technical Details

### Theme Structure

Each theme follows a consistent structure:

```typescript
{
  background: string,     // Main background
  foreground: string,     // Main text color
  primary: string,        // Primary accent color
  secondary: string,      // Secondary accent
  success: string,        // Success states
  warning: string,        // Warning states
  error: string,          // Error states
  info: string,           // Information states
  border: string,         // Default borders
  focusedBorder: string,  // Focused borders
  muted: string,          // Muted/secondary text
  highlightBg: string,    // Selection background
  highlightFg: string,   // Selection text
}
```

### Persistence

- Themes are saved to `~/.pyrogit/config/theme.json`
- Your choice is automatically restored on startup
- File-based storage for reliability
- Theme lookup is handled by `theme-catalog.service.ts`
- Theme preference hydration/persistence is handled by `theme-preference.service.ts`

### Adding New Themes

1. Create a new file in `src/themes/`
2. Export a theme object following the structure above
3. Add import and export in `themes/index.ts`
4. Add theme to `themeMap` in `services/theme-catalog.service.ts`
5. Add keyboard mapping in `ThemeSwitcher` component

## 🎯 Recommended Themes

### For Programming

- **One Dark Pro** (8) - Excellent contrast and readability
- **Tokyo Night** (5) - Professional, easy on eyes
- **Catppuccin Mocha** (1) - Warm, comfortable for long sessions

### For Low Light

- **GitHub Light** (o) - Clean, minimal eye strain
- **Catppuccin Latte** (2) - Warm, pleasant light theme
- **Ayu Light** (d) - Bright but not harsh

### For Variety

- **Dracula** (6) - Classic, distinctive look
- **Shades of Purple** (h) - Unique purple-focused palette
- **Monokai Pro** (0) - Vibrant, high contrast

Enjoy exploring all the beautiful themes! 🎨

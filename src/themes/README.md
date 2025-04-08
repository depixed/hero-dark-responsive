# Incorpify Theme Reference

This document provides a reference for the color schemes used throughout the Incorpify application in both light and dark modes.

## Color Schemes

### Dark Mode Colors

| UI Element | Color Code | Usage |
|------------|------------|-------|
| Card background | `bg-[#1A1A1A]` | Main card backgrounds |
| Card borders | `border-[#2F2F2F]` | Borders around cards and separators |
| Input background | `bg-[#252525]` | Form input fields |
| Input borders | `border-[#3A3A3A]` | Borders around input fields and outline buttons |
| Container background | `bg-[#252525]` | Secondary backgrounds for contained elements |
| Page background | `bg-[#121212]` | Main dashboard background |
| Sidebar background | `bg-[#0F0F0F]` | Sidebar and mobile header background |
| Active state | `bg-[#3B00EC]/20` | Active tab highlighting, selected items |
| Hover state | `hover:bg-[#1F1F1F]` | Hover effect for menu items |
| Text - primary | `text-white` | Primary text color |
| Text - secondary | `text-gray-400` | Secondary and descriptive text |
| Text - muted | `text-gray-300` | Icon colors and less important text |
| Gradient - primary | `from-[#8e53e5] to-[#3b00eb]` | Primary button backgrounds |
| Gradient - hover | `hover:from-[#7440c0] hover:to-[#3100c5]` | Button hover states |
| Alert - success | `bg-green-500/20 text-green-300 border-green-500/30` | Success badges and notifications |
| Alert - warning | `bg-yellow-500/20 text-yellow-300 border-yellow-500/30` | Warning badges and notifications |
| Alert - error | `bg-red-500/20 text-red-300 border-red-500/30` | Error badges and notifications |
| Alert - info | `bg-blue-500/20 text-blue-300 border-blue-500/30` | Info badges and notifications |

### Light Mode Colors

| UI Element | Color Code | Usage |
|------------|------------|-------|
| Card background | `bg-white` | Main card backgrounds |
| Card borders | `border-gray-200` | Borders around cards |
| Input background | `bg-white` | Form input fields |
| Input borders | `border-gray-300` | Borders around input fields |
| Disabled input | `bg-gray-100` | Background for disabled inputs |
| Container background | `bg-gray-50` | Secondary backgrounds for contained elements |
| Page background | `bg-gray-50` | Main dashboard background |
| Sidebar background | `bg-white` | Sidebar and mobile header background |
| Active state | `bg-purple-50 text-purple-700` | Active tab highlighting, selected items |
| Hover state | `hover:bg-gray-100` | Hover effect for menu items |
| Text - primary | `text-gray-900` | Primary text color |
| Text - secondary | `text-gray-600` | Secondary and descriptive text |
| Text - muted | `text-gray-500` | Less important text |
| Text - subtle | `text-gray-400` | Subtle text, placeholders |
| Gradient - primary | `from-[#8e53e5] to-[#3b00eb]` | Primary button backgrounds |
| Gradient - hover | `hover:from-[#7440c0] hover:to-[#3100c5]` | Button hover states |
| Alert - success | `bg-green-100 text-green-800 border-green-200` | Success badges and notifications |
| Alert - warning | `bg-yellow-100 text-yellow-800 border-yellow-200` | Warning badges and notifications |
| Alert - error | `bg-red-100 text-red-800 border-red-200` | Error badges and notifications |
| Alert - info | `bg-blue-100 text-blue-800 border-blue-200` | Info badges and notifications |

## Implementation Example

```tsx
<div className={theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#1A1A1A] border-[#2F2F2F]'}>
  <h2 className={theme === 'light' ? 'text-gray-900' : 'text-white'}>
    Content title
  </h2>
  <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
    Content description
  </p>
</div>
```

## Theme Context Usage

Import the theme context to access current theme and toggle functionality:

```tsx
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    </button>
  );
};
```

## Consistent Design Principles

1. **Maintain contrast ratios** for accessibility (WCAG AA compliance)
2. **Use the gradient for primary actions** across both themes
3. **Keep alert/status colors consistent** across themes (just adjust opacity/saturation)
4. **Transitions should be 200-300ms** for smooth theme switching
5. **Apply proper nesting** for complex components to maintain visual hierarchy 
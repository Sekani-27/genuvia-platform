import React from 'react';
import { createUnifiedTheme, palettes, UnifiedThemeProvider } from '@backstage/theme';
import { ThemeBlueprint } from '@backstage/plugin-app-react';

const genuviaTheme = createUnifiedTheme({
  palette: {
    ...palettes.dark,
    primary: {
      main: '#7df3e1',
      light: '#a8f7ec',
      dark: '#4ecdc4',
      contrastText: '#0a0a1a',
    },
    secondary: {
      main: '#6c63ff',
      light: '#9c95ff',
      dark: '#4a42cc',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0d0d1a',
      paper: '#13132a',
    },
    navigation: {
      background: '#0a0a18',
      indicator: '#7df3e1',
      color: '#b0b0c8',
      selectedColor: '#7df3e1',
      navItem: {
        hoverBackground: '#1a1a2e',
      },
    },
    text: {
      primary: '#e0e0f0',
      secondary: '#9090b0',
    },
    status: {
      ok: '#7df3e1',
      warning: '#f0c070',
      error: '#ff6b6b',
      running: '#7df3e1',
      pending: '#f0c070',
      aborted: '#9090b0',
    },
  },
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(125, 243, 225, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        },
      },
    },
  },
});

export const genuviaThemeExtension = ThemeBlueprint.make({
  name: 'genuvia',
  params: {
    theme: {
      id: 'genuvia',
      title: 'Genuvia',
      variant: 'dark',
      Provider: ({ children }) => React.createElement(UnifiedThemeProvider, { theme: genuviaTheme, children }),
    },
  },
});

// Café French - Theme Configuration

export const colors = {
  // Primary
  primary: '#1E88E5',
  primaryDark: '#1565C0',
  primaryLight: '#64B5F6',
  
  // Secondary
  secondary: '#FF7043',
  secondaryDark: '#E64A19',
  secondaryLight: '#FFAB91',
  
  // Accent
  accent: '#7C4DFF',
  
  // Semantic
  success: '#4CAF50',
  successLight: '#C8E6C9',
  warning: '#FFC107',
  warningLight: '#FFF9C4',
  error: '#F44336',
  errorLight: '#FFCDD2',
  info: '#2196F3',
  infoLight: '#BBDEFB',
  
  // Skills
  listening: '#9C27B0',
  speaking: '#E91E63',
  reading: '#3F51B5',
  writing: '#009688',
  
  // CEFR Levels
  levelA1: '#8BC34A',
  levelA2: '#CDDC39',
  levelB1: '#FFEB3B',
  levelB2: '#FFC107',
  levelC1: '#FF9800',
  levelC2: '#FF5722',
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F0F4F8',
  
  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#64748B',
  textDisabled: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  
  // Border
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};

export type Theme = typeof theme;

// Skill colors helper
export const getSkillColor = (skill: 'listening' | 'speaking' | 'reading' | 'writing'): string => {
  return colors[skill];
};

// Level colors helper
export const getLevelColor = (level: string): string => {
  const levelColors: Record<string, string> = {
    'A1': colors.levelA1,
    'A2': colors.levelA2,
    'B1': colors.levelB1,
    'B2': colors.levelB2,
    'C1': colors.levelC1,
    'C2': colors.levelC2,
  };
  return levelColors[level] || colors.primary;
};

export default theme;

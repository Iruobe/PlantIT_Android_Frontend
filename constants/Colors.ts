// const tintColorLight = '#2f95dc';
// const tintColorDark = '#fff';

// export default {
//   light: {
//     text: '#000',
//     background: '#fff',
//     tint: tintColorLight,
//     tabIconDefault: '#ccc',
//     tabIconSelected: tintColorLight,
//   },
//   dark: {
//     text: '#fff',
//     background: '#000',
//     tint: tintColorDark,
//     tabIconDefault: '#ccc',
//     tabIconSelected: tintColorDark,
//   },
// };

const tintColorLight = '#2D6A4F';
const tintColorDark = '#52B788';

export const Colors = {
  // Primary palette
  primary: '#2D6A4F',
  primaryLight: '#52B788',
  primaryDark: '#1B4332',
  
  // Secondary
  secondary: '#D4A373',
  
  // Health status colors
  healthy: '#40916C',
  warning: '#F4A261',
  error: '#E63946',
  info: '#4A90A4',
  
  // Light theme
  light: {
    text: '#1A1C1A',
    textSecondary: '#6B7280',
    background: '#FAFDF7',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F7F2',
    border: '#E5E7EB',
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
  },
  
  // Dark theme
  dark: {
    text: '#FAFDF7',
    textSecondary: '#9CA3AF',
    background: '#1A1C1A',
    surface: '#2A2C2A',
    surfaceSecondary: '#3A3C3A',
    border: '#3A3C3A',
    tint: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
  },
};

export const HealthColors = {
  getColor: (score: number) => {
    if (score >= 80) return Colors.healthy;
    if (score >= 60) return Colors.primaryLight;
    if (score >= 40) return Colors.warning;
    return Colors.error;
  },
  getStatus: (score: number) => {
    if (score >= 80) return 'healthy';
    if (score >= 60) return 'good';
    if (score >= 40) return 'mild_issues';
    return 'needs_care';
  },
};
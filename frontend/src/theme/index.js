import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const customColors = {
  primary: '#6750A4',
  primaryContainer: '#EADDFF',
  secondary: '#625B71',
  secondaryContainer: '#E8DEF8',
  tertiary: '#7D5260',
  tertiaryContainer: '#FFD8E4',
  surface: '#FFFBFE',
  surfaceVariant: '#E7E0EC',
  error: '#B3261E',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...customColors,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D0BCFF',
    primaryContainer: '#4F378B',
    secondary: '#CCC2DC',
    secondaryContainer: '#4A4458',
    tertiary: '#EFB8C8',
    tertiaryContainer: '#633B48',
    surface: '#1C1B1F',
    surfaceVariant: '#49454F',
    error: '#F2B8B5',
  },
};

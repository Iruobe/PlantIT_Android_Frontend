import { StyleSheet } from 'react-native';

export const Typography = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    lineHeight: 34,
  },
  h2: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    lineHeight: 30,
  },
  h3: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  label: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
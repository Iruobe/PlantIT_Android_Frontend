import { Colors } from '@/constants/Colors';
import { BorderRadius, Spacing, TouchTargets } from '@/constants/Spacing';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function FloatingChatButton() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Hide on scan screen
  if (pathname === '/scan') return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push('/chat')}
      activeOpacity={0.8}
    >
      <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80 + Spacing.md, // Above tab bar
    right: Spacing.md,
    width: TouchTargets.fab,
    height: TouchTargets.fab,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 100,
  },
});
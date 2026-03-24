import Card from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { BorderRadius, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingItemProps {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  colors: typeof Colors.light;
}

const SettingItem = ({ icon, iconColor = Colors.primary, title, subtitle, onPress, rightElement, colors }: SettingItemProps) => {
  return (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: iconColor + '15' }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      {rightElement || (onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      ))}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { user, logout, deleteAccount } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All your plants and data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This will permanently delete your account and all associated data.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteAccount();
                      router.replace('/login');
                    } catch (error: any) {
                      if (error.code === 'auth/requires-recent-login') {
                        Alert.alert(
                          'Re-authentication Required',
                          'For security, please sign out and sign in again before deleting your account.'
                        );
                      } else {
                        Alert.alert('Error', 'Failed to delete account. Please try again.');
                      }
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const getUserDisplayName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.section}>
        <Card variant="elevated" style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getUserInitials()}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={[styles.profileName, { color: colors.text }]}>{getUserDisplayName()}</Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={16} color={Colors.error} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
        <Card>
          <SettingItem
            icon="moon"
            title="Dark Mode"
            subtitle="Follows system settings"
            colors={colors}
          />
        </Card>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Preferences</Text>
        <Card>
          <SettingItem
            icon="location"
            title="Location"
            subtitle="Nottingham, UK"
            onPress={() => {}}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingItem
            icon="thermometer"
            title="Measurement Units"
            subtitle="Metric (°C, cm)"
            onPress={() => {}}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingItem
            icon="notifications"
            title="Notifications"
            subtitle="Care reminders enabled"
            onPress={() => {}}
            colors={colors}
          />
        </Card>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
        <Card>
          <SettingItem
            icon="information-circle"
            title="App Version"
            subtitle="1.0.0"
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingItem
            icon="document-text"
            title="Privacy Policy"
            onPress={() => {}}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingItem
            icon="help-circle"
            title="Help & Support"
            onPress={() => {}}
            colors={colors}
          />
        </Card>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out" size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  title: {
    ...Typography.h1,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    ...Typography.h3,
  },
  profileEmail: {
    ...Typography.caption,
    marginTop: 2,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.error + '10',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error + '20',
  },
  deleteButtonText: {
    color: Colors.error,
    ...Typography.caption,
    fontFamily: 'Inter-SemiBold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...Typography.body,
    fontFamily: 'Inter-Medium',
  },
  settingSubtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 56,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.error + '10',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error + '20',
  },
  signOutText: {
    color: Colors.error,
    ...Typography.button,
  },
});

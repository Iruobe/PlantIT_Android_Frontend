import FloatingChatButton from '@/components/FloatingChatButton';
import { Colors } from '@/constants/Colors';
import { BorderRadius } from '@/constants/Spacing';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tint,
          tabBarInactiveTintColor: colors.tabIconDefault,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: Platform.OS === 'ios' 
              ? 'transparent' 
              : colorScheme === 'dark' ? Colors.dark.surface : Colors.light.surface,
            borderTopColor: colors.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            height: 64 + (Platform.OS === 'ios' ? 20 : 0),
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          },
          tabBarBackground: () => (
            Platform.OS === 'ios' ? (
              <BlurView 
                intensity={80} 
                style={StyleSheet.absoluteFill}
                tint={colorScheme === 'dark' ? 'dark' : 'light'}
              />
            ) : null
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color, focused }) => (
              <View style={[
                styles.scanButton,
                { backgroundColor: focused ? Colors.primary : colors.surfaceSecondary }
              ]}>
                <Ionicons 
                  name="camera" 
                  size={24} 
                  color={focused ? '#FFFFFF' : color} 
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="plants"
          options={{
            title: 'My Plants',
            tabBarIcon: ({ color, focused }) => (
              <MaterialCommunityIcons 
                name={focused ? 'flower' : 'flower-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons 
                name={focused ? 'settings' : 'settings-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>
      
      {/* Floating Chat Button - appears on all tab screens */}
      <FloatingChatButton />
    </View>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
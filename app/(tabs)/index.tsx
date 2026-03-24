import Card from '@/components/ui/Card';
import PlantCard from '@/components/ui/PlantCard';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Memoized components for performance
const StatCard = React.memo(({ icon, value, label, color }: any) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  return (
    <Card style={styles.statCard} variant="elevated">
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </Card>
  );
});

const TaskItem = React.memo(({ task, onToggle }: any) => {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  return (
    <Card style={[styles.taskItem, task.completed && styles.taskCompleted]}>
      <Ionicons 
        name={task.completed ? 'checkmark-circle' : 'ellipse-outline'} 
        size={24} 
        color={task.completed ? Colors.healthy : Colors.primary} 
      />
      <View style={styles.taskContent}>
        <Text style={[
          styles.taskTitle, 
          { color: colors.text },
          task.completed && styles.taskTitleCompleted
        ]}>
          {task.title}
        </Text>
        <Text style={[styles.taskSubtitle, { color: colors.textSecondary }]}>
          {task.subtitle}
        </Text>
      </View>
      <MaterialCommunityIcons 
        name={task.icon} 
        size={20} 
        color={colors.textSecondary} 
      />
    </Card>
  );
});

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with API calls
  const plants = [
    { id: '1', name: 'Monstera', location: 'Living Room', healthScore: 95, imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=300' },
    { id: '2', name: 'Fiddle Leaf', location: 'Bedroom', healthScore: 72, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300' },
    { id: '3', name: 'Snake Plant', location: 'Hallway', healthScore: 88, imageUrl: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bb6?w=300' },
  ];

  const tasks = [
    { id: '1', title: 'Water Monstera', subtitle: 'Today • 500ml', icon: 'water', completed: false },
    { id: '2', title: 'Rotate Fiddle Leaf', subtitle: 'Today • 90° Clockwise', icon: 'rotate-right', completed: false },
    { id: '3', title: 'Mist Ferns', subtitle: 'Completed at 8:15 AM', icon: 'weather-fog', completed: true },
  ];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Fetch data here
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 100 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.dateText, { color: Colors.primary }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {getGreeting()}! 🌱
          </Text>
        </View>
        <Card style={styles.weatherCard}>
          <Ionicons name="sunny" size={28} color={Colors.primary} />
          <View style={styles.weatherInfo}>
            <Text style={[styles.temp, { color: colors.text }]}>18°C</Text>
            <Text style={[styles.humidity, { color: Colors.primary }]}>65% Humid</Text>
          </View>
        </Card>
      </View>

      {/* Quick Stats */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        <StatCard icon="flower" value="12" label="Total Plants" color={Colors.primary} />
        <StatCard icon="heart" value="95%" label="Avg Health" color={Colors.healthy} />
        <StatCard icon="alert-circle" value="4" label="Tasks Due" color={Colors.warning} />
      </ScrollView>

      {/* Your Plants Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Plants</Text>
          <Text style={[styles.sectionLink, { color: Colors.primary }]}>View All</Text>
        </View>
        <FlatList
          horizontal
          data={plants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.plantCardWrapper}>
              <PlantCard {...item} variant="grid" />
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.plantsScroll}
        />
      </View>

      {/* Care Tasks Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Care Tasks</Text>
        <View style={styles.tasksList}>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </View>
      </View>

      {/* Tips Section */}
      <View style={styles.section}>
        <Card style={styles.tipCard}>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Pro Tip: Lighting</Text>
            <Text style={styles.tipText}>
              Your Fiddle Leaf Fig loves bright, indirect sunlight. Try moving it closer to the window as winter approaches.
            </Text>
            <Text style={styles.tipLink}>Learn More</Text>
          </View>
          <Ionicons name="bulb" size={80} color="rgba(255,255,255,0.1)" style={styles.tipIcon} />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  dateText: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  greeting: {
    ...Typography.h1,
    marginTop: Spacing.xs,
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  weatherInfo: {
    alignItems: 'flex-end',
  },
  temp: {
    fontSize: 18,
    fontWeight: '700',
  },
  humidity: {
    ...Typography.caption,
  },
  statsContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  statCard: {
    minWidth: 110,
    alignItems: 'center',
    gap: Spacing.xs,
    marginRight: Spacing.sm,
  },
  statValue: {
    ...Typography.h2,
  },
  statLabel: {
    ...Typography.caption,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
  },
  sectionLink: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  plantsScroll: {
    paddingRight: Spacing.md,
  },
  plantCardWrapper: {
    width: 160,
    marginRight: Spacing.md,
  },
  tasksList: {
    gap: Spacing.sm,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  taskCompleted: {
    opacity: 0.6,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    ...Typography.body,
    fontWeight: '600',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  taskSubtitle: {
    ...Typography.caption,
  },
  tipCard: {
    backgroundColor: Colors.primary,
    overflow: 'hidden',
    position: 'relative',
  },
  tipContent: {
    maxWidth: '75%',
  },
  tipTitle: {
    ...Typography.h3,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  tipText: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
    marginBottom: Spacing.md,
  },
  tipLink: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tipIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
});
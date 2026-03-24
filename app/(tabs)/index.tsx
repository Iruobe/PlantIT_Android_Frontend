import Card from '@/components/ui/Card';
import PlantCard from '@/components/ui/PlantCard';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { useAuth } from '@/contexts/AuthContext';
import { api, Plant } from '@/services/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StatCard = React.memo(({ icon, value, label, color, colors }: any) => {
  return (
    <Card style={styles.statCard} variant="elevated">
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </Card>
  );
});

const TaskItem = React.memo(({ task, colors }: any) => {
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
  const router = useRouter();
  const colorScheme = useColorScheme();
const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { user } = useAuth();
  
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchPlants();
    }, [])
  );

  const fetchPlants = async () => {
    try {
      const data = await api.getPlants();
      setPlants(data);
    } catch (error) {
      console.error('Failed to fetch plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlants();
    setRefreshing(false);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  };

  const getFirstName = () => {
    if (!user?.displayName) return '';
    return user.displayName.split(' ')[0];
  };

  const totalPlants = plants.length;
  const avgHealth = plants.length > 0 
    ? Math.round(plants.reduce((sum, p) => sum + (p.health_score ?? 0), 0) / plants.length)
    : 0;
  const plantsNeedingCare = plants.filter(p => (p.health_score ?? 100) < 70).length;

  const tasks = plants
    .filter(p => (p.health_score ?? 100) < 80)
    .slice(0, 3)
    .map((plant) => ({
      id: plant.plant_id,
      title: `Check ${plant.name}`,
      subtitle: `Health: ${plant.health_score ?? 'Unknown'}%`,
      icon: 'leaf',
      completed: false,
    }));

  if (tasks.length === 0 && plants.length > 0) {
    tasks.push({
      id: 'water',
      title: 'Water your plants',
      subtitle: 'Check soil moisture',
      icon: 'water',
      completed: false,
    });
  }

  const handleViewAll = () => {
    router.push('/(tabs)/plants');
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
            {getGreeting()}{getFirstName() ? ` ${getFirstName()}` : ''}
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
        <StatCard icon="flower" value={totalPlants.toString()} label="Total Plants" color={Colors.primary} colors={colors} />
        <StatCard icon="heart" value={totalPlants > 0 ? `${avgHealth}%` : '-'} label="Avg Health" color={Colors.healthy} colors={colors} />
        <StatCard icon="alert-circle" value={plantsNeedingCare.toString()} label="Need Care" color={Colors.warning} colors={colors} />
      </ScrollView>

      {/* Your Plants Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Plants</Text>
          <TouchableOpacity onPress={handleViewAll}>
            <Text style={[styles.sectionLink, { color: Colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : plants.length > 0 ? (
          <FlatList
            horizontal
            data={plants.slice(0, 5)}
            keyExtractor={(item) => item.plant_id}
            renderItem={({ item }) => (
              <View style={styles.plantCardWrapper}>
                <PlantCard 
                  id={item.plant_id}
                  name={item.name}
                  species={item.species}
                  location={item.location}
                  imageUrl={item.image_url}
                  healthScore={item.health_score}
                  variant="grid" 
                />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.plantsScroll}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="leaf-outline" size={40} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No plants yet. Scan your first plant!
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/scan')}
            >
              <Text style={styles.emptyButtonText}>Scan Plant</Text>
            </TouchableOpacity>
          </Card>
        )}
      </View>

      {/* Care Tasks Section */}
      {tasks.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Care Tasks</Text>
          <View style={styles.tasksList}>
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} colors={colors} />
            ))}
          </View>
        </View>
      )}

      {/* Tips Section */}
      <View style={styles.section}>
        <Card style={styles.tipCard}>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Pro Tip: Lighting</Text>
            <Text style={styles.tipText}>
              Most houseplants thrive in bright, indirect sunlight. Rotate them regularly for even growth.
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
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-SemiBold',
  },
  plantsScroll: {
    paddingRight: Spacing.md,
  },
  plantCardWrapper: {
    width: 160,
    marginRight: Spacing.md,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.sm,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    ...Typography.button,
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
    fontFamily: 'Inter-SemiBold',
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
    fontFamily: 'Inter-Bold',
    textTransform: 'uppercase',
  },
  tipIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
});
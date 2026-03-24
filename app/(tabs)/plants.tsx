import PlantCard from '@/components/ui/PlantCard';
import { Colors } from '@/constants/Colors';
import { BorderRadius, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { api, Plant } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FILTERS = ['All', 'Healthy', 'Needs Care', 'Indoor', 'Outdoor'];

export default function PlantsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useFocusEffect(
    useCallback(() => {
      fetchPlants();
    }, [])
  );

  const fetchPlants = async () => {
    try {
      setLoading(true);
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

  const filteredPlants = plants.filter(plant => {
    // Search filter
    const matchesSearch = plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.species?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    let matchesFilter = true;
    switch (activeFilter) {
      case 'Healthy':
        matchesFilter = (plant.health_score ?? 0) >= 70;
        break;
      case 'Needs Care':
        matchesFilter = (plant.health_score ?? 100) < 70;
        break;
      case 'Indoor':
        matchesFilter = plant.location?.toLowerCase().includes('indoor') || 
          ['kitchen', 'living room', 'bedroom', 'bathroom', 'office'].some(
            loc => plant.location?.toLowerCase().includes(loc)
          );
        break;
      case 'Outdoor':
        matchesFilter = plant.location?.toLowerCase().includes('outdoor') ||
          ['garden', 'balcony', 'patio'].some(
            loc => plant.location?.toLowerCase().includes(loc)
          );
        break;
    }
    
    return matchesSearch && matchesFilter;
  });

  const handleAddPlant = () => {
    router.push('/(tabs)/scan' as any);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="leaf-outline" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No plants yet!</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Scan your first plant to get started
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        onPress={handleAddPlant}
      >
        <Ionicons name="scan" size={20} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>Scan a Plant</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlantItem = ({ item, index }: { item: Plant; index: number }) => (
    <View style={[
      styles.plantItemWrapper,
      viewMode === 'grid' && { width: '48%' },
      viewMode === 'grid' && index % 2 === 0 && { marginRight: '4%' },
    ]}>
      <PlantCard
        id={item.plant_id}
        name={item.name}
        species={item.species}
        location={item.location}
        imageUrl={item.image_url}
        healthScore={item.health_score}
        variant={viewMode === 'grid' ? 'grid' : 'horizontal'}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Text style={[styles.title, { color: colors.text }]}>My Plants</Text>
        
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search your plants"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeFilter === item 
                  ? styles.filterChipActive 
                  : { backgroundColor: colors.surface }
              ]}
              onPress={() => setActiveFilter(item)}
            >
              <Text style={[
                styles.filterChipText,
                activeFilter === item 
                  ? styles.filterChipTextActive 
                  : { color: Colors.primary }
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <Text style={[styles.plantCount, { color: colors.textSecondary }]}>
            {filteredPlants.length} plant{filteredPlants.length !== 1 ? 's' : ''}
          </Text>
          <View style={styles.toggleButtons}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'grid' && styles.toggleButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons name="grid" size={18} color={viewMode === 'grid' ? Colors.primary : colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list" size={18} color={viewMode === 'list' ? Colors.primary : colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Plant List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPlants}
          keyExtractor={(item) => item.plant_id}
          renderItem={renderPlantItem}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when changing view mode
          contentContainerStyle={[
            styles.listContent,
            filteredPlants.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Add Plant FAB */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddPlant}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
  },
  filtersContainer: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.bodySmall,
    fontFamily: 'Inter-SemiBold',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plantCount: {
    ...Typography.bodySmall,
  },
  toggleButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  toggleButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary + '15',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  listContentEmpty: {
    flex: 1,
  },
  plantItemWrapper: {
    marginBottom: Spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.h3,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    ...Typography.button,
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
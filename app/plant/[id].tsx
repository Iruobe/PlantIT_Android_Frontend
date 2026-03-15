import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import HealthScore from '@/components/ui/HealthScore';
import { Colors, HealthColors } from '@/constants/Colors';
import { BorderRadius, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { api, Plant } from '@/services/api';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchPlant();
  }, [id]);

  const fetchPlant = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPlant(id);
      setPlant(data);
    } catch (err) {
      setError('Failed to load plant details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!plant?.image_url) {
      Alert.alert('No Image', 'Please upload an image first before scanning.');
      return;
    }

    try {
      setScanning(true);
      const result = await api.scanPlant(plant.plant_id);
      // Navigate to scan results
      router.push({
        pathname: '/scan-results',
        params: { 
          scanResult: JSON.stringify(result),
          plantId: plant.plant_id,
        },
      } as any);
    } catch (err) {
      Alert.alert('Scan Failed', 'Could not analyze the plant. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Plant',
      `Are you sure you want to remove ${plant?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deletePlant(plant!.plant_id);
              router.back();
            } catch (err) {
              Alert.alert('Error', 'Failed to remove plant');
            }
          },
        },
      ]
    );
  };

  const handleChat = () => {
    router.push({
      pathname: '/chat',
      params: { plantId: plant?.plant_id },
    } as any);
  };

  const quickActions = [
    { icon: 'water', label: 'Water', color: Colors.info, onPress: () => {} },
    { icon: 'leaf', label: 'Fertilize', color: Colors.primary, onPress: () => {} },
    { icon: 'rotate-right', label: 'Rotate', color: Colors.warning, onPress: () => {} },
    { icon: 'flower', label: 'Repot', color: Colors.secondary, onPress: () => {} },
  ];

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !plant) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle" size={48} color={Colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>{error || 'Plant not found'}</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="secondary" />
      </View>
    );
  }

  const healthScore = plant.health_score ?? 50;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Image */}
      <View style={styles.imageContainer}>
        {plant.image_url ? (
          <Image 
            source={{ uri: plant.image_url.startsWith('http') ? plant.image_url : `https://plant-it-images-dev.s3.eu-west-2.amazonaws.com/${plant.image_url}` }} 
            style={styles.heroImage} 
          />
        ) : (
          <View style={[styles.heroImage, styles.placeholderImage, { backgroundColor: colors.surfaceSecondary }]}>
            <Ionicons name="leaf" size={64} color={colors.textSecondary} />
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>No image yet</Text>
          </View>
        )}
        <View style={[styles.imageOverlay, { paddingTop: insets.top }]}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleChat}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Plant Info Card */}
        <Card style={styles.infoCard} variant="elevated">
          <View style={styles.infoHeader}>
            <View style={styles.infoText}>
              <Text style={[styles.plantName, { color: colors.text }]}>{plant.name}</Text>
              {plant.species && (
                <Text style={[styles.species, { color: colors.textSecondary }]}>{plant.species}</Text>
              )}
              {plant.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color={Colors.primary} />
                  <Text style={[styles.location, { color: Colors.primary }]}>{plant.location}</Text>
                </View>
              )}
              <View style={styles.statusChip}>
                <View style={[styles.statusDot, { backgroundColor: HealthColors.getColor(healthScore) }]} />
                <Text style={[styles.statusText, { color: HealthColors.getColor(healthScore) }]}>
                  {plant.health_status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <HealthScore score={healthScore} size="lg" />
          </View>
        </Card>

        {/* Scan Button */}
        <View style={styles.section}>
          <Button 
            title={scanning ? "Scanning..." : "Scan Plant Health"}
            onPress={handleScan}
            loading={scanning}
            icon={<Ionicons name="scan" size={20} color="#FFFFFF" />}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            {quickActions.map((action, index) => (
              <TouchableOpacity key={index} style={styles.actionButton} onPress={action.onPress}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <MaterialCommunityIcons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Plant Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Details</Text>
          <Card>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Goal</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{plant.goal}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Added</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {new Date(plant.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Last Updated</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {new Date(plant.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </Card>
        </View>

        {/* Delete Button */}
        <View style={styles.section}>
          <Button 
            title="Remove Plant" 
            variant="danger" 
            onPress={handleDelete}
            icon={<Ionicons name="trash-outline" size={20} color={Colors.error} />}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    marginTop: Spacing.sm,
  },
  imageContainer: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    ...Typography.bodySmall,
    marginTop: Spacing.sm,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginTop: -Spacing.xl,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
  },
  infoCard: {
    marginTop: 0,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginRight: Spacing.md,
  },
  plantName: {
    ...Typography.h2,
  },
  species: {
    ...Typography.bodySmall,
    fontStyle: 'italic',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  location: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    ...Typography.caption,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.border,
  },
  detailLabel: {
    ...Typography.bodySmall,
  },
  detailValue: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
});
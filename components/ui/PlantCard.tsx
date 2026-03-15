import { Colors, HealthColors } from '@/constants/Colors';
import { BorderRadius, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface PlantCardProps {
  id: string;
  name: string;
  species?: string;
  location?: string;
  imageUrl?: string;
  healthScore?: number;
  variant?: 'horizontal' | 'grid';
}

export default function PlantCard({ 
  id, 
  name, 
  species, 
  location, 
  imageUrl, 
  healthScore,
  variant = 'grid',
}: PlantCardProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const statusColor = healthScore ? HealthColors.getColor(healthScore) : Colors.light.textSecondary;

  const handlePress = () => {
    router.push(`/plant/${id}`);
  };

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity 
        style={[styles.horizontalContainer, { backgroundColor: colors.surface }]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: imageUrl || 'https://via.placeholder.com/80' }} 
          style={styles.horizontalImage}
        />
        <View style={styles.horizontalContent}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{name}</Text>
          <Text style={[styles.species, { color: colors.textSecondary }]} numberOfLines={1}>
            {species || location}
          </Text>
        </View>
        {healthScore !== undefined && (
          <View style={[styles.scoreBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.scoreText}>{healthScore}%</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.gridContainer, { backgroundColor: colors.surface }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: imageUrl || 'https://via.placeholder.com/150' }} 
          style={styles.gridImage}
        />
        {healthScore !== undefined && (
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        )}
      </View>
      <View style={styles.gridContent}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{name}</Text>
        <Text style={[styles.location, { color: Colors.primary }]} numberOfLines={1}>
          {location || species}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Grid variant
  gridContainer: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    aspectRatio: 1,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  statusDot: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  gridContent: {
    padding: Spacing.sm,
  },
  
  // Horizontal variant
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  horizontalImage: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.md,
  },
  horizontalContent: {
    flex: 1,
  },
  
  // Shared
  name: {
    ...Typography.body,
    fontWeight: '600',
  },
  species: {
    ...Typography.bodySmall,
  },
  location: {
    ...Typography.caption,
    fontWeight: '500',
  },
  scoreBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
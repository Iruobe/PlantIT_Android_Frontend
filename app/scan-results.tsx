import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import HealthScore from '@/components/ui/HealthScore';
import { Colors, HealthColors } from '@/constants/Colors';
import { BorderRadius, Spacing } from '@/constants/Spacing';
import { Typography } from '@/constants/Typography';
import { ScanResult } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



export default function ScanResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ scanResult: string; plantId: string }>();
  const insets = useSafeAreaInsets();
const colorScheme = useColorScheme();
const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const scanResult: ScanResult = params.scanResult 
    ? JSON.parse(params.scanResult) 
    : null;

  if (!scanResult) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No scan results available</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const statusColor = HealthColors.getColor(scanResult.health_score);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={styles.dragHandle} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Plant Info */}
        <View style={styles.plantInfo}>
          <View style={styles.plantHeader}>
            <View>
              <Text style={[styles.plantName, { color: colors.text }]}>
                {scanResult.plant_type || 'Unknown Plant'}
              </Text>
              <View style={[styles.statusChip, { backgroundColor: statusColor + '15' }]}>
                <Ionicons 
                  name={scanResult.health_score >= 70 ? 'checkmark-circle' : 'warning'} 
                  size={16} 
                  color={statusColor} 
                />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {scanResult.health_status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <HealthScore score={scanResult.health_score} size="lg" />
          </View>
        </View>

        {/* Summary */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={20} color={Colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Summary</Text>
          </View>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            {scanResult.summary}
          </Text>
        </Card>

        {/* Issues Found */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={20} color={Colors.warning} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Issues Found</Text>
          </View>
          {scanResult.issues.length > 0 ? (
            <View style={styles.issuesList}>
              {scanResult.issues.map((issue, index) => (
                <View key={index} style={styles.issueItem}>
                  <View style={[styles.issueDot, { backgroundColor: Colors.error }]} />
                  <Text style={[styles.issueText, { color: colors.text }]}>{issue}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noIssues}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.healthy} />
              <Text style={[styles.noIssuesText, { color: colors.textSecondary }]}>
                No issues found - plant is thriving!
              </Text>
            </View>
          )}
        </Card>

        {/* Recommendations */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={20} color={Colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommendations</Text>
          </View>
          <View style={styles.recommendationsList}>
            {scanResult.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={styles.recommendationNumber}>
                  <Text style={styles.recommendationNumberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.recommendationText, { color: colors.text }]}>{rec}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button 
            title="Save to My Plants" 
            onPress={() => router.replace('/(tabs)/plants' as any)}
            icon={<Ionicons name="bookmark" size={20} color="#FFFFFF" />}
          />
          <Button 
            title="Scan Again" 
            variant="secondary"
            onPress={() => router.back()}
            icon={<Ionicons name="refresh" size={20} color={Colors.primary} />}
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
  header: {
    alignItems: 'center',
    paddingBottom: Spacing.sm,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  plantInfo: {
    marginBottom: Spacing.md,
  },
  plantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  plantName: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
  },
  summaryText: {
    ...Typography.body,
    lineHeight: 24,
  },
  issuesList: {
    gap: Spacing.sm,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  issueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  issueText: {
    ...Typography.body,
    flex: 1,
  },
  noIssues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  noIssuesText: {
    ...Typography.body,
    fontStyle: 'italic',
  },
  recommendationsList: {
    gap: Spacing.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  recommendationNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  recommendationText: {
    ...Typography.body,
    flex: 1,
    lineHeight: 22,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});
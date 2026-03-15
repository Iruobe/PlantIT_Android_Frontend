import { HealthColors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface HealthScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SIZES = {
  sm: { container: 48, stroke: 4, fontSize: 14 },
  md: { container: 64, stroke: 5, fontSize: 18 },
  lg: { container: 96, stroke: 6, fontSize: 24 },
};

export default function HealthScore({ score, size = 'md', showLabel = false }: HealthScoreProps) {
  const config = SIZES[size];
  const radius = (config.container - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = HealthColors.getColor(score);

  return (
    <View style={styles.container}>
      <View style={[styles.scoreContainer, { width: config.container, height: config.container }]}>
        <Svg width={config.container} height={config.container}>
          {/* Background circle */}
          <Circle
            cx={config.container / 2}
            cy={config.container / 2}
            r={radius}
            stroke={color + '20'}
            strokeWidth={config.stroke}
            fill="transparent"
          />
          {/* Progress circle */}
          <Circle
            cx={config.container / 2}
            cy={config.container / 2}
            r={radius}
            stroke={color}
            strokeWidth={config.stroke}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${config.container / 2} ${config.container / 2})`}
          />
        </Svg>
        <Text style={[
          styles.scoreText, 
          { fontSize: config.fontSize, color }
        ]}>
          {score}
        </Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, { color }]}>
          {HealthColors.getStatus(score).replace('_', ' ')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  scoreContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    position: 'absolute',
    fontWeight: '700',
  },
  label: {
    ...Typography.caption,
    textTransform: 'capitalize',
  },
});
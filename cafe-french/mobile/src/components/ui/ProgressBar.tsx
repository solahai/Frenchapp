// Progress Bar Component

import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, borderRadius, spacing, typography } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  showLabel?: boolean;
  labelPosition?: 'top' | 'right' | 'inside';
  animated?: boolean;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = colors.primary,
  backgroundColor = colors.surfaceVariant,
  height = 8,
  showLabel = false,
  labelPosition = 'right',
  animated = true,
  style,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const animatedWidth = useAnimatedStyle(() => {
    return {
      width: animated
        ? withTiming(`${clampedProgress}%`, {
            duration: 500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          })
        : `${clampedProgress}%`,
    };
  }, [clampedProgress, animated]);

  const renderLabel = () => {
    if (!showLabel) return null;
    
    return (
      <Text style={[
        styles.label,
        labelPosition === 'inside' && styles.insideLabel,
      ]}>
        {Math.round(clampedProgress)}%
      </Text>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {showLabel && labelPosition === 'top' && (
        <View style={styles.topLabelContainer}>
          {renderLabel()}
        </View>
      )}
      
      <View style={styles.row}>
        <View
          style={[
            styles.track,
            { backgroundColor, height },
          ]}
        >
          <Animated.View
            style={[
              styles.fill,
              { backgroundColor: color, height },
              animatedWidth,
            ]}
          >
            {showLabel && labelPosition === 'inside' && clampedProgress > 10 && (
              <Text style={styles.insideLabel}>
                {Math.round(clampedProgress)}%
              </Text>
            )}
          </Animated.View>
        </View>
        
        {showLabel && labelPosition === 'right' && renderLabel()}
      </View>
    </View>
  );
};

interface SkillProgressProps {
  skill: string;
  level: string;
  progress: number;
  color: string;
}

export const SkillProgress: React.FC<SkillProgressProps> = ({
  skill,
  level,
  progress,
  color,
}) => {
  return (
    <View style={styles.skillContainer}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillName}>{skill}</Text>
        <Text style={[styles.skillLevel, { color }]}>{level}</Text>
      </View>
      <ProgressBar progress={progress} color={color} height={6} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  track: {
    flex: 1,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  
  fill: {
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: spacing.xs,
  },
  
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    minWidth: 40,
  },
  
  topLabelContainer: {
    marginBottom: spacing.xs,
  },
  
  insideLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 0,
  },
  
  // Skill progress
  skillContainer: {
    marginBottom: spacing.md,
  },
  
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  
  skillName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  
  skillLevel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
  },
});

export default ProgressBar;

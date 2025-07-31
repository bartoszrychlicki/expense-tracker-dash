/**
 * Skeleton Component
 * 
 * A reusable skeleton component for displaying loading states
 * with animated shimmer effects and customizable dimensions.
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface SkeletonProps {
  /** Width of the skeleton element */
  width?: number | string;
  /** Height of the skeleton element */
  height?: number | string;
  /** Border radius for rounded corners */
  borderRadius?: number;
  /** Optional custom className for additional styling */
  className?: string;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Animation type - shimmer or pulse */
  animationType?: 'shimmer' | 'pulse';
}

/**
 * Skeleton displays an animated loading placeholder
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  className = '',
  duration = 1500,
  animationType = 'shimmer',
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (animationType === 'shimmer') {
      const startShimmerAnimation = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(shimmerAnimation, {
              toValue: 1,
              duration,
              useNativeDriver: false,
            }),
            Animated.timing(shimmerAnimation, {
              toValue: 0,
              duration,
              useNativeDriver: false,
            }),
          ])
        ).start();
      };
      startShimmerAnimation();
    } else {
      const startPulseAnimation = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimation, {
              toValue: 0.7,
              duration: duration / 2,
              useNativeDriver: false,
            }),
            Animated.timing(pulseAnimation, {
              toValue: 0.3,
              duration: duration / 2,
              useNativeDriver: false,
            }),
          ])
        ).start();
      };
      startPulseAnimation();
    }
  }, [shimmerAnimation, pulseAnimation, duration, animationType]);

  const baseStyle = {
    width: width as any,
    height: height as any,
    borderRadius,
    backgroundColor: '#e2e8f0', // bg-slate-200 equivalent
    overflow: 'hidden' as const,
  };

  if (animationType === 'pulse') {
    return (
      <Animated.View
        style={[
          baseStyle,
          {
            opacity: pulseAnimation,
          }
        ]}
      />
    );
  }

  // Shimmer animation
  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={baseStyle}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#cbd5e1', // bg-slate-300 equivalent
          opacity: shimmerOpacity,
          transform: [
            {
              translateX: shimmerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-200, 200],
              }),
            },
          ],
        }}
      />
    </View>
  );
};
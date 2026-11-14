import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow } from '../theme';
import { useStore } from '../store';

export function Card({ style, children }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({ title, onPress, variant = 'primary', style, textStyle, disabled, icon }) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color: v.fg }, textStyle]}>
        {icon ? `${icon}  ` : ''}
        {title}
      </Text>
    </Pressable>
  );
}

const VARIANTS = {
  primary: { bg: colors.primary, fg: 'white', border: colors.primary },
  soft: { bg: '#E3F7FA', fg: colors.primaryDark, border: '#E3F7FA' },
  outline: { bg: 'white', fg: colors.primaryDark, border: colors.border },
  danger: { bg: '#FFECEC', fg: colors.danger, border: '#FFECEC' },
  gold: { bg: colors.gold, fg: '#5A3B00', border: colors.gold },
};

export function ProgressBar({ progress, color = colors.primary, height = 14, style }) {
  const anim = useRef(new Animated.Value(Math.min(1, progress))).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: Math.min(1, progress), duration: 500, useNativeDriver: false }).start();
  }, [progress, anim]);
  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      <Animated.View style={{ width, height, borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}

export function CoinPill({ coins }) {
  return (
    <View style={styles.coinPill}>
      <Text style={styles.coinText}>🪙 {coins}</Text>
    </View>
  );
}

export function ScreenTitle({ title, subtitle, right }) {
  return (
    <View style={styles.titleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function SectionLabel({ children }) {
  return <Text style={styles.section}>{children}</Text>;
}

function ToastItem({ toast, onDone }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(anim, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.delay(toast.kind === 'achievement' || toast.kind === 'goal' ? 2600 : 1500),
      Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => onDone(toast.id));
  }, [anim, onDone, toast]);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const bg = toast.kind === 'achievement' ? colors.gold : toast.kind === 'goal' ? colors.success : colors.primaryDark;
  const fg = toast.kind === 'achievement' ? '#5A3B00' : 'white';
  return (
    <Animated.View style={[styles.toast, { backgroundColor: bg, opacity: anim, transform: [{ translateY }] }]}>
      <Text style={[styles.toastText, { color: fg }]}>{toast.text}</Text>
    </Animated.View>
  );
}

// Shows the first queued toast at the top of the screen.
export function ToastHost({ top = 8 }) {
  const { state, dismissToast } = useStore();
  const toast = state.toasts[0];
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={[styles.toastHost, { top }]}>
      <ToastItem key={toast.id} toast={toast} onDone={dismissToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 18,
    ...shadow,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  buttonText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  track: { backgroundColor: '#E1F3F6', overflow: 'hidden' },
  coinPill: {
    backgroundColor: '#FFF5D6',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#FFE49A',
  },
  coinText: { fontSize: 16, fontWeight: '800', color: '#7A5200' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: colors.textSoft, marginTop: 2 },
  section: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSoft,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 22,
    marginBottom: 10,
    marginLeft: 4,
  },
  toastHost: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 100 },
  toast: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999, ...shadow },
  toastText: { fontSize: 15, fontWeight: '700' },
});

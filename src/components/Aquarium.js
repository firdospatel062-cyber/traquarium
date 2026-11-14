import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';
import { getDecoration, getMood } from '../data';

const MIN_WATER = 0.14; // tank is never bone dry, so Bubbles has somewhere to swim

function Bubble({ left, delay, size, height }) {
  const rise = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(rise, { toValue: 1, duration: 4200, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(rise, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay, rise]);
  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [0, -height] });
  const opacity = rise.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 0.9, 0.7, 0] });
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.bubble, { left: `${left}%`, width: size, height: size, borderRadius: size / 2, opacity, transform: [{ translateY }] }]}
    />
  );
}

function SwimmingDeco({ deco, waterHeight }) {
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1800 + deco.size * 20, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1800 + deco.size * 20, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [bob, deco.size]);
  const bottom = Animated.multiply(waterHeight, deco.y / 100);
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: `${deco.x}%`, bottom }}>
      <Animated.Text style={{ fontSize: deco.size, transform: [{ translateY }] }}>{deco.emoji}</Animated.Text>
    </Animated.View>
  );
}

export default function Aquarium({ progress = 0, decorations = [], height = 300, showMood = true }) {
  const [width, setWidth] = useState(0);
  const level = Math.max(MIN_WATER, Math.min(1, progress)) * (height - 18);

  const waterHeight = useRef(new Animated.Value(level)).current;
  const swim = useRef(new Animated.Value(0)).current;
  const flip = useRef(new Animated.Value(1)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;
  const prevProgress = useRef(progress);

  // Water rises / falls smoothly
  useEffect(() => {
    Animated.spring(waterHeight, { toValue: level, friction: 7, tension: 30, useNativeDriver: false }).start();
    if (progress > prevProgress.current) {
      Animated.sequence([
        Animated.timing(pop, { toValue: 1.35, duration: 160, useNativeDriver: true }),
        Animated.spring(pop, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
    }
    prevProgress.current = progress;
  }, [level, progress, pop, waterHeight]);

  // Fish swims back and forth; happier fish swim faster
  const speed = 6000 - Math.min(1, progress) * 2800;
  useEffect(() => {
    if (!width) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(flip, { toValue: -1, duration: 220, useNativeDriver: true }),
        Animated.timing(swim, { toValue: 1, duration: speed, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(flip, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(swim, { toValue: 0, duration: speed, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [width, speed, swim, flip]);

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [bob]);

  const fishSize = 54;
  const translateX = swim.interpolate({ inputRange: [0, 1], outputRange: [16, Math.max(16, width - fishSize - 16)] });
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -10] });
  const fishBottom = Animated.add(Animated.multiply(waterHeight, 0.42), 6);
  const mood = getMood(progress);

  const decos = decorations.map(getDecoration).filter(Boolean);
  const floor = decos.filter((d) => d.zone === 'floor');
  const swimmers = decos.filter((d) => d.zone === 'swim');

  return (
    <View style={[styles.tank, { height }]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {/* air / glass */}
      <View style={styles.glassShine} />

      {/* water */}
      <Animated.View style={[styles.water, { height: waterHeight }]}>
        <View style={styles.waterSurface} />
        <View style={styles.waterDeep} />
        {[12, 34, 58, 81, 92].map((left, i) => (
          <Bubble key={left} left={left} delay={i * 800} size={6 + (i % 3) * 3} height={height * 0.8} />
        ))}
      </Animated.View>

      {/* sand */}
      <View style={styles.sand}>
        <View style={[styles.sandBump, { left: '10%' }]} />
        <View style={[styles.sandBump, { left: '55%', width: 140 }]} />
      </View>

      {/* decorations on the floor */}
      {floor.map((d) => (
        <Text key={d.id} style={[styles.floorDeco, { left: `${d.x}%`, bottom: `${d.y}%`, fontSize: d.size }]}>
          {d.emoji}
        </Text>
      ))}

      {swimmers.map((d) => (
        <SwimmingDeco key={d.id} deco={d} waterHeight={waterHeight} />
      ))}

      {/* Bubbles the fish */}
      <Animated.View pointerEvents="none" style={[styles.fishWrap, { bottom: fishBottom }]}>
        <Animated.View style={{ transform: [{ translateX }, { translateY }] }}>
          {showMood && (
            <View style={styles.moodBubble}>
              <Text style={styles.moodText}>{mood.face}</Text>
            </View>
          )}
          <Animated.Text style={{ fontSize: fishSize, transform: [{ scaleX: flip }, { scale: pop }] }}>🐠</Animated.Text>
        </Animated.View>
      </Animated.View>

      {progress >= 1 && <Text style={styles.sparkle}>✨</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  tank: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: '#F2FCFE',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  glassShine: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 10,
    height: 70,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 5,
  },
  water: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.water,
    overflow: 'hidden',
  },
  waterSurface: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  waterDeep: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    backgroundColor: 'rgba(42,157,184,0.35)',
  },
  bubble: {
    position: 'absolute',
    bottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  sand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 18,
    backgroundColor: colors.sand,
  },
  sandBump: {
    position: 'absolute',
    top: -8,
    width: 110,
    height: 24,
    borderRadius: 30,
    backgroundColor: colors.sand,
  },
  floorDeco: { position: 'absolute' },
  fishWrap: { position: 'absolute', left: 0 },
  moodBubble: {
    position: 'absolute',
    top: -26,
    left: 30,
    backgroundColor: 'white',
    borderRadius: 14,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  moodText: { fontSize: 18 },
  sparkle: { position: 'absolute', top: 12, right: 16, fontSize: 26 },
});

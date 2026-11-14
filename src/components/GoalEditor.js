import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { Button } from './ui';
import { GLASS_ML } from '../data';

const PRESETS = [1500, 2000, 2500, 3000];
const MIN = 500;
const MAX = 5000;

export default function GoalEditor({ value, onSave, onCancel }) {
  const [goal, setGoal] = useState(value);
  useEffect(() => setGoal(value), [value]);
  const change = (d) => setGoal((g) => Math.min(MAX, Math.max(MIN, g + d)));

  return (
    <View>
      <View style={styles.stepper}>
        <Pressable style={styles.stepBtn} onPress={() => change(-GLASS_ML)} accessibilityLabel="Decrease goal">
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <View style={{ alignItems: 'center', minWidth: 130 }}>
          <Text style={styles.value}>{goal}</Text>
          <Text style={styles.unit}>ml · {Math.round(goal / GLASS_ML)} glasses</Text>
        </View>
        <Pressable style={styles.stepBtn} onPress={() => change(GLASS_ML)} accessibilityLabel="Increase goal">
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <Pressable key={p} onPress={() => setGoal(p)} style={[styles.preset, goal === p && styles.presetOn]}>
            <Text style={[styles.presetText, goal === p && { color: 'white' }]}>{p / 1000} L</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        {onCancel && <Button title="Cancel" variant="outline" onPress={onCancel} style={{ flex: 1 }} />}
        <Button title="Save goal" onPress={() => onSave(goal)} disabled={goal === value} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#E3F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { fontSize: 28, fontWeight: '700', color: colors.primaryDark, marginTop: -2 },
  value: { fontSize: 38, fontWeight: '800', color: colors.text },
  unit: { fontSize: 13, color: colors.textSoft, fontWeight: '600' },
  presets: { flexDirection: 'row', gap: 8, marginTop: 16 },
  preset: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    backgroundColor: '#F1FAFC',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  presetOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  presetText: { fontWeight: '700', color: colors.primaryDark },
});

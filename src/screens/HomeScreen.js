import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../store';
import { colors, radius } from '../theme';
import { Button, Card, CoinPill, ProgressBar, SectionLabel } from '../components/ui';
import Aquarium from '../components/Aquarium';
import GoalEditor from '../components/GoalEditor';
import { GLASS_ML, getMood } from '../data';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatTime(t) {
  const d = new Date(t);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function HomeScreen() {
  const { state, todayTotal, todayGoal, todayEntries, progress, goalMet, streak, logWater, undoLast, removeEntry, setGoal } =
    useStore();
  const [editingGoal, setEditingGoal] = useState(false);
  const mood = getMood(progress);
  const remaining = Math.max(0, todayGoal - todayTotal);
  const pct = Math.round(Math.min(1, progress) * 100);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>
            {greeting()}, {state.name} 👋
          </Text>
          <Text style={styles.sub}>Keep Bubbles happy by staying hydrated</Text>
        </View>
        <CoinPill coins={state.coins} />
      </View>

      {/* Aquarium */}
      <Aquarium progress={progress} decorations={state.selected} />

      {/* Mood message */}
      <View style={[styles.moodCard, goalMet && { backgroundColor: '#E2F8EE' }]}>
        <Text style={styles.moodFace}>{mood.face}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.moodLabel}>Bubbles is {mood.label.toLowerCase()}</Text>
          <Text style={styles.moodMsg}>{mood.message}</Text>
        </View>
      </View>

      {/* Progress */}
      <Card style={{ marginTop: 14 }}>
        <View style={styles.progressTop}>
          <View>
            <Text style={styles.big}>
              {todayTotal}
              <Text style={styles.bigUnit}> / {todayGoal} ml</Text>
            </Text>
            <Text style={styles.small}>{goalMet ? '🎉 Daily goal complete!' : `${remaining} ml to go · ${Math.ceil(remaining / GLASS_ML)} glasses`}</Text>
          </View>
          <View style={styles.pctBadge}>
            <Text style={styles.pctText}>{pct}%</Text>
          </View>
        </View>
        <ProgressBar progress={progress} color={goalMet ? colors.success : colors.primary} style={{ marginTop: 14 }} />
        <View style={styles.chips}>
          <Text style={styles.chip}>🥛 {todayEntries.length} glasses</Text>
          <Text style={styles.chip}>🔥 {streak} day streak</Text>
          <Pressable onPress={() => setEditingGoal(true)}>
            <Text style={[styles.chip, styles.chipLink]}>🎯 Goal {todayGoal / 1000} L ✎</Text>
          </Pressable>
        </View>
      </Card>

      {/* Actions */}
      <Button title={`Drink a glass (${GLASS_ML} ml)`} icon="💧" onPress={() => logWater(GLASS_ML)} style={styles.logBtn} textStyle={{ fontSize: 18 }} />
      <Button title="Undo last glass" icon="↩️" variant="soft" onPress={undoLast} disabled={todayEntries.length === 0} style={{ marginTop: 10 }} />

      {/* Today's log */}
      <SectionLabel>Today's log</SectionLabel>
      <Card style={{ paddingVertical: 6 }}>
        {todayEntries.length === 0 ? (
          <Text style={styles.empty}>No water yet today. Tap the button above to start! 🐠</Text>
        ) : (
          [...todayEntries].reverse().map((e, i) => (
            <View key={e.id} style={[styles.entry, i > 0 && styles.entryBorder]}>
              <Text style={styles.entryIcon}>💧</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.entryMl}>{e.ml} ml</Text>
                <Text style={styles.entryTime}>{formatTime(e.t)}</Text>
              </View>
              <Text style={styles.entryCoins}>+{e.coins} 🪙</Text>
              <Pressable onPress={() => removeEntry(e.id)} hitSlop={10} style={styles.removeBtn} accessibilityLabel="Remove entry">
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </View>
          ))
        )}
      </Card>

      <Modal visible={editingGoal} transparent animationType="fade" onRequestClose={() => setEditingGoal(false)}>
        <View style={styles.modalBg}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>🎯 Daily water goal</Text>
            <Text style={styles.modalSub}>Most adults aim for around 2–2.5 L a day.</Text>
            <GoalEditor
              value={todayGoal}
              onCancel={() => setEditingGoal(false)}
              onSave={(g) => {
                setGoal(g);
                setEditingGoal(false);
              }}
            />
          </Card>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  hello: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  sub: { fontSize: 14, color: colors.textSoft, marginTop: 2 },
  moodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E3F7FA',
    borderRadius: radius.lg,
    padding: 14,
    marginTop: 14,
  },
  moodFace: { fontSize: 32 },
  moodLabel: { fontSize: 15, fontWeight: '800', color: colors.text },
  moodMsg: { fontSize: 14, color: colors.textSoft, marginTop: 2 },
  progressTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  big: { fontSize: 30, fontWeight: '800', color: colors.text },
  bigUnit: { fontSize: 16, fontWeight: '600', color: colors.textSoft },
  small: { fontSize: 14, color: colors.textSoft, marginTop: 2 },
  pctBadge: { backgroundColor: '#E3F7FA', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  pctText: { fontSize: 18, fontWeight: '800', color: colors.primaryDark },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSoft,
    backgroundColor: '#F1FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  chipLink: { color: colors.primaryDark, backgroundColor: '#DDF4F8' },
  logBtn: { marginTop: 18, paddingVertical: 18 },
  empty: { color: colors.textSoft, textAlign: 'center', paddingVertical: 18, fontSize: 14 },
  entry: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  entryBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  entryIcon: { fontSize: 22 },
  entryMl: { fontSize: 16, fontWeight: '700', color: colors.text },
  entryTime: { fontSize: 13, color: colors.textMuted },
  entryCoins: { fontSize: 13, fontWeight: '700', color: '#B08300' },
  removeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFECEC', alignItems: 'center', justifyContent: 'center' },
  removeText: { color: colors.danger, fontWeight: '800' },
  modalBg: { flex: 1, backgroundColor: 'rgba(14,60,70,0.35)', justifyContent: 'center', padding: 24 },
  modalCard: { padding: 22 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  modalSub: { fontSize: 14, color: colors.textSoft, marginTop: 4, marginBottom: 18 },
});

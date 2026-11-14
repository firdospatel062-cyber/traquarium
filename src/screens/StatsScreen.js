import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { dayGoal, dayTotal, shiftDays, useStore } from '../store';
import { colors, radius } from '../theme';
import { Card, ProgressBar, ScreenTitle, SectionLabel } from '../components/ui';
import { ACHIEVEMENTS } from '../data';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CHART_H = 150;

function StatTile({ emoji, value, label }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileEmoji}>{emoji}</Text>
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

function WeeklyChart({ days }) {
  const [active, setActive] = useState(days.length - 1);
  const max = Math.max(...days.map((d) => Math.max(d.total, d.goal)), 1);
  const sel = days[active];
  return (
    <View>
      <Text style={styles.chartReadout}>
        <Text style={{ fontWeight: '800', color: colors.text }}>{sel.label}</Text> · {sel.total} ml of {sel.goal} ml{' '}
        {sel.met ? '✅' : ''}
      </Text>
      <View style={styles.chart}>
        {days.map((d, i) => {
          const h = (d.total / max) * CHART_H;
          const goalY = (d.goal / max) * CHART_H;
          return (
            <Pressable key={d.key} style={styles.barCol} onPress={() => setActive(i)} hitSlop={4}>
              <View style={[styles.barArea, { height: CHART_H }]}>
                <View style={[styles.goalTick, { bottom: goalY }]} />
                <View
                  style={[
                    styles.bar,
                    { height: Math.max(h, d.total > 0 ? 6 : 0), backgroundColor: d.met ? colors.primary : colors.aqua },
                    i === active && styles.barActive,
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, i === active && { color: colors.text, fontWeight: '800' }]}>{d.short}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>Goal met</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: colors.aqua }]} />
          <Text style={styles.legendText}>Below goal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.swatch, { height: 2, backgroundColor: colors.textMuted }]} />
          <Text style={styles.legendText}>Daily goal</Text>
        </View>
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const { state, today, todayTotal, todayGoal, progress, streak, bestStreak, lifetimeMl } = useStore();

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const key = shiftDays(today, -i);
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const total = dayTotal(state, key);
    const goal = dayGoal(state, key);
    days.push({
      key,
      total,
      goal,
      met: total > 0 && total >= goal,
      short: i === 0 ? 'Today' : DAY_NAMES[date.getDay()],
      label: i === 0 ? 'Today' : date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }),
    });
  }
  const weekTotal = days.reduce((s, d) => s + d.total, 0);
  const daysMet = days.filter((d) => d.met).length;
  const unlocked = ACHIEVEMENTS.filter((a) => state.achievements[a.id]).length;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenTitle title="Your Progress 📊" subtitle="Every drop adds up" />

      <Card>
        <Text style={styles.cardTitle}>Today</Text>
        <Text style={styles.todayBig}>
          {todayTotal} <Text style={styles.todayUnit}>/ {todayGoal} ml</Text>
        </Text>
        <ProgressBar progress={progress} color={progress >= 1 ? colors.success : colors.primary} style={{ marginTop: 10 }} />
        <Text style={styles.cardSub}>
          {progress >= 1 ? '🎉 Goal completed — amazing!' : `${Math.round(Math.min(1, progress) * 100)}% of your daily goal`}
        </Text>
      </Card>

      <View style={styles.tiles}>
        <StatTile emoji="🔥" value={streak} label="Current streak" />
        <StatTile emoji="🏅" value={bestStreak} label="Best streak" />
        <StatTile emoji="🪙" value={state.totalCoinsEarned} label="Coins earned" />
        <StatTile emoji="🌊" value={`${(lifetimeMl / 1000).toFixed(1)} L`} label="All-time water" />
      </View>

      <SectionLabel>This week</SectionLabel>
      <Card>
        <View style={styles.weekRow}>
          <Text style={styles.weekStat}>
            <Text style={styles.weekNum}>{(weekTotal / 1000).toFixed(1)} L</Text> total
          </Text>
          <Text style={styles.weekStat}>
            <Text style={styles.weekNum}>{daysMet}/7</Text> goals met
          </Text>
        </View>
        <WeeklyChart days={days} />
      </Card>

      <SectionLabel>
        Achievements · {unlocked}/{ACHIEVEMENTS.length}
      </SectionLabel>
      <Card style={{ paddingVertical: 6 }}>
        {ACHIEVEMENTS.map((a, i) => {
          const got = !!state.achievements[a.id];
          return (
            <View key={a.id} style={[styles.ach, i > 0 && styles.achBorder, !got && { opacity: 0.5 }]}>
              <View style={[styles.achIcon, got && { backgroundColor: '#FFF5D6' }]}>
                <Text style={{ fontSize: 22 }}>{got ? a.emoji : '🔒'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.achTitle}>{a.title}</Text>
                <Text style={styles.achDesc}>{a.desc}</Text>
              </View>
              <Text style={[styles.achReward, got && { color: colors.success }]}>{got ? '✓' : `+${a.reward} 🪙`}</Text>
            </View>
          );
        })}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: colors.textSoft, textTransform: 'uppercase', letterSpacing: 1 },
  cardSub: { fontSize: 14, color: colors.textSoft, marginTop: 8 },
  todayBig: { fontSize: 34, fontWeight: '800', color: colors.text, marginTop: 4 },
  todayUnit: { fontSize: 16, color: colors.textSoft, fontWeight: '600' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 12 },
  tile: { width: '48.5%', backgroundColor: 'white', borderRadius: radius.lg, padding: 16, borderWidth: 1.5, borderColor: colors.border },
  tileEmoji: { fontSize: 24 },
  tileValue: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 6 },
  tileLabel: { fontSize: 13, color: colors.textSoft, fontWeight: '600' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  weekStat: { fontSize: 14, color: colors.textSoft },
  weekNum: { fontSize: 18, fontWeight: '800', color: colors.text },
  chartReadout: { fontSize: 13, color: colors.textSoft, marginBottom: 10 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center' },
  barArea: { width: '100%', alignItems: 'center', justifyContent: 'flex-end', borderBottomWidth: 1, borderBottomColor: colors.border },
  bar: { width: 22, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barActive: { borderWidth: 2, borderColor: colors.primaryDark, borderBottomWidth: 0 },
  goalTick: { position: 'absolute', left: 4, right: 4, height: 2, borderRadius: 1, backgroundColor: colors.textMuted },
  barLabel: { fontSize: 11, color: colors.textMuted, marginTop: 6, fontWeight: '600' },
  legend: { flexDirection: 'row', gap: 14, marginTop: 14, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 12, color: colors.textSoft },
  ach: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  achBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  achIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF4F5', alignItems: 'center', justifyContent: 'center' },
  achTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  achDesc: { fontSize: 13, color: colors.textSoft },
  achReward: { fontSize: 13, fontWeight: '800', color: '#B08300' },
});

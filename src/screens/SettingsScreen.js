import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useStore } from '../store';
import { colors, radius } from '../theme';
import { Button, Card, ScreenTitle, SectionLabel } from '../components/ui';
import GoalEditor from '../components/GoalEditor';
import { COINS_PER_GLASS, GLASS_ML, GOAL_BONUS_COINS } from '../data';

export default function SettingsScreen() {
  const { state, todayGoal, setGoal, setName, resetToday, resetAll, addTestCoins } = useStore();
  const [name, setNameDraft] = useState(state.name);
  useEffect(() => setNameDraft(state.name), [state.name]);

  const saveName = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== state.name) setName(trimmed);
    else setNameDraft(state.name);
  };

  const confirm = (title, message, onOk, okText = 'Reset') =>
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: okText, style: 'destructive', onPress: onOk },
    ]);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <ScreenTitle title="Settings ⚙️" subtitle="Make Traquarium yours" />

      <SectionLabel>Your name</SectionLabel>
      <Card>
        <TextInput
          value={name}
          onChangeText={setNameDraft}
          onBlur={saveName}
          onSubmitEditing={saveName}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          returnKeyType="done"
          maxLength={20}
        />
      </Card>

      <SectionLabel>Daily water goal</SectionLabel>
      <Card>
        <GoalEditor value={todayGoal} onSave={setGoal} />
      </Card>

      <SectionLabel>Testing tools</SectionLabel>
      <Card style={{ gap: 10 }}>
        <Button
          title="Reset today's progress"
          icon="🧽"
          variant="soft"
          onPress={() => confirm("Reset today?", "This clears today's water log (coins are kept).", resetToday)}
        />
        <Button title="Add 100 test coins" icon="🪙" variant="gold" onPress={() => addTestCoins(100)} />
        <Button
          title="Erase all data"
          icon="🗑️"
          variant="danger"
          onPress={() => confirm('Erase everything?', 'Coins, decorations, history and achievements will be deleted.', resetAll, 'Erase')}
        />
      </Card>

      <SectionLabel>About</SectionLabel>
      <Card>
        <Text style={styles.appName}>🐠 Traquarium</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.about}>
          Traquarium turns hydration into a game. Every glass of water you drink fills your aquarium, makes Bubbles the fish
          happier, and earns coins to decorate your tank.
        </Text>
        <View style={styles.rules}>
          <Text style={styles.rule}>💧 1 glass = {GLASS_ML} ml</Text>
          <Text style={styles.rule}>🪙 +{COINS_PER_GLASS} coins per glass</Text>
          <Text style={styles.rule}>🎯 +{GOAL_BONUS_COINS} bonus coins for hitting your goal</Text>
          <Text style={styles.rule}>🔥 Hit your goal on consecutive days to build a streak</Text>
          <Text style={styles.rule}>🏆 Unlock achievements for extra coins</Text>
        </View>
        <Text style={styles.note}>All data is stored privately on this device.</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  input: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: '#F1FAFC',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  appName: { fontSize: 20, fontWeight: '800', color: colors.text },
  version: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  about: { fontSize: 14, color: colors.textSoft, marginTop: 10, lineHeight: 20 },
  rules: { marginTop: 12, gap: 6 },
  rule: { fontSize: 14, color: colors.text },
  note: { fontSize: 12, color: colors.textMuted, marginTop: 14 },
});

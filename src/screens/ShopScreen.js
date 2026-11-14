import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../store';
import { colors, radius, shadow } from '../theme';
import { CoinPill, ScreenTitle, SectionLabel } from '../components/ui';
import Aquarium from '../components/Aquarium';
import { DECORATIONS } from '../data';

function ShopItem({ item, owned, selected, canAfford, onBuy, onToggle }) {
  let action;
  if (!owned) {
    action = (
      <Pressable onPress={onBuy} disabled={!canAfford} style={[styles.action, canAfford ? styles.buy : styles.locked]}>
        <Text style={[styles.actionText, { color: canAfford ? '#5A3B00' : colors.textMuted }]}>🪙 {item.price}</Text>
      </Pressable>
    );
  } else {
    action = (
      <Pressable onPress={onToggle} style={[styles.action, selected ? styles.on : styles.off]}>
        <Text style={[styles.actionText, { color: selected ? 'white' : colors.primaryDark }]}>{selected ? '✓ Placed' : 'Place'}</Text>
      </Pressable>
    );
  }
  return (
    <View style={[styles.item, selected && styles.itemSelected]}>
      {owned && <Text style={styles.ownedTag}>OWNED</Text>}
      <View style={styles.emojiCircle}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.zone}>{item.zone === 'swim' ? 'Swims around' : 'Sits on sand'}</Text>
      {action}
    </View>
  );
}

export default function ShopScreen() {
  const { state, progress, buy, toggleDecoration } = useStore();
  const ownedCount = state.owned.length;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenTitle title="Aquarium Shop 🛍️" subtitle="Spend coins to decorate your tank" right={<CoinPill coins={state.coins} />} />

      <Aquarium progress={progress} decorations={state.selected} height={190} showMood={false} />
      <Text style={styles.hint}>
        {ownedCount === 0
          ? 'Earn 10 coins per glass of water, plus a bonus when you reach your goal.'
          : `You own ${ownedCount} of ${DECORATIONS.length} decorations · tap "Placed" to hide one.`}
      </Text>

      <SectionLabel>Decorations</SectionLabel>
      <View style={styles.grid}>
        {DECORATIONS.map((item) => (
          <ShopItem
            key={item.id}
            item={item}
            owned={state.owned.includes(item.id)}
            selected={state.selected.includes(item.id)}
            canAfford={state.coins >= item.price}
            onBuy={() => buy(item.id)}
            onToggle={() => toggleDecoration(item.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  hint: { fontSize: 13, color: colors.textSoft, textAlign: 'center', marginTop: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  item: {
    width: '48.5%',
    backgroundColor: 'white',
    borderRadius: radius.lg,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadow,
  },
  itemSelected: { borderColor: colors.aqua },
  ownedTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
    letterSpacing: 0.5,
  },
  emojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E3F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emoji: { fontSize: 40 },
  name: { fontSize: 15, fontWeight: '800', color: colors.text },
  zone: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 10 },
  action: { alignSelf: 'stretch', borderRadius: 999, paddingVertical: 9, alignItems: 'center' },
  actionText: { fontWeight: '800', fontSize: 14 },
  buy: { backgroundColor: colors.gold },
  locked: { backgroundColor: '#EEF4F5' },
  on: { backgroundColor: colors.primary },
  off: { backgroundColor: '#E3F7FA' },
});

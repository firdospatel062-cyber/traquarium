import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/store';
import { colors, shadow } from './src/theme';
import { ToastHost } from './src/components/ui';
import HomeScreen from './src/screens/HomeScreen';
import ShopScreen from './src/screens/ShopScreen';
import StatsScreen from './src/screens/StatsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const TABS = [
  { key: 'home', label: 'Aquarium', icon: '🐠', Screen: HomeScreen },
  { key: 'shop', label: 'Shop', icon: '🛍️', Screen: ShopScreen },
  { key: 'stats', label: 'Progress', icon: '📊', Screen: StatsScreen },
  { key: 'settings', label: 'Settings', icon: '⚙️', Screen: SettingsScreen },
];

function TabBar({ active, onChange }) {
  return (
    <View style={styles.tabBar}>
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Pressable key={t.key} onPress={() => onChange(t.key)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <View style={[styles.tabIconWrap, on && styles.tabIconOn]}>
              <Text style={styles.tabIcon}>{t.icon}</Text>
            </View>
            <Text style={[styles.tabLabel, on && styles.tabLabelOn]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Main() {
  const { state } = useStore();
  const [tab, setTab] = useState('home');

  if (!state.hydrated) {
    return (
      <View style={styles.loading}>
        <Text style={{ fontSize: 56 }}>🐠</Text>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
      </View>
    );
  }

  const { Screen } = TABS.find((t) => t.key === tab);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Screen key={tab} />
        <ToastHost />
      </View>
      <SafeAreaView edges={['bottom']} style={styles.tabSafe}>
        <TabBar active={tab} onChange={setTab} />
      </SafeAreaView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Main />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  tabSafe: { backgroundColor: 'white', borderTopLeftRadius: 26, borderTopRightRadius: 26, ...shadow },
  tabBar: { flexDirection: 'row', paddingTop: 8, paddingBottom: 6, paddingHorizontal: 8 },
  tab: { flex: 1, alignItems: 'center' },
  tabIconWrap: { width: 48, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tabIconOn: { backgroundColor: '#DDF4F8' },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, marginTop: 2 },
  tabLabelOn: { color: colors.primaryDark },
});

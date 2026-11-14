import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ACHIEVEMENTS,
  COINS_PER_GLASS,
  DEFAULT_GOAL,
  GLASS_ML,
  GOAL_BONUS_COINS,
  LOG_CHEERS,
  getDecoration,
} from './data';

const STORAGE_KEY = 'traquarium:v1';

// ---------- date helpers (local time) ----------
export function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function shiftDays(key, delta) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d + delta);
  return dateKey(date);
}

// ---------- pure selectors ----------
export function dayTotal(state, key) {
  const day = state.history[key];
  if (!day) return 0;
  return day.entries.reduce((sum, e) => sum + e.ml, 0);
}

export function dayGoal(state, key) {
  return state.history[key]?.goal ?? state.goal;
}

export function dayMet(state, key) {
  const total = dayTotal(state, key);
  return total > 0 && total >= dayGoal(state, key);
}

// Consecutive days hitting the goal, ending today (or yesterday if today isn't done yet).
export function computeStreak(state, today) {
  let key = dayMet(state, today) ? today : shiftDays(today, -1);
  let streak = 0;
  while (dayMet(state, key)) {
    streak += 1;
    key = shiftDays(key, -1);
  }
  return streak;
}

export function computeBestStreak(state) {
  const keys = Object.keys(state.history).filter((k) => dayMet(state, k)).sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const k of keys) {
    run = prev && shiftDays(prev, 1) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return best;
}

export function totalMl(state) {
  return Object.keys(state.history).reduce((sum, k) => sum + dayTotal(state, k), 0);
}

// ---------- reducer ----------
export const initialState = {
  hydrated: false,
  name: 'Friend',
  goal: DEFAULT_GOAL,
  coins: 0,
  totalCoinsEarned: 0,
  history: {}, // { 'YYYY-MM-DD': { goal, entries: [{ id, ml, t, coins }] } }
  bonusDays: {}, // days that already received the goal bonus
  owned: [],
  selected: [],
  achievements: {}, // { id: unlockedAtISO }
  toasts: [], // not persisted
};

const PERSISTED_KEYS = ['name', 'goal', 'coins', 'totalCoinsEarned', 'history', 'bonusDays', 'owned', 'selected', 'achievements'];

let toastId = 0;
function pushToast(state, text, kind = 'info') {
  toastId += 1;
  // Keep the one currently on screen; drop older queued coin toasts so rapid taps don't build a backlog.
  const queue = kind === 'coins' ? state.toasts.filter((t, i) => i === 0 || t.kind !== 'coins') : state.toasts;
  return { ...state, toasts: [...queue, { id: toastId, text, kind }] };
}

function addCoins(state, amount) {
  return { ...state, coins: state.coins + amount, totalCoinsEarned: state.totalCoinsEarned + amount };
}

function ensureDay(state, key) {
  if (state.history[key]) return state;
  return { ...state, history: { ...state.history, [key]: { goal: state.goal, entries: [] } } };
}

function checkAchievements(state, today) {
  const todayGlasses = state.history[today]?.entries.length ?? 0;
  const streak = computeStreak(state, today);
  const conditions = {
    first_sip: totalMl(state) > 0,
    goal_1: Object.keys(state.history).some((k) => dayMet(state, k)),
    streak_3: streak >= 3,
    streak_7: streak >= 7,
    liters_10: totalMl(state) >= 10000,
    glasses_12: todayGlasses >= 12,
    first_deco: state.owned.length >= 1,
    collector: state.owned.length >= 5,
    rich: state.totalCoinsEarned >= 500,
  };
  let next = state;
  for (const a of ACHIEVEMENTS) {
    if (conditions[a.id] && !next.achievements[a.id]) {
      next = { ...next, achievements: { ...next.achievements, [a.id]: new Date().toISOString() } };
      next = addCoins(next, a.reward);
      next = pushToast(next, `${a.emoji} Achievement: ${a.title}! +${a.reward} coins`, 'achievement');
    }
  }
  return next;
}

export function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.data, hydrated: true, toasts: [] };

    case 'LOG': {
      const { today, ml = GLASS_ML } = action;
      let next = ensureDay(state, today);
      const coins = COINS_PER_GLASS;
      const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ml, t: Date.now(), coins };
      const day = next.history[today];
      next = { ...next, history: { ...next.history, [today]: { ...day, entries: [...day.entries, entry] } } };
      next = addCoins(next, coins);
      const cheer = LOG_CHEERS[Math.floor(Math.random() * LOG_CHEERS.length)].replace('{c}', coins);
      next = pushToast(next, cheer, 'coins');
      if (dayMet(next, today) && !next.bonusDays[today]) {
        next = addCoins(next, GOAL_BONUS_COINS);
        next = { ...next, bonusDays: { ...next.bonusDays, [today]: true } };
        next = pushToast(next, `🎉 Daily goal complete! +${GOAL_BONUS_COINS} bonus coins`, 'goal');
      }
      return checkAchievements(next, today);
    }

    case 'REMOVE': {
      const { today, entryId } = action;
      const day = state.history[today];
      if (!day || day.entries.length === 0) return state;
      const target = entryId ? day.entries.find((e) => e.id === entryId) : day.entries[day.entries.length - 1];
      if (!target) return state;
      const refund = Math.min(state.coins, target.coins ?? COINS_PER_GLASS);
      const next = {
        ...state,
        coins: state.coins - refund,
        totalCoinsEarned: Math.max(0, state.totalCoinsEarned - refund),
        history: { ...state.history, [today]: { ...day, entries: day.entries.filter((e) => e.id !== target.id) } },
      };
      return pushToast(next, `↩️ Removed ${target.ml} ml`, 'info');
    }

    case 'SET_GOAL': {
      const { today, goal } = action;
      let next = ensureDay({ ...state, goal }, today);
      next = { ...next, history: { ...next.history, [today]: { ...next.history[today], goal } } };
      if (dayMet(next, today) && !next.bonusDays[today]) {
        next = addCoins(next, GOAL_BONUS_COINS);
        next = { ...next, bonusDays: { ...next.bonusDays, [today]: true } };
        next = pushToast(next, `🎉 Daily goal complete! +${GOAL_BONUS_COINS} bonus coins`, 'goal');
      }
      next = pushToast(next, `🎯 Daily goal set to ${goal} ml`, 'info');
      return checkAchievements(next, today);
    }

    case 'SET_NAME':
      return { ...state, name: action.name };

    case 'BUY': {
      const deco = getDecoration(action.id);
      if (!deco || state.owned.includes(deco.id) || state.coins < deco.price) return state;
      let next = {
        ...state,
        coins: state.coins - deco.price,
        owned: [...state.owned, deco.id],
        selected: [...state.selected, deco.id],
      };
      next = pushToast(next, `${deco.emoji} ${deco.name} added to your aquarium!`, 'info');
      return checkAchievements(next, action.today);
    }

    case 'TOGGLE_DECO': {
      if (!state.owned.includes(action.id)) return state;
      const on = state.selected.includes(action.id);
      return { ...state, selected: on ? state.selected.filter((x) => x !== action.id) : [...state.selected, action.id] };
    }

    case 'RESET_TODAY': {
      const { today } = action;
      const history = { ...state.history };
      delete history[today];
      const bonusDays = { ...state.bonusDays };
      delete bonusDays[today];
      return pushToast({ ...state, history, bonusDays }, "🧽 Today's progress was reset", 'info');
    }

    case 'RESET_ALL':
      return pushToast({ ...initialState, hydrated: true }, '🌱 Fresh start! All data cleared.', 'info');

    case 'DEBUG_COINS':
      return pushToast(addCoins(state, action.amount), `🪙 +${action.amount} test coins`, 'coins');

    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    default:
      return state;
  }
}

// ---------- context ----------
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [today, setToday] = useState(dateKey());

  // Load saved data once
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        dispatch({ type: 'HYDRATE', data: raw ? JSON.parse(raw) : {} });
      } catch (e) {
        console.warn('Failed to load data', e);
        dispatch({ type: 'HYDRATE', data: {} });
      }
    })();
  }, []);

  // Save whenever persisted data changes
  const saveTimer = useRef(null);
  useEffect(() => {
    if (!state.hydrated) return;
    const data = {};
    PERSISTED_KEYS.forEach((k) => (data[k] = state[k]));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch((e) => console.warn('Failed to save', e));
    }, 150);
  }, [state]);

  // Keep "today" fresh: handles midnight rollover and returning from background
  useEffect(() => {
    const refresh = () => setToday((prev) => (prev === dateKey() ? prev : dateKey()));
    const interval = setInterval(refresh, 30 * 1000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, []);

  const actions = useMemo(
    () => ({
      logWater: (ml = GLASS_ML) => dispatch({ type: 'LOG', today, ml }),
      undoLast: () => dispatch({ type: 'REMOVE', today }),
      removeEntry: (entryId) => dispatch({ type: 'REMOVE', today, entryId }),
      setGoal: (goal) => dispatch({ type: 'SET_GOAL', today, goal }),
      setName: (name) => dispatch({ type: 'SET_NAME', name }),
      buy: (id) => dispatch({ type: 'BUY', id, today }),
      toggleDecoration: (id) => dispatch({ type: 'TOGGLE_DECO', id }),
      resetToday: () => dispatch({ type: 'RESET_TODAY', today }),
      resetAll: () => dispatch({ type: 'RESET_ALL' }),
      addTestCoins: (amount = 100) => dispatch({ type: 'DEBUG_COINS', amount }),
      dismissToast: (id) => dispatch({ type: 'DISMISS_TOAST', id }),
    }),
    [today]
  );

  const derived = useMemo(() => {
    const total = dayTotal(state, today);
    const goal = dayGoal(state, today);
    return {
      today,
      todayTotal: total,
      todayGoal: goal,
      todayEntries: state.history[today]?.entries ?? [],
      progress: goal > 0 ? total / goal : 0,
      goalMet: total >= goal && total > 0,
      streak: computeStreak(state, today),
      bestStreak: computeBestStreak(state),
      lifetimeMl: totalMl(state),
    };
  }, [state, today]);

  const value = useMemo(() => ({ state, ...derived, ...actions }), [state, derived, actions]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

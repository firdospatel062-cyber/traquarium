export const GLASS_ML = 250;
export const COINS_PER_GLASS = 10;
export const GOAL_BONUS_COINS = 50;
export const DEFAULT_GOAL = 2000;

// zone: 'floor' sits on the sand, 'swim' floats in the water.
// x / y are percentages of the tank width / height (y measured from the bottom).
export const DECORATIONS = [
  { id: 'seaweed', emoji: '🌿', name: 'Seaweed', price: 20, zone: 'floor', x: 6, y: 4, size: 44 },
  { id: 'shell', emoji: '🐚', name: 'Seashell', price: 30, zone: 'floor', x: 30, y: 2, size: 30 },
  { id: 'rock', emoji: '🪨', name: 'Cozy Rock', price: 35, zone: 'floor', x: 46, y: 2, size: 36 },
  { id: 'star', emoji: '⭐', name: 'Starfish', price: 40, zone: 'floor', x: 62, y: 3, size: 28 },
  { id: 'coral', emoji: '🪸', name: 'Coral Reef', price: 60, zone: 'floor', x: 78, y: 4, size: 46 },
  { id: 'crab', emoji: '🦀', name: 'Crab Buddy', price: 80, zone: 'floor', x: 18, y: 2, size: 34 },
  { id: 'castle', emoji: '🏰', name: 'Sand Castle', price: 120, zone: 'floor', x: 84, y: 14, size: 48 },
  { id: 'treasure', emoji: '💎', name: 'Treasure Gem', price: 150, zone: 'floor', x: 38, y: 13, size: 26 },
  { id: 'puffer', emoji: '🐡', name: 'Pufferfish', price: 100, zone: 'swim', x: 70, y: 55, size: 34 },
  { id: 'octopus', emoji: '🐙', name: 'Octopus', price: 140, zone: 'swim', x: 12, y: 40, size: 38 },
  { id: 'turtle', emoji: '🐢', name: 'Sea Turtle', price: 180, zone: 'swim', x: 55, y: 30, size: 38 },
  { id: 'dolphin', emoji: '🐬', name: 'Dolphin', price: 250, zone: 'swim', x: 20, y: 68, size: 40 },
];

export const getDecoration = (id) => DECORATIONS.find((d) => d.id === id);

export const ACHIEVEMENTS = [
  { id: 'first_sip', emoji: '💧', title: 'First Sip', desc: 'Log your first glass of water', reward: 10 },
  { id: 'goal_1', emoji: '🎯', title: 'Goal Crusher', desc: 'Complete your daily goal', reward: 25 },
  { id: 'streak_3', emoji: '🔥', title: 'On a Roll', desc: 'Reach a 3-day streak', reward: 50 },
  { id: 'streak_7', emoji: '🏆', title: 'Hydro Hero', desc: 'Reach a 7-day streak', reward: 100 },
  { id: 'liters_10', emoji: '🌊', title: 'Ocean Drinker', desc: 'Drink 10 liters in total', reward: 75 },
  { id: 'glasses_12', emoji: '🥤', title: 'Overachiever', desc: 'Log 12 glasses in one day', reward: 40 },
  { id: 'first_deco', emoji: '🛍️', title: 'Interior Designer', desc: 'Buy your first decoration', reward: 15 },
  { id: 'collector', emoji: '🐚', title: 'Collector', desc: 'Own 5 decorations', reward: 60 },
  { id: 'rich', emoji: '💰', title: 'Treasure Hunter', desc: 'Earn 500 coins in total', reward: 50 },
];

export function getMood(progress) {
  if (progress <= 0) return { face: '😴', label: 'Thirsty', message: "Bubbles is thirsty! Let's start with a glass of water." };
  if (progress < 0.25) return { face: '🙂', label: 'Waking up', message: 'Great start! Every sip counts. 💧' };
  if (progress < 0.5) return { face: '😊', label: 'Content', message: "Nice! You're making waves today. 🌊" };
  if (progress < 0.75) return { face: '😄', label: 'Happy', message: "Over halfway there — Bubbles is loving it!" };
  if (progress < 1) return { face: '😁', label: 'Very happy', message: 'Almost there! Just a few more glasses. ✨' };
  return { face: '🤩', label: 'Ecstatic', message: 'Goal complete! Your aquarium is thriving! 🎉' };
}

export const LOG_CHEERS = [
  'Splash! +{c} coins 🪙',
  'Glug glug! +{c} coins 💧',
  'Bubbles says thanks! +{c} 🐠',
  'Hydration nation! +{c} 🌊',
  'Fin-tastic! +{c} coins ✨',
];

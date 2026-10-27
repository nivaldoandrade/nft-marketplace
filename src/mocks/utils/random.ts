export function createRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)];
}

export function randomInt(random: () => number, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

export function randomHex(random: () => number, length: number) {
  return Array.from({ length }, () => Math.floor(random() * 16).toString(16)).join('');
}

export function hashSeed(value: string) {
  let hash = 2166136261;

  for (const char of value) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }

  return hash >>> 0;
}

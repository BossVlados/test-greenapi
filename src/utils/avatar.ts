const AVATAR_COLORS = [
  '#5b8def',
  '#e07b53',
  '#4caf50',
  '#9c27b0',
  '#f44336',
  '#00acc1',
  '#ff9800',
  '#795548',
] as const;

export function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : '?';
}
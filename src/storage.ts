export function getLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem('kaoyan_' + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    return fallback;
  }
}

export function setLocal(key: string, val: unknown): void {
  localStorage.setItem('kaoyan_' + key, JSON.stringify(val));
}

export function removeLocal(key: string): void {
  localStorage.removeItem('kaoyan_' + key);
}

export function todayKey(): string {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
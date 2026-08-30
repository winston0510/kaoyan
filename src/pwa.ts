export function registerSW(): void {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err: unknown) => console.warn('Service worker 注册失败:', err));
  });
}
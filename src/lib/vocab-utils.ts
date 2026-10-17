/**
 * Utilidades compartidas de la app Vocabulario Chino–Español.
 * Optimizadas para funcionar 100% offline en dispositivos Android.
 */

export function shuffle<T>(a: T[]): T[] {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Normaliza texto: minúsculas y sin tildes/diacríticos (bàogào → bagao). */
export function norm(t: string): string {
  return t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

/** Pronunciación con síntesis de voz (zh-CN) — funciona en Android WebView/Chrome. */
export function speak(text: string): void {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    u.rate = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* silencio: la app debe seguir funcionando sin TTS */
  }
}

/** Vibración háptica corta — feedback nativo en Android. */
export function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    /* no soportado */
  }
}

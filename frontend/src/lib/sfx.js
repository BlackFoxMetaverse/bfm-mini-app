export function playCash(volume = 0.6) {
  try {
    const audio = new Audio("/cash.mp3");
    audio.volume = volume;
    // Avoid overlapping too loudly
    audio.play().catch(() => {});
  } catch {
    // noop
  }
}

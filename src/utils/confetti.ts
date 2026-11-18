import confetti from 'canvas-confetti';

export const triggerShotConfetti = (teamColor: string = '#06b6d4') => {
  try {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: [teamColor, '#ffffff', '#fbbf24'],
    });
  } catch {
    // Graceful fallback if window or canvas is unavailable
  }
};

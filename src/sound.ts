let ctx: AudioContext | null = null;

function ac() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function beep(freq: number, start: number, dur: number, gain = 0.12, type: OscillatorType = "sine") {
  const c = ac();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(c.currentTime + start);
  o.stop(c.currentTime + start + dur + 0.02);
}

export function playPayPay() {
  try {
    void ac().resume();
    beep(880, 0, 0.14, 0.1, "triangle");
    beep(1174, 0.12, 0.22, 0.12, "triangle");
    beep(1568, 0.28, 0.18, 0.08, "sine");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance("ペイペイ");
      u.lang = "ja-JP";
      u.rate = 1.25;
      u.pitch = 1.15;
      u.volume = 0.85;
      setTimeout(() => window.speechSynthesis.speak(u), 80);
    }
  } catch {
    /* ignore */
  }
}

export function playTap() {
  try {
    void ac().resume();
    beep(640, 0, 0.05, 0.04, "sine");
  } catch {
    /* ignore */
  }
}

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { hash, payCode, yen } from "./format";
import {
  IBack,
  ICheck,
  IHome,
  IGift,
  IGrid,
  IQr,
  IUser,
} from "./icons";
import { useT } from "./i18n";
import { playPayPay } from "./sound";
import type { Tab, Transaction } from "./types";

export function StatusBar({ light = false }: { light?: boolean }) {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setT(`${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);
  const c = light ? "#fff" : "#222";
  return (
    <div className={`status ${light ? "light" : ""}`}>
      <span>{t || "9:41"}</span>
      <div className="status-icons">
        <svg width="17" height="12" viewBox="0 0 17 12">
          <rect x="0" y="7" width="3" height="5" rx="0.6" fill={c} />
          <rect x="4.5" y="5" width="3" height="7" rx="0.6" fill={c} />
          <rect x="9" y="3" width="3" height="9" rx="0.6" fill={c} />
          <rect x="13.5" y="1" width="3" height="11" rx="0.6" fill={c} opacity="0.35" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12">
          <path d="M1 8.2a8 8 0 0 1 14 0" stroke={c} strokeWidth="1.5" fill="none" />
          <path d="M4 9.4a4.6 4.6 0 0 1 8 0" stroke={c} strokeWidth="1.5" fill="none" />
          <circle cx="8" cy="11" r="1.1" fill={c} />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12">
          <rect x="0.5" y="1" width="21" height="10" rx="2" stroke={c} strokeWidth="1.2" fill="none" />
          <rect x="2" y="2.6" width="15" height="6.8" rx="1" fill={c} />
          <rect x="22.2" y="4" width="1.8" height="4" rx="0.6" fill={c} />
        </svg>
      </div>
    </div>
  );
}

export function Barcode({ value }: { value: string }) {
  const bars = useMemo(() => {
    const bits: number[] = [1, 0, 1];
    for (const ch of value) {
      const n = ch.charCodeAt(0);
      for (let i = 0; i < 4; i++) bits.push((n >> i) & 1, 1 - ((n >> (i + 2)) & 1));
    }
    bits.push(1, 0, 1, 1, 0, 1);
    return bits;
  }, [value]);
  const w = bars.length * 2;
  return (
    <svg className="barcode" viewBox={`0 0 ${w} 80`} preserveAspectRatio="none">
      {bars.map((b, i) =>
        b ? <rect key={i} x={i * 2} y="0" width="1.7" height="80" fill="#222" /> : null,
      )}
    </svg>
  );
}

export function QR({ value }: { value: string }) {
  const n = 25;
  const cells = useMemo(() => {
    const seed = hash(value);
    const g: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
    const finder = (x: number, y: number) => {
      for (let i = 0; i < 7; i++)
        for (let j = 0; j < 7; j++) {
          const edge = i === 0 || j === 0 || i === 6 || j === 6;
          const inner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
          g[y + i][x + j] = edge || inner;
        }
    };
    finder(0, 0);
    finder(n - 7, 0);
    finder(0, n - 7);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (g[y][x]) continue;
        const inFinder =
          (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
        if (inFinder) continue;
        const h = hash(`${value}:${x},${y}:${seed}`);
        g[y][x] = h % 3 !== 0;
      }
    }
    return g;
  }, [value]);
  return (
    <svg viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges">
      <rect width={n} height={n} fill="#fff" />
      {cells.map((row, y) =>
        row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#222" /> : null)),
      )}
    </svg>
  );
}

export function useLivePayCode() {
  const [seed, setSeed] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setSeed(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  const code = payCode(seed);
  return { code, seed };
}

export function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button className={`switch ${on ? "on" : ""}`} onClick={onToggle} type="button" aria-pressed={on}>
      <i />
    </button>
  );
}

export function Keypad({
  onDigit,
  onBack,
  onExtra,
  extraLabel = "00",
}: {
  onDigit: (d: string) => void;
  onBack: () => void;
  onExtra?: () => void;
  extraLabel?: string;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", extraLabel, "0", "⌫"];
  return (
    <div className="keypad">
      {keys.map((k) => (
        <button
          key={k}
          className={`key ${k === extraLabel || k === "⌫" ? "muted" : ""}`}
          type="button"
          onClick={() => {
            if (k === "⌫") onBack();
            else if (k === extraLabel) onExtra?.();
            else onDigit(k);
          }}
        >
          {k}
        </button>
      ))}
    </div>
  );
}

export function NavHead({
  title,
  onBack,
  right,
  ghost,
}: {
  title: string;
  onBack: () => void;
  right?: ReactNode;
  ghost?: boolean;
}) {
  return (
    <div className={`nav-head ${ghost ? "ghost" : ""}`}>
      <button className={`icon-btn ${ghost ? "light" : ""}`} onClick={onBack} type="button" aria-label="Back">
        <IBack />
      </button>
      <h2>{title}</h2>
      {right ?? <span style={{ width: 40 }} />}
    </div>
  );
}

export function BottomNav({ tab, onTab, onPay }: { tab: Tab; onTab: (t: Tab) => void; onPay: () => void }) {
  const t = useT();
  return (
    <nav className="nav">
      <button className={`nav-item ${tab === "home" ? "on" : ""}`} onClick={() => onTab("home")} type="button">
        <IHome size={22} />
        {t("home")}
      </button>
      <button className={`nav-item ${tab === "deals" ? "on" : ""}`} onClick={() => onTab("deals")} type="button">
        <IGift size={22} />
        {t("deals")}
      </button>
      <button className="pay-fab" onClick={onPay} type="button" aria-label={t("pay")}>
        <IQr size={22} color="#fff" />
        <span>{t("pay")}</span>
      </button>
      <button className={`nav-item ${tab === "miniapps" ? "on" : ""}`} onClick={() => onTab("miniapps")} type="button">
        <IGrid size={22} />
        {t("miniapps")}
      </button>
      <button className={`nav-item ${tab === "account" ? "on" : ""}`} onClick={() => onTab("account")} type="button">
        <IUser size={22} />
        {t("account")}
      </button>
    </nav>
  );
}

export function Success({ tx, onClose }: { tx: Transaction; onClose: () => void }) {
  const t = useT();
  useEffect(() => {
    playPayPay();
  }, []);
  const coins = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className="success">
      {tx.pointsEarned > 0 && (
        <div className="coins">
          {coins.map((i) => (
            <span
              key={i}
              className="coin"
              style={{
                left: `${8 + ((i * 17) % 84)}%`,
                animationDelay: `${i * 0.06}s`,
              }}
            />
          ))}
        </div>
      )}
      <div className="check">
        <ICheck size={44} color="#fff" />
      </div>
      <div className="sum">{yen(Math.abs(tx.amount))}</div>
      <div className="who">{tx.title}</div>
      <div className="when">{tx.subtitle ?? t("paid")}</div>
      {tx.pointsEarned > 0 && <div className="pt-badge">{t("pointsGot", { n: tx.pointsEarned })}</div>}
      {tx.pointsUsed > 0 && (
        <div className="when" style={{ marginTop: 8 }}>
          {t("pointsUsedN", { n: tx.pointsUsed })}
        </div>
      )}
      <div style={{ width: "100%", marginTop: 36 }}>
        <button className="btn white" type="button" onClick={onClose}>
          {t("close")}
        </button>
      </div>
    </div>
  );
}

export function Toast({ text }: { text: string }) {
  return <div className="toast">{text}</div>;
}

export function Sheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="handle" />
        {children}
      </div>
    </div>
  );
}

export function useAmount() {
  const [raw, setRaw] = useState("");
  const amount = Number(raw || "0");
  const push = (d: string) => {
    if (raw.length >= 8) return;
    if (raw === "0") setRaw(d);
    else setRaw(raw + d);
  };
  const extra = () => {
    if (!raw) setRaw("0");
    else if (raw.length <= 6) setRaw(raw + "00");
  };
  const back = () => setRaw(raw.slice(0, -1));
  return { raw, amount, push, extra, back, setRaw };
}

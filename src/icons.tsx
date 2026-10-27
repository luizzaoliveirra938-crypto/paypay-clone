import type { CSSProperties, ReactNode } from "react";

type P = { size?: number; color?: string; className?: string };

function Svg({ size = 24, color = "currentColor", className, children }: P & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ color, flex: "none" }}
    >
      {children}
    </svg>
  );
}

export function IHome(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1v-9.5Z" fill="currentColor" />
    </Svg>
  );
}
export function IGift(p: P) {
  return (
    <Svg {...p}>
      <path d="M3 10h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V10Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 6v16M8.5 4.5c0-1.4 1-2.5 2.2-2.5 1.8 0 3.3 4 1.3 4H8.5ZM15.5 4.5c0-1.4-1-2.5-2.2-2.5-1.8 0-3.3 4-1.3 4h3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}
export function IGrid(p: P) {
  return (
    <Svg {...p}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" fill="currentColor" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" fill="currentColor" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" fill="currentColor" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" fill="currentColor" />
    </Svg>
  );
}
export function IUser(p: P) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="8" r="3.4" fill="currentColor" />
      <path d="M5 19.2c.8-3.4 3.4-5.2 7-5.2s6.2 1.8 7 5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
export function IQr(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 4h6v6H4V4Zm2 2v2h2V6H6Zm8-2h6v6h-6V4Zm2 2v2h2V6h-2ZM4 14h6v6H4v-6Zm2 2v2h2v-2H6Zm10 0h2v2h-2v-2Zm-2-2h2v2h-2v-2Zm4 0h2v2h-2v-2Zm-2 4h2v2h-2v-2Zm4 0h2v4h-4v-2h2v-2Z" fill="currentColor" />
    </Svg>
  );
}
export function IScan(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
export function ISend(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 12h12M12.5 7.5 17 12l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19.2" cy="12" r="1.6" fill="currentColor" />
    </Svg>
  );
}
export function IBill(p: P) {
  return (
    <Svg {...p}>
      <path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v15.2l-2.1-1.2-2.1 1.2-2.3-1.2-2.3 1.2-2.1-1.2-2.1 1.2V5A1.5 1.5 0 0 1 7 3.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}
export function IPlus(p: P) {
  return (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}
export function IClock(p: P) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5V12l3.2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
export function IBell(p: P) {
  return (
    <Svg {...p}>
      <path d="M6 9.5a6 6 0 1 1 12 0c0 4 1.4 5.6 1.4 5.6H4.6S6 13.5 6 9.5Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M10 18.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}
export function IEye(p: P) {
  return (
    <Svg {...p}>
      <path d="M2.8 12s3.2-6 9.2-6 9.2 6 9.2 6-3.2 6-9.2 6-9.2-6-9.2-6Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    </Svg>
  );
}
export function IEyeOff(p: P) {
  return (
    <Svg {...p}>
      <path d="M3 3l18 18M6.2 6.4C4 8 2.8 12 2.8 12s3.2 6 9.2 6c1.7 0 3.2-.4 4.5-1.1M17.4 15.2C19.6 13.6 21.2 12 21.2 12s-3.2-6-9.2-6c-.7 0-1.4.1-2 .2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}
export function IChevron(p: P) {
  return (
    <Svg {...p}>
      <path d="M9 5.5 15.5 12 9 18.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
export function ILock(p: P) {
  return (
    <Svg {...p}>
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
export function IHeadset(p: P) {
  return (
    <Svg {...p}>
      <path d="M5 13.5V12a7 7 0 0 1 14 0v1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3.5" y="13" width="4.2" height="6.2" rx="1.4" fill="currentColor" />
      <rect x="16.3" y="13" width="4.2" height="6.2" rx="1.4" fill="currentColor" />
      <path d="M19 19.2c0 1.6-1.6 2.8-4 2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}
export function ISendMsg(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 4.8 20.4 12 4 19.2l2.4-7.2L4 4.8Z" fill="currentColor" />
    </Svg>
  );
}
export function IBack(p: P) {
  return (
    <Svg {...p}>
      <path d="M15 5.5 8.5 12 15 18.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
export function ICard(p: P) {
  return (
    <Svg {...p}>
      <rect x="3" y="6" width="18" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="1.7" />
    </Svg>
  );
}
export function ICoin(p: P) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5v9M9.4 9.4c.5-.7 1.4-1.1 2.6-1.1 1.8 0 3 1 3 2.4 0 3.3-6 1.5-6 4.4 0 1.4 1.3 2.5 3.2 2.5 1.3 0 2.3-.5 2.8-1.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}
export function IChart(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 19h16M7 16V11M12 16V8M17 16V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
export function IBank(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 10h16M5.5 10v7.5M12 10v7.5M18.5 10v7.5M4 18.5h16M12 4 4 9.2h16L12 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}
export function IPin(p: P) {
  return (
    <Svg {...p}>
      <path d="M12 21s7-6.2 7-11.2A7 7 0 1 0 5 9.8C5 14.8 12 21 12 21Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="9.8" r="2.1" fill="currentColor" />
    </Svg>
  );
}
export function IMedal(p: P) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="13.2" r="6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 8 7 3.5h4L12 7l1-3.5h4L15 8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}
export function IBag(p: P) {
  return (
    <Svg {...p}>
      <path d="M6 8.5h12l-.8 11H6.8L6 8.5Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" stroke="currentColor" strokeWidth="1.7" />
    </Svg>
  );
}
export function IShop(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 10.5 6 5h12l2 5.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 20v-6h6v6" stroke="currentColor" strokeWidth="1.7" />
    </Svg>
  );
}
export function IPlane(p: P) {
  return (
    <Svg {...p}>
      <path d="M3 12.5 21 5l-4.5 14-4-4.5-4.2 4.2L7 17l4-5.2L3 12.5Z" fill="currentColor" />
    </Svg>
  );
}
export function IBolt(p: P) {
  return (
    <Svg {...p}>
      <path d="M13 3 5.5 13.5h6L11 21 18.5 10h-6L13 3Z" fill="currentColor" />
    </Svg>
  );
}
export function IShield(p: P) {
  return (
    <Svg {...p}>
      <path d="M12 3.5 19 6.5v5.4c0 4.4-2.9 7.6-7 8.6-4.1-1-7-4.2-7-8.6V6.5L12 3.5Z" stroke="currentColor" strokeWidth="1.7" />
    </Svg>
  );
}
export function IGavel(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 20h10M14 6.5l4 4M8.5 12 18 2.5 21.5 6 12 15.5 8.5 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </Svg>
  );
}
export function IAtm(p: P) {
  return (
    <Svg {...p}>
      <rect x="4" y="3.5" width="16" height="17" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="7" y="6.5" width="10" height="6" rx="1" fill="currentColor" opacity="0.3" />
      <path d="M8 15.5h8M8 18h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}
export function IClose(p: P) {
  return (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
export function ICheck(p: P) {
  return (
    <Svg {...p}>
      <path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
export function ISearch(p: P) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="6.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16.2 20.5 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
export function IDots(p: P) {
  return (
    <Svg {...p}>
      <circle cx="6" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="18" cy="12" r="1.6" fill="currentColor" />
    </Svg>
  );
}
export function ICamera(p: P) {
  return (
    <Svg {...p}>
      <path d="M8 7 9.2 5h5.6L16 7h3.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-9A1.5 1.5 0 0 1 4.5 7H8Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </Svg>
  );
}
export function ICopy(p: P) {
  return (
    <Svg {...p}>
      <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6.5 16V5.5A1.5 1.5 0 0 1 8 4h9" stroke="currentColor" strokeWidth="1.7" />
    </Svg>
  );
}

const glyphMap: Record<string, (p: P) => ReactNode> = {
  card: ICard,
  coin: ICoin,
  chart: IChart,
  bank: IBank,
  send: ISend,
  bill: IBill,
  atm: IAtm,
  plus: IPlus,
  pin: IPin,
  medal: IMedal,
  bag: IBag,
  shop: IShop,
  plane: IPlane,
  bolt: IBolt,
  shield: IShield,
  gavel: IGavel,
};

export function Glyph({ name, size = 22, color = "#fff" }: { name: string; size?: number; color?: string }) {
  const C = glyphMap[name] ?? IGrid;
  return <>{C({ size, color })}</>;
}

export function PayPayMark({ size = 28, stacked = false, color = "#fff" }: { size?: number; stacked?: boolean; color?: string }) {
  const style: CSSProperties = {
    fontWeight: 900,
    letterSpacing: "-0.04em",
    color,
    lineHeight: 0.9,
    fontSize: size * 0.42,
    fontFamily: "Arial Black, Arial, sans-serif",
    userSelect: "none",
  };
  if (stacked) {
    return (
      <div style={{ ...style, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span>Pay</span>
        <span>Pay</span>
      </div>
    );
  }
  return (
    <span style={{ ...style, fontSize: size * 0.62, letterSpacing: "-0.05em" }}>PayPay</span>
  );
}

export function Avatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  const ch = name.replace(/[ 　]/g, "").slice(-1);
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.38,
      }}
    >
      {ch}
    </div>
  );
}

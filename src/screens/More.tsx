import { useEffect } from "react";
import { merchants, miniApps } from "../data";
import { compactDate, yen } from "../format";
import {
  accountStatusLabel,
  catLabel,
  couponLabel,
  groupLabel,
  miniLabel,
  noticeCopy,
  rankLabel,
  useT,
} from "../i18n";
import { Avatar, Glyph, IChevron } from "../icons";
import { useStore } from "../store";
import type { Overlay } from "../types";
import { NavHead, Switch } from "../ui";

export function MiniApps({ push }: { push: (o: Overlay) => void }) {
  const s = useStore();
  const t = useT();
  const groups = [...new Set(miniApps.map((a) => a.group))];
  const open = (id: string) => openFeature(id, push, s.lang, t);
  return (
    <div className="scroll">
      <div className="topbar"><h1>{t("miniapps")}</h1></div>
      {groups.map((g) => (
        <div key={g}>
          <div className="group-label">{groupLabel(s.lang, g)}</div>
          <div className="section" style={{ marginTop: 0 }}>
            <div className="icon-grid">
              {miniApps.filter((a) => a.group === g).map((a) => (
                <button key={a.id} className="grid-item" type="button" onClick={() => open(a.id)}>
                  <span className="grid-ico" style={{ background: a.color }}>
                    <Glyph name={a.glyph} />
                  </span>
                  {miniLabel(s.lang, a.id, a.name)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function openFeature(
  id: string,
  push: (o: Overlay) => void,
  lang: "ja" | "en",
  t: (k: "miniapps") => string,
) {
  const map: Record<string, Overlay> = {
    card: { type: "card" },
    points: { type: "points" },
    invest: { type: "invest" },
    bank: { type: "bank" },
    send: { type: "send" },
    bills: { type: "bills" },
    charge: { type: "charge" },
    nearby: { type: "nearby" },
    step: { type: "step" },
    atm: { type: "bank" },
  };
  const app = miniApps.find((a) => a.id === id);
  push(map[id] ?? { type: "soon", title: app ? miniLabel(lang, app.id, app.name) : t("miniapps") });
}

export function AllFeatures({ push, pop }: { push: (o: Overlay) => void; pop: () => void }) {
  const s = useStore();
  const t = useT();
  const groups = [...new Set(miniApps.map((a) => a.group))];
  return (
    <div className="screen">
      <NavHead title={t("allFeatures")} onBack={pop} />
      <div className="scroll no-nav">
        {groups.map((g) => (
          <div key={g}>
            <div className="group-label">{groupLabel(s.lang, g)}</div>
            {miniApps.filter((a) => a.group === g).map((a) => (
              <div key={a.id} className="list-row">
                <button
                  type="button"
                  onClick={() => openFeature(a.id, push, s.lang, t)}
                  style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, textAlign: "left", minWidth: 0 }}
                >
                  <span className="grid-ico" style={{ background: a.color, width: 36, height: 36, borderRadius: 10 }}>
                    <Glyph name={a.glyph} size={18} />
                  </span>
                  <div className="grow"><h4>{miniLabel(s.lang, a.id, a.name)}</h4></div>
                </button>
                <button
                  type="button"
                  onClick={() => s.toggleFavorite(a.id)}
                  style={{ fontSize: 18, color: s.favorites.includes(a.id) ? "#FF0033" : "#ccc", padding: 8 }}
                  aria-label={t("favorites")}
                >
                  ★
                </button>
              </div>
            ))}
          </div>
        ))}
        <p className="credit-note">{t("favHint")}</p>
      </div>
    </div>
  );
}

export function NearbyScreen({ push, pop }: { push: (o: Overlay) => void; pop: () => void }) {
  const s = useStore();
  const t = useT();
  return (
    <div className="screen">
      <NavHead title={t("nearby")} onBack={pop} />
      <div className="scroll no-nav">
        <div className="map">
          {merchants.slice(0, 6).map((m, i) => (
            <div
              key={m.id}
              className="map-pin"
              style={{ left: `${12 + (i % 3) * 28}%`, top: `${18 + Math.floor(i / 3) * 42}%` }}
            >
              <span>{m.emoji}</span>
            </div>
          ))}
        </div>
        {merchants.map((m) => (
          <button key={m.id} className="list-row" type="button" onClick={() => push({ type: "scanPay", merchantId: m.id })}>
            <div className="avatar" style={{ width: 40, height: 40, background: m.color }}>{m.emoji}</div>
            <div className="grow">
              <h4>{m.name}</h4>
              <p>
                {catLabel(s.lang, m.category)} ・ {m.distance === "オンライン" ? t("online") : m.distance}
                {m.coupon ? ` ・ ${couponLabel(s.lang, m.coupon)}` : ""}
              </p>
            </div>
            <IChevron size={18} color="#ccc" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function Account({ push }: { push: (o: Overlay) => void }) {
  const s = useStore();
  const t = useT();
  return (
    <div className="scroll">
      <div className="topbar">
        <h1>{t("account")}</h1>
        <button className="icon-btn" type="button" onClick={() => push({ type: "settings" })} aria-label={t("settings")}>
          <span style={{ fontSize: 18 }}>⚙️</span>
        </button>
      </div>
      <div className="profile-hero">
        <Avatar name={s.user.name} color="#FF0033" size={56} />
        <div>
          <h3>{s.user.name}</h3>
          <p>@{s.user.handle} ・ {s.user.phone}</p>
          {s.user.verified && <div className="verified">{t("verified")}</div>}
          {s.status !== "active" && (
            <div className={`t-status ${s.status}`} style={{ marginTop: 8 }}>
              {accountStatusLabel(s.lang, s.status)}
            </div>
          )}
        </div>
      </div>
      <div className="section" style={{ marginTop: 8 }}>
        <Row label={t("txHistory")} onClick={() => push({ type: "history" })} />
        <Row label={t("paypayCard")} onClick={() => push({ type: "card" })} />
        <Row label={t("paypayBank")} onClick={() => push({ type: "bank" })} />
        <Row label={t("points")} onClick={() => push({ type: "points" })} />
        <Row label={t("step")} extra={rankLabel(s.lang, s.user.step)} onClick={() => push({ type: "step" })} />
      </div>
      <div className="section">
        <Row
          label={t("support")}
          extra={s.unreadSupport > 0 ? String(s.unreadSupport) : ""}
          onClick={() => push({ type: "support" })}
        />
        <Row label={t("notices")} extra={s.notices.some((n) => n.unread) ? t("unread") : ""} onClick={() => push({ type: "notifications" })} />
        <Row label={t("hideAmounts")} extra={s.wallet.hideAmounts ? "ON" : "OFF"} onClick={() => s.patchWallet({ hideAmounts: !s.wallet.hideAmounts })} />
        <Row label={t("autoCharge")} extra={s.wallet.autoCharge ? "ON" : "OFF"} onClick={() => s.patchWallet({ autoCharge: !s.wallet.autoCharge })} />
        <Row label={t("language")} extra={s.lang === "en" ? t("langEn") : t("langJa")} onClick={() => push({ type: "settings" })} />
      </div>
    </div>
  );
}

function Row({ label, extra, onClick }: { label: string; extra?: string; onClick: () => void }) {
  return (
    <button className="list-row" type="button" onClick={onClick}>
      <div className="grow"><h4>{label}</h4></div>
      {extra && <span style={{ fontSize: 12, color: "#767676", marginRight: 4 }}>{extra}</span>}
      <IChevron size={18} color="#ccc" />
    </button>
  );
}

export function SettingsScreen({ pop, toast }: { pop: () => void; toast: (t: string) => void }) {
  const s = useStore();
  const t = useT();
  return (
    <div className="screen">
      <NavHead title={t("settings")} onBack={pop} />
      <div className="scroll no-nav">
        <p className="group-label">{t("language")}</p>
        <div className="seg" style={{ margin: "0 16px 16px" }}>
          <button className={s.lang === "ja" ? "on" : ""} type="button" onClick={() => s.setLang("ja")}>
            {t("langJa")}
          </button>
          <button className={s.lang === "en" ? "on" : ""} type="button" onClick={() => s.setLang("en")}>
            {t("langEn")}
          </button>
        </div>
        <div className="toggle-row">
          <span>{t("autoCharge")}</span>
          <Switch on={s.wallet.autoCharge} onToggle={() => s.patchWallet({ autoCharge: !s.wallet.autoCharge })} />
        </div>
        <p className="credit-note">{t("autoChargeNote", { amount: yen(s.wallet.autoChargeAmount) })}</p>
        <div className="toggle-row">
          <span>{t("usePointsPay")}</span>
          <Switch on={s.wallet.usePoints} onToggle={() => s.patchWallet({ usePoints: !s.wallet.usePoints })} />
        </div>
        <div className="toggle-row">
          <span>{t("hideAmounts")}</span>
          <Switch on={s.wallet.hideAmounts} onToggle={() => s.patchWallet({ hideAmounts: !s.wallet.hideAmounts })} />
        </div>
        <div className="pad">
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              s.reset();
              toast(t("resetDone"));
              pop();
            }}
          >
            {t("resetDemo")}
          </button>
        </div>
        <div className="pad" style={{ paddingTop: 0 }}>
          <button className="btn outline" type="button" onClick={() => s.logout()}>
            {t("logout")}
          </button>
        </div>
        <p className="credit-note">{t("demoDisclaimer")}</p>
      </div>
    </div>
  );
}

export function NoticesScreen({ pop }: { pop: () => void }) {
  const s = useStore();
  const t = useT();
  useEffect(() => {
    s.markNoticesRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="screen">
      <NavHead title={t("noticesTitle")} onBack={pop} />
      <div className="scroll no-nav">
        {s.notices.map((n) => {
          const copy = noticeCopy(s.lang, n.id, n.title, n.body);
          return (
            <div key={n.id} className="list-row" style={{ alignItems: "flex-start" }}>
              <div className="grow">
                <h4>{copy.title}</h4>
                <p>{copy.body}</p>
                <p>{compactDate(n.at, s.lang)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StepScreen({ pop }: { pop: () => void }) {
  const s = useStore();
  const t = useT();
  const ranks = ["グリーン", "シルバー", "ゴールド", "プラチナ"] as const;
  return (
    <div className="screen">
      <NavHead title={t("step")} onBack={pop} />
      <div className="scroll no-nav">
        <div className="section" style={{ marginTop: 16, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#767676" }}>{t("currentRank")}</div>
          <div style={{ fontSize: 28, fontWeight: 700, margin: "8px 0" }}>{rankLabel(s.lang, s.user.step)}</div>
          <div className="progress"><i style={{ width: `${s.user.stepProgress * 100}%` }} /></div>
          <p style={{ fontSize: 12, color: "#767676", marginTop: 8 }}>{t("nextGold")}</p>
        </div>
        {ranks.map((r) => (
          <div key={r} className="list-row">
            <div className="grow">
              <h4>{rankLabel(s.lang, r)}</h4>
              <p>
                {r === "グリーン" ? "0.5%" : r === "シルバー" ? "1.5%" : r === "ゴールド" ? "2.0%" : t("maxCashback")}
                {r === "プラチナ" ? "" : ` ${t("cashback")}`}
              </p>
            </div>
            {s.user.step === r && <span style={{ color: "#FF0033", fontWeight: 700, fontSize: 12 }}>NOW</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

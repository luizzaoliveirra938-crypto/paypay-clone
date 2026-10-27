import { useRef, useState } from "react";
import { campaigns, merchants, miniApps } from "../data";
import { pts, yen } from "../format";
import {
  Glyph,
  IBell,
  IBill,
  IClock,
  IEye,
  IEyeOff,
  IPlus,
  IScan,
  ISend,
  PayPayMark,
} from "../icons";
import { campaignCopy, catLabel, couponLabel, miniLabel, useT } from "../i18n";
import { RestrictedBanner } from "./Frozen";
import { useStore } from "../store";
import type { Overlay } from "../types";

const moneyTypes = new Set(["pay", "charge", "scan", "scanPay", "send", "sendAmount", "receive", "bills"]);

export function Home({ push }: { push: (o: Overlay) => void }) {
  const s = useStore();
  const t = useT();
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const unread = s.notices.some((n) => n.unread);
  const hide = s.wallet.hideAmounts;
  const money = s.wallet.money + s.wallet.moneyLite;
  const creditLeft = s.wallet.creditLimit - s.wallet.creditUsed;
  const mask = (v: string) => (hide ? "••••" : v);

  const favs = miniApps.filter((a) => s.favorites.includes(a.id));
  const recs = miniApps.filter((a) => !s.favorites.includes(a.id)).slice(0, 8);
  const [seg, setSeg] = useState<"fav" | "rec">("fav");
  const shown = seg === "fav" ? favs : recs;

  const go = (o: Overlay) => {
    if (moneyTypes.has(o.type) && s.status !== "active") {
      push({ type: "support" });
      return;
    }
    push(o);
  };

  const openApp = (id: string) => {
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
    go(map[id] ?? { type: "soon", title: app ? miniLabel(s.lang, app.id, app.name) : t("miniapps") });
  };

  return (
    <div className="scroll">
      <div className="home-header">
        <div className="logo-lockup">
          <div className="logo-badge">
            <PayPayMark size={26} stacked color="#fff" />
          </div>
        </div>
        <div className="header-actions">
          <button className="icon-btn" type="button" onClick={() => push({ type: "history" })} aria-label={t("history")}>
            <IClock />
          </button>
          <button className="icon-btn" type="button" onClick={() => push({ type: "notifications" })} aria-label={t("notices")}>
            <IBell />
            {unread && <span className="badge-dot" />}
          </button>
        </div>
      </div>

      {s.status === "restricted" && <RestrictedBanner onContact={() => push({ type: "support" })} />}

      <div className="hero-wrap">
        <div
          className="hero-track"
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            setPage(el.scrollLeft > el.clientWidth * 0.5 ? 1 : 0);
          }}
        >
          <div className="hero balance">
            <div className="hero-row">
              <div className="hero-meta">
                <span>
                  {t("points")} <b>{mask(`${pts(s.wallet.points)} P`)}</b>
                </span>
                <span>
                  {t("cardAvailable")} <b>{mask(yen(creditLeft))}</b>
                </span>
              </div>
              <button
                className="icon-btn light"
                type="button"
                onClick={() => s.patchWallet({ hideAmounts: !hide })}
                aria-label={t("hideBalance")}
              >
                {hide ? <IEyeOff color="#fff" /> : <IEye color="#fff" />}
              </button>
            </div>
            <div className="hero-label">{t("balance")}</div>
            <div className="hero-amount">{mask(yen(money))}</div>
            <div className="hero-actions">
              <button className="hero-btn" type="button" onClick={() => go({ type: "charge" })}>
                {t("charge")}
              </button>
              <button className="hero-btn solid" type="button" onClick={() => go({ type: "pay" })}>
                {t("pay")}
              </button>
            </div>
          </div>
          <div className="hero credit">
            <div className="hero-row">
              <div className="hero-meta">
                <span>
                  {t("inUse")} <b>{mask(yen(s.wallet.creditUsed))}</b>
                </span>
                <span>
                  {t("limit")} <b>{mask(yen(s.wallet.creditLimit))}</b>
                </span>
              </div>
            </div>
            <div className="hero-label">{t("credit")}</div>
            <div className="hero-amount">{mask(yen(creditLeft))}</div>
            <div className="hero-actions">
              <button className="hero-btn" type="button" onClick={() => push({ type: "card" })}>
                {t("card")}
              </button>
              <button className="hero-btn solid" type="button" onClick={() => { s.setMethod("credit"); go({ type: "pay" }); }}>
                {t("pay")}
              </button>
            </div>
          </div>
        </div>
        <div className="dots">
          <i className={page === 0 ? "on" : ""} />
          <i className={page === 1 ? "on" : ""} />
        </div>
      </div>

      <div className="quick">
        <button className="quick-item" type="button" onClick={() => go({ type: "scan" })}>
          <span className="quick-ico"><IScan /></span>
          {t("scan")}
        </button>
        <button className="quick-item" type="button" onClick={() => go({ type: "send" })}>
          <span className="quick-ico"><ISend /></span>
          {t("sendReceive")}
        </button>
        <button className="quick-item" type="button" onClick={() => go({ type: "bills" })}>
          <span className="quick-ico"><IBill /></span>
          {t("bills")}
        </button>
        <button className="quick-item" type="button" onClick={() => push({ type: "all" })}>
          <span className="quick-ico"><IPlus /></span>
          {t("all")}
        </button>
      </div>

      <div className="section">
        <div className="seg">
          <button className={seg === "fav" ? "on" : ""} type="button" onClick={() => setSeg("fav")}>
            {t("favorites")}
          </button>
          <button className={seg === "rec" ? "on" : ""} type="button" onClick={() => setSeg("rec")}>
            {t("recommended")}
          </button>
        </div>
        <div className="icon-grid">
          {shown.map((a) => (
            <button key={a.id} className="grid-item" type="button" onClick={() => openApp(a.id)}>
              <span className="grid-ico" style={{ background: a.color }}>
                <Glyph name={a.glyph} />
              </span>
              {miniLabel(s.lang, a.id, a.name)}
            </button>
          ))}
        </div>
      </div>

      <div className="promo-row">
        {campaigns.map((c) => {
          const copy = campaignCopy(s.lang, c.id, c.title, c.subtitle, c.badge);
          return (
            <button key={c.id} className={`promo ${c.tone}`} type="button" onClick={() => push({ type: "step" })}>
              {copy.badge && <span className="badge">{copy.badge}</span>}
              <h3>{copy.title}</h3>
              <p>{copy.subtitle}</p>
            </button>
          );
        })}
      </div>

      <div className="section">
        <div className="section-h">
          {t("nearby")}
          <button className="more" type="button" onClick={() => push({ type: "nearby" })}>
            {t("seeMore")}
          </button>
        </div>
        {merchants.slice(0, 4).map((m) => (
          <button key={m.id} className="near-card" type="button" onClick={() => go({ type: "scanPay", merchantId: m.id })}>
            <div className="avatar" style={{ width: 40, height: 40, background: m.color, fontSize: 18 }}>
              {m.emoji}
            </div>
            <div className="near-info">
              <h4>{m.name}</h4>
              <p>{catLabel(s.lang, m.category)} ・ {m.distance === "オンライン" ? t("online") : m.distance}</p>
              {m.coupon && <span className="coupon-chip">{couponLabel(s.lang, m.coupon)}</span>}
            </div>
            <span className="dist">{m.distance}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { campaigns, merchants } from "../data";
import { pts } from "../format";
import { campaignCopy, couponLabel, rankLabel, stampLabel, useT } from "../i18n";
import { useStore } from "../store";
import type { Overlay } from "../types";

export function Deals({ push }: { push: (o: Overlay) => void }) {
  const s = useStore();
  const t = useT();
  return (
    <div className="scroll">
      <div className="topbar">
        <h1>{t("deals")}</h1>
      </div>
      <div className="stat-grid">
        <button className="stat" type="button" onClick={() => push({ type: "points" })}>
          <div className="k">{t("ownedPoints")}</div>
          <div className="v" style={{ color: "#FFB200" }}>{pts(s.wallet.points)} P</div>
        </button>
        <button className="stat" type="button" onClick={() => push({ type: "step" })}>
          <div className="k">{t("step")}</div>
          <div className="v">{rankLabel(s.lang, s.user.step)}</div>
          <div className="progress"><i style={{ width: `${s.user.stepProgress * 100}%` }} /></div>
        </button>
      </div>
      <div className="section-h" style={{ paddingLeft: 16 }}>{t("campaigns")}</div>
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
        <div className="section-h">{t("coupons")}</div>
        {merchants.filter((m) => m.coupon || m.stamp).map((m) => (
          <button key={m.id} className="near-card" type="button" onClick={() => push({ type: "nearby" })}>
            <div className="avatar" style={{ width: 40, height: 40, background: m.color }}>{m.emoji}</div>
            <div className="near-info">
              <h4>{m.name}</h4>
              <p>{stampLabel(s.lang, m.stamp) ?? m.category}</p>
              {m.coupon && <span className="coupon-chip">{couponLabel(s.lang, m.coupon)}</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

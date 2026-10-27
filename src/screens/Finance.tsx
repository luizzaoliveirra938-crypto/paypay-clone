import { useState } from "react";
import { billers } from "../data";
import { pts, yen } from "../format";
import { catLabel, trErr, useT } from "../i18n";
import { useStore } from "../store";
import type { Overlay } from "../types";
import { NavHead } from "../ui";

export function CardScreen({ pop, push }: { pop: () => void; push: (o: Overlay) => void }) {
  const s = useStore();
  const t = useT();
  const left = s.wallet.creditLimit - s.wallet.creditUsed;
  return (
    <div className="screen">
      <NavHead title={t("paypayCard")} onBack={pop} />
      <div className="scroll no-nav">
        <div className="card-visual">
          <div className="brand">PayPay Card</div>
          <div>
            <div className="pan">**** **** **** 4281</div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>{s.user.name} ・ 12/28</div>
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat">
            <div className="k">{t("available")}</div>
            <div className="v">{yen(left)}</div>
          </div>
          <div className="stat">
            <div className="k">{t("usedAmount")}</div>
            <div className="v">{yen(s.wallet.creditUsed)}</div>
          </div>
        </div>
        <p className="credit-note">{t("cardNote")}</p>
        <div className="pad">
          <button
            className="btn primary"
            type="button"
            onClick={() => {
              s.setMethod("credit");
              push({ type: "pay" });
            }}
          >
            {t("payWithCard")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BankScreen({ pop, push }: { pop: () => void; push: (o: Overlay) => void }) {
  const s = useStore();
  const t = useT();
  return (
    <div className="screen">
      <NavHead title={t("paypayBank")} onBack={pop} />
      <div className="scroll no-nav">
        <div className="section" style={{ marginTop: 16, padding: 20 }}>
          <div style={{ fontSize: 13, color: "#767676" }}>{t("yenDeposit")}</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{yen(s.wallet.bankBalance)}</div>
        </div>
        <div className="pad" style={{ display: "flex", gap: 8 }}>
          <button className="btn outline" type="button" onClick={() => push({ type: "charge" })}>
            {t("charge")}
          </button>
        </div>
        <div className="group-label">{t("services")}</div>
        <div className="list-row"><div className="grow"><h4>{t("phoneAtm")}</h4><p>{t("phoneAtmDesc")}</p></div></div>
        <div className="list-row"><div className="grow"><h4>{t("transfer")}</h4><p>{t("transferDesc")}</p></div></div>
        <div className="list-row"><div className="grow"><h4>{t("atmCharge")}</h4><p>{t("atmChargeDesc")}</p></div></div>
      </div>
    </div>
  );
}

export function PointsScreen({ pop, push }: { pop: () => void; push: (o: Overlay) => void }) {
  const s = useStore();
  const t = useT();
  return (
    <div className="screen">
      <NavHead title={t("paypayPoints")} onBack={pop} />
      <div className="scroll no-nav">
        <div className="section" style={{ marginTop: 16, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#767676" }}>{t("usablePoints")}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#FFB200", marginTop: 4 }}>{pts(s.wallet.points)} P</div>
          <p style={{ fontSize: 12, color: "#767676", marginTop: 6 }}>{t("pointRate")}</p>
        </div>
        <div className="stat-grid">
          <button className="stat" type="button" onClick={() => push({ type: "invest" })}>
            <div className="k">{t("investing")}</div>
            <div className="v">{pts(s.wallet.investedPoints)} P</div>
          </button>
          <div className="stat">
            <div className="k">{t("earnedThisMonth")}</div>
            <div className="v">
              {pts(s.txs.filter((tx) => tx.pointsEarned).reduce((a, tx) => a + tx.pointsEarned, 0))} P
            </div>
          </div>
        </div>
        <div className="toggle-row" style={{ marginTop: 8 }}>
          <span>{t("usePointsToggle")}</span>
          <button
            className={`switch ${s.wallet.usePoints ? "on" : ""}`}
            type="button"
            onClick={() => s.patchWallet({ usePoints: !s.wallet.usePoints })}
          >
            <i />
          </button>
        </div>
      </div>
    </div>
  );
}

export function InvestScreen({ pop }: { pop: () => void }) {
  const s = useStore();
  const t = useT();
  const bars = [40, 55, 48, 62, 70, 66, 80, 74, 88, 84, 92, 90];
  const [moved, setMoved] = useState(false);
  return (
    <div className="screen">
      <NavHead title={t("pointInvest")} onBack={pop} />
      <div className="scroll no-nav">
        <div className="section" style={{ marginTop: 16, padding: 20 }}>
          <div style={{ fontSize: 13, color: "#767676" }}>{t("investPoints")}</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{pts(s.wallet.investedPoints)} P</div>
          <div style={{ color: "#00B900", fontSize: 13, fontWeight: 700, marginTop: 4 }}>+2.4% {t("thisWeek")}</div>
          <div className="spark">
            {bars.map((h, i) => (
              <i key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="pad">
          <button
            className="btn primary"
            type="button"
            disabled={moved || s.wallet.points < 100}
            onClick={() => {
              s.patchWallet({
                points: s.wallet.points - 100,
                investedPoints: s.wallet.investedPoints + 100,
              });
              setMoved(true);
            }}
          >
            {moved ? t("added100") : t("add100")}
          </button>
        </div>
        <p className="credit-note">{t("investDemo")}</p>
      </div>
    </div>
  );
}

export function BillsScreen({
  pop,
  onPaid,
  toast,
}: {
  pop: () => void;
  onPaid: (txId: string) => void;
  toast: (t: string) => void;
}) {
  const s = useStore();
  const t = useT();
  return (
    <div className="screen">
      <NavHead title={t("bills")} onBack={pop} />
      <div className="scroll no-nav">
        <p className="credit-note">{t("billHelp")}</p>
        {billers.map((b) => (
          <div key={b.id} className="list-row">
            <div className="grow">
              <h4>{b.name}</h4>
              <p>{catLabel(s.lang, b.kind)} ・ {t("due")} {b.due}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="amt">{yen(b.amount)}</div>
              <button
                className="btn primary sm"
                type="button"
                style={{ marginTop: 6, height: 32, fontSize: 12 }}
                onClick={() => {
                  const r = s.pay({
                    title: b.name,
                    subtitle: t("bills"),
                    amount: b.amount,
                    kind: "bill",
                  });
                  if (!r.ok) toast(trErr(s.lang, r.reason));
                  else onPaid(r.tx.id);
                }}
              >
                {t("pay")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

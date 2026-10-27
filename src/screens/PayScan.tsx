import { useState } from "react";
import { merchants } from "../data";
import { yen } from "../format";
import { ICamera } from "../icons";
import { catLabel, trErr, useT } from "../i18n";
import { useStore } from "../store";
import type { Overlay } from "../types";
import { Barcode, Keypad, NavHead, QR, Sheet, Switch, useAmount, useLivePayCode } from "../ui";

export function PayScreen({
  push,
  pop,
  toast,
}: {
  push: (o: Overlay) => void;
  pop: () => void;
  toast: (t: string) => void;
}) {
  const s = useStore();
  const t = useT();
  const { code } = useLivePayCode();
  const [sheet, setSheet] = useState(false);
  const creditLeft = s.wallet.creditLimit - s.wallet.creditUsed;
  const money = s.wallet.money + s.wallet.moneyLite;
  const method = s.wallet.method;

  return (
    <div className="screen pay-screen">
      <NavHead
        title={t("pay")}
        onBack={pop}
        right={
          <button className="icon-btn" type="button" onClick={() => push({ type: "scan" })} aria-label={t("scan")}>
            <ICamera />
          </button>
        }
      />
      <div className="scroll no-nav">
        <button
          className={`pay-method ${method}`}
          type="button"
          onClick={() => s.setMethod(method === "balance" ? "credit" : "balance")}
        >
          <div className="lab">{method === "balance" ? t("balance") : t("credit")}</div>
          <div className="val">{yen(method === "balance" ? money : creditLeft)}</div>
          <div className="hint">{t("payHint")}</div>
        </button>

        <button className="barcode-wrap" type="button" onClick={() => setSheet(true)}>
          <Barcode value={code} />
          <div className="barcode-num">{code}</div>
        </button>
        <div className="qr-box">
          <QR value={`paypay://pay/${code}`} />
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "#767676", marginBottom: 12 }}>
          {t("payBarcode")}
        </p>
        <div className="toggle-row">
          <span>{t("usePoints")}  {s.wallet.points.toLocaleString()} P</span>
          <Switch on={s.wallet.usePoints} onToggle={() => s.patchWallet({ usePoints: !s.wallet.usePoints })} />
        </div>
      </div>
      {sheet && (
        <Sheet onClose={() => setSheet(false)}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: "4px 0 12px" }}>{t("shopScanned")}</h3>
          <p style={{ fontSize: 13, color: "#767676", marginBottom: 8 }}>{t("pickShop")}</p>
          {merchants.slice(0, 6).map((m) => (
            <button
              key={m.id}
              className="list-row"
              type="button"
              onClick={() => {
                setSheet(false);
                push({ type: "scanPay", merchantId: m.id });
              }}
            >
              <div className="avatar" style={{ width: 40, height: 40, background: m.color }}>
                {m.emoji}
              </div>
              <div className="grow">
                <h4>{m.name}</h4>
                <p>{catLabel(s.lang, m.category)}</p>
              </div>
            </button>
          ))}
        </Sheet>
      )}
    </div>
  );
}

export function ScanScreen({ push, pop }: { push: (o: Overlay) => void; pop: () => void }) {
  const t = useT();
  return (
    <div className="screen" style={{ background: "#111" }}>
      <NavHead title={t("scan")} onBack={pop} ghost />
      <div className="scan-view">
        <div className="scan-frame">
          <div className="scan-line" />
        </div>
        <div className="demo-merchants">
          {merchants.slice(0, 3).map((m) => (
            <button
              key={m.id}
              className="list-row"
              type="button"
              style={{ borderRadius: 12, overflow: "hidden" }}
              onClick={() => push({ type: "scanPay", merchantId: m.id })}
            >
              <div className="avatar" style={{ width: 40, height: 40, background: m.color }}>
                {m.emoji}
              </div>
              <div className="grow">
                <h4>{m.name}</h4>
                <p>{t("readQr")}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="scan-hint">{t("scanHint")}</div>
      </div>
    </div>
  );
}

export function ScanPayScreen({
  merchantId,
  pop,
  onPaid,
  toast,
}: {
  merchantId: string;
  pop: () => void;
  onPaid: (txId: string) => void;
  toast: (t: string) => void;
}) {
  const s = useStore();
  const t = useT();
  const m = merchants.find((x) => x.id === merchantId) ?? merchants[0];
  const amt = useAmount();
  const [err, setErr] = useState("");

  const submit = () => {
    const r = s.pay({
      title: m.name,
      subtitle: m.category,
      amount: amt.amount,
      merchantId: m.id,
    });
    if (!r.ok) {
      const msg = trErr(s.lang, r.reason);
      setErr(msg);
      toast(msg);
      return;
    }
    onPaid(r.tx.id);
  };

  return (
    <div className="screen" style={{ background: "#fff" }}>
      <NavHead title={t("payment")} onBack={pop} />
      <div className="scroll no-nav" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16 }}>
          <div className="avatar" style={{ width: 48, height: 48, background: m.color, fontSize: 22 }}>
            {m.emoji}
          </div>
          <div>
            <h3 style={{ fontSize: 16 }}>{m.name}</h3>
            <p style={{ fontSize: 12, color: "#767676" }}>{catLabel(s.lang, m.category)} ・ {m.distance}</p>
          </div>
        </div>
        <div className="amount-hero">
          <span className="yen">¥</span>
          <span className="num">{amt.raw ? Number(amt.raw).toLocaleString("ja-JP") : "0"}</span>
          <div className="sub">
            {s.wallet.method === "credit" ? t("payWithCredit") : `${t("balPrefix")} ${yen(s.wallet.money + s.wallet.moneyLite)}`}
            {s.wallet.usePoints ? ` ・ ${t("usingPoints")} ${s.wallet.points.toLocaleString()}P` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", padding: "8px 16px 0", flexWrap: "wrap" }}>
          {m.typical.map((n) => (
            <button key={n} className="chip" type="button" onClick={() => amt.setRaw(String(n))}>
              {yen(n)}
            </button>
          ))}
        </div>
        {err && <div className="err">{err}</div>}
        <div style={{ flex: 1 }} />
        <Keypad onDigit={amt.push} onBack={amt.back} onExtra={amt.extra} />
        <div className="pad">
          <button className="btn primary" type="button" disabled={amt.amount <= 0} onClick={submit}>
            {t("pay")}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { contacts } from "../data";
import { yen } from "../format";
import { Avatar, ICopy } from "../icons";
import { sourceLabel, trErr, useT } from "../i18n";
import { useStore } from "../store";
import type { Overlay } from "../types";
import { Keypad, NavHead, QR, useAmount } from "../ui";

export function ChargeScreen({
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
  const amt = useAmount();
  const [source, setSource] = useState("PayPay銀行");
  const sources = ["PayPay銀行", "みずほ銀行", "セブン銀行ATM"];

  const submit = () => {
    const r = s.charge(amt.amount, source);
    if (!r.ok) {
      toast(trErr(s.lang, r.reason));
      return;
    }
    onPaid(r.tx.id);
  };

  return (
    <div className="screen" style={{ background: "#fff" }}>
      <NavHead title={t("charge")} onBack={pop} />
      <div className="scroll no-nav" style={{ display: "flex", flexDirection: "column" }}>
        <div className="amount-hero">
          <span className="yen">¥</span>
          <span className="num">{amt.raw ? Number(amt.raw).toLocaleString("ja-JP") : "0"}</span>
          <div className="sub">{t("balPrefix")} {yen(s.wallet.money + s.wallet.moneyLite)}</div>
        </div>
        <div className="chip-row">
          {[1000, 3000, 5000, 10000].map((n) => (
            <button key={n} className="chip" type="button" onClick={() => amt.setRaw(String(n))}>
              {yen(n)}
            </button>
          ))}
        </div>
        <p className="group-label">{t("chargeFrom")}</p>
        {sources.map((src) => (
          <button
            key={src}
            className="list-row"
            type="button"
            onClick={() => setSource(src)}
          >
            <div className="grow">
              <h4>{sourceLabel(s.lang, src)}</h4>
              <p>{src === "PayPay銀行" ? `${t("balPrefix")} ${yen(s.wallet.bankBalance)}` : t("instant")}</p>
            </div>
            <span style={{ color: source === src ? "#FF0033" : "#ccc", fontWeight: 700 }}>
              {source === src ? t("selected") : ""}
            </span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <Keypad onDigit={amt.push} onBack={amt.back} onExtra={amt.extra} />
        <div className="pad">
          <button className="btn primary" type="button" disabled={amt.amount <= 0} onClick={submit}>
            {t("doCharge")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SendScreen({ push, pop }: { push: (o: Overlay) => void; pop: () => void }) {
  const t = useT();
  const [q, setQ] = useState("");
  const list = contacts.filter((c) => c.name.includes(q) || c.handle.includes(q));
  return (
    <div className="screen">
      <NavHead title={t("sendReceive")} onBack={pop} />
      <div className="pad" style={{ background: "#fff" }}>
        <button className="btn outline" type="button" onClick={() => push({ type: "receive" })}>
          {t("receive")}
        </button>
      </div>
      <div className="search">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPeople")} />
      </div>
      <div className="scroll no-nav">
        {list.map((c) => (
          <button
            key={c.id}
            className="list-row"
            type="button"
            onClick={() => push({ type: "sendAmount", contactId: c.id })}
          >
            <Avatar name={c.name} color={c.color} />
            <div className="grow">
              <h4>{c.name}</h4>
              <p>@{c.handle}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SendAmountScreen({
  contactId,
  pop,
  onPaid,
  toast,
}: {
  contactId: string;
  pop: () => void;
  onPaid: (txId: string) => void;
  toast: (t: string) => void;
}) {
  const s = useStore();
  const t = useT();
  const c = contacts.find((x) => x.id === contactId) ?? contacts[0];
  const amt = useAmount();
  const [memo, setMemo] = useState("");

  const submit = () => {
    const r = s.sendTo(c.id, c.name, amt.amount, memo);
    if (!r.ok) {
      toast(trErr(s.lang, r.reason));
      return;
    }
    onPaid(r.tx.id);
  };

  return (
    <div className="screen" style={{ background: "#fff" }}>
      <NavHead title={c.name} onBack={pop} />
      <div className="scroll no-nav" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12 }}>
          <Avatar name={c.name} color={c.color} size={56} />
        </div>
        <div className="amount-hero">
          <span className="yen">¥</span>
          <span className="num">{amt.raw ? Number(amt.raw).toLocaleString("ja-JP") : "0"}</span>
          <div className="sub">{t("paypayMoney")} {yen(s.wallet.money)}</div>
        </div>
        <div className="pad">
          <input
            className="input"
            placeholder={t("memo")}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }} />
        <Keypad onDigit={amt.push} onBack={amt.back} onExtra={amt.extra} />
        <div className="pad">
          <button className="btn primary" type="button" disabled={amt.amount <= 0} onClick={submit}>
            {t("send")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReceiveScreen({ pop, toast }: { pop: () => void; toast: (t: string) => void }) {
  const s = useStore();
  const t = useT();
  const [waiting, setWaiting] = useState(false);
  const link = `paypay://me/${s.user.handle}`;

  const demo = () => {
    setWaiting(true);
    setTimeout(() => {
      const c = contacts[1];
      s.receiveFrom(c.id, c.name, 2000, "よろしく！");
      toast(t("receivedFrom", { name: c.name, amount: yen(2000) }));
      setWaiting(false);
      pop();
    }, 1200);
  };

  return (
    <div className="screen" style={{ background: "#fff" }}>
      <NavHead title={t("receive")} onBack={pop} />
      <div className="scroll no-nav" style={{ textAlign: "center", padding: 16 }}>
        <p style={{ fontSize: 13, color: "#767676", marginBottom: 8 }}>{t("yourId")}</p>
        <h3 style={{ fontSize: 18, marginBottom: 12 }}>@{s.user.handle}</h3>
        <div className="qr-box">
          <QR value={link} />
        </div>
        <button
          className="btn outline sm"
          type="button"
          style={{ margin: "8px auto", display: "inline-flex", alignItems: "center", gap: 6, padding: "0 18px" }}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(s.user.handle);
              toast(t("copied"));
            } catch {
              toast(t("copied"));
            }
          }}
        >
          <ICopy size={16} /> {t("copyId")}
        </button>
        <p style={{ fontSize: 13, color: "#555", margin: "18px 16px 12px" }}>
          {t("receiveHelp")}
        </p>
        <button className="btn primary" type="button" onClick={demo} disabled={waiting}>
          {waiting ? t("receiving") : t("demoReceive")}
        </button>
      </div>
    </div>
  );
}

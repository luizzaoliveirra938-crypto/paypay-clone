import { useMemo, useState } from "react";
import { contacts, merchants } from "../data";
import { compactDate, fullDate, yen } from "../format";
import { catLabel, useT } from "../i18n";
import { Avatar } from "../icons";
import { useStore } from "../store";
import type { Msg } from "../i18n";
import type { Overlay, TxKind } from "../types";
import { NavHead } from "../ui";

const filterKeys: { id: "all" | TxKind; key: Msg }[] = [
  { id: "all", key: "filterAll" },
  { id: "pay", key: "filterPay" },
  { id: "charge", key: "filterCharge" },
  { id: "send", key: "filterSend" },
  { id: "receive", key: "filterReceive" },
  { id: "bill", key: "filterBill" },
];

export function HistoryScreen({ push, pop }: { push: (o: Overlay) => void; pop: () => void }) {
  const s = useStore();
  const t = useT();
  const [f, setF] = useState<(typeof filterKeys)[number]["id"]>("all");
  const rows = useMemo(
    () => (f === "all" ? s.txs : s.txs.filter((tx) => tx.kind === f)),
    [s.txs, f],
  );

  return (
    <div className="screen">
      <NavHead title={t("txHistory")} onBack={pop} />
      <div className="chip-row" style={{ paddingTop: 12 }}>
        {filterKeys.map((x) => (
          <button key={x.id} className={`chip ${f === x.id ? "on" : ""}`} type="button" onClick={() => setF(x.id)}>
            {t(x.key)}
          </button>
        ))}
      </div>
      <div className="scroll no-nav">
        {rows.length === 0 && <div className="empty">{t("noTx")}</div>}
        {rows.map((tx) => {
          const m = merchants.find((x) => x.id === tx.merchantId);
          const c = contacts.find((x) => x.id === tx.contactId);
          return (
            <button key={tx.id} className="list-row" type="button" onClick={() => push({ type: "detail", id: tx.id })}>
              {m ? (
                <div className="avatar" style={{ width: 40, height: 40, background: m.color }}>{m.emoji}</div>
              ) : c ? (
                <Avatar name={c.name} color={c.color} />
              ) : (
                <Avatar name={tx.title} color="#FF0033" />
              )}
              <div className="grow">
                <h4>{tx.title}</h4>
                <p>{compactDate(tx.at, s.lang)}{tx.pointsEarned ? ` ・ +${tx.pointsEarned}P` : ""}</p>
              </div>
              <span className={`amt ${tx.amount > 0 ? "in" : ""}`}>
                {tx.amount > 0 ? "+" : ""}
                {yen(tx.amount)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DetailScreen({ id, pop }: { id: string; pop: () => void }) {
  const s = useStore();
  const t = useT();
  const tx = s.txs.find((x) => x.id === id);
  if (!tx) {
    return (
      <div className="screen">
        <NavHead title={t("detail")} onBack={pop} />
        <div className="empty">{t("notFound")}</div>
      </div>
    );
  }
  const methodLabel =
    tx.method === "credit" ? t("credit") : tx.method === "points" ? t("points") : t("balance");
  const kindKey: Record<TxKind, Msg> = {
    pay: "kindPay",
    charge: "kindCharge",
    send: "kindSend",
    receive: "kindReceive",
    refund: "kindRefund",
    points: "kindPoints",
    bill: "kindBill",
    atm: "kindAtm",
  };
  return (
    <div className="screen">
      <NavHead title={t("detail")} onBack={pop} />
      <div className="scroll no-nav">
        <div className="section" style={{ marginTop: 16, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#767676" }}>
            {tx.merchantId ? catLabel(s.lang, tx.subtitle ?? "") : tx.subtitle ?? t(kindKey[tx.kind])}
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, margin: "8px 0" }}>
            {tx.amount > 0 ? "+" : ""}
            {yen(tx.amount)}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{tx.title}</div>
          <div style={{ fontSize: 12, color: "#767676", marginTop: 4 }}>{fullDate(tx.at)}</div>
        </div>
        <div className="section">
          <Row k={t("kind")} v={t(kindKey[tx.kind])} />
          <Row k={t("payMethod")} v={methodLabel} />
          {tx.pointsUsed > 0 && <Row k={t("pointsUsed")} v={`${tx.pointsUsed} P`} />}
          {tx.pointsEarned > 0 && <Row k={t("pointsEarned")} v={`+${tx.pointsEarned} P`} />}
          <Row k={t("txId")} v={tx.id} />
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="list-row">
      <div className="grow">
        <p>{k}</p>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700 }}>{v}</span>
    </div>
  );
}

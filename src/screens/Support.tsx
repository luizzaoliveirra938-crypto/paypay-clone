import { useEffect, useRef, useState } from "react";
import { chatTime, compactDate } from "../format";
import { IBack, IHeadset, ISendMsg } from "../icons";
import { ticketCatLabel, ticketStatusLabel, useT } from "../i18n";
import { useStore } from "../store";
import type { Ticket, TicketCategory } from "../types";
import { NavHead } from "../ui";

const cats: TicketCategory[] = ["restriction", "payment", "account", "other"];

export function SupportHome({
  push,
  pop,
}: {
  push: (o: { type: "supportNew" } | { type: "supportChat"; ticketId: string }) => void;
  pop: () => void;
}) {
  const s = useStore();
  const t = useT();
  return (
    <div className="screen">
      <NavHead title={t("support")} onBack={pop} />
      <div className="scroll no-nav">
        <div className="support-hero">
          <div className="support-hero-ico">
            <IHeadset size={28} color="#FF0033" />
          </div>
          <div>
            <h3>{t("agentName")}</h3>
            <p>{t("supportHours")}</p>
          </div>
        </div>
        <div className="pad">
          <button className="btn primary" type="button" onClick={() => push({ type: "supportNew" })}>
            {t("newInquiry")}
          </button>
        </div>
        {s.myTickets.length === 0 ? (
          <div className="empty">{t("noTickets")}</div>
        ) : (
          s.myTickets.map((tk) => {
            const last = tk.messages[tk.messages.length - 1];
            return (
              <button
                key={tk.id}
                className="ticket-row"
                type="button"
                onClick={() => push({ type: "supportChat", ticketId: tk.id })}
              >
                <div className="ticket-row-top">
                  <span className={`t-status ${tk.status}`}>{ticketStatusLabel(s.lang, tk.status)}</span>
                  {tk.unreadUser > 0 && <span className="t-unread">{tk.unreadUser}</span>}
                </div>
                <h4>{tk.subject}</h4>
                <p className="ticket-no">
                  {t("ticketNo")} {tk.number}
                </p>
                <p className="ticket-preview">{last?.text}</p>
                <p className="ticket-time">{compactDate(tk.updatedAt, s.lang)}</p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function SupportNew({
  push,
  pop,
  defaultCategory = "other",
}: {
  push: (o: { type: "supportChat"; ticketId: string }) => void;
  pop: () => void;
  defaultCategory?: TicketCategory;
}) {
  const s = useStore();
  const t = useT();
  const [category, setCategory] = useState<TicketCategory>(
    s.status === "frozen" || s.status === "restricted" ? "restriction" : defaultCategory,
  );
  const [subject, setSubject] = useState(
    s.status === "frozen" || s.status === "restricted" ? t("freezeTitle") : "",
  );
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = s.openTicket(category, subject, body);
    if (!res.ok) {
      setError(t("errFields"));
      return;
    }
    push({ type: "supportChat", ticketId: res.ticket.id });
  };

  return (
    <div className="screen">
      <NavHead title={t("newInquiry")} onBack={pop} />
      <form className="scroll no-nav pad" onSubmit={submit}>
        <p className="credit-note">{t("inquiryHint")}</p>
        <div className="field-label">{t("pickCategory")}</div>
        <div className="chip-row wrap">
          {cats.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? "on" : ""}`}
              type="button"
              onClick={() => setCategory(c)}
            >
              {ticketCatLabel(s.lang, c)}
            </button>
          ))}
        </div>
        <label className="field">
          {t("subject")}
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label className="field">
          {t("message")}
          <textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        {error && <div className="auth-error">{error}</div>}
        <button className="btn primary" type="submit">
          {t("submitInquiry")}
        </button>
      </form>
    </div>
  );
}

export function SupportChat({ ticketId, pop, perspective }: { ticketId: string; pop: () => void; perspective: "user" | "agent" }) {
  const s = useStore();
  const ticket = s.tickets.find((t) => t.id === ticketId);
  useEffect(() => {
    if (ticket) s.markTicketRead(ticket.id, perspective);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, ticket?.messages.length]);
  if (!ticket) return null;
  return <ChatThread ticket={ticket} pop={pop} perspective={perspective} />;
}

export function ChatThread({
  ticket,
  pop,
  perspective,
  onStatus,
}: {
  ticket: Ticket;
  pop?: () => void;
  perspective: "user" | "agent";
  onStatus?: (status: Ticket["status"]) => void;
}) {
  const s = useStore();
  const t = useT();
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const account = s.accounts.find((a) => a.id === ticket.accountId);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [ticket.messages.length]);

  const send = () => {
    if (!text.trim()) return;
    s.sendMessage(ticket.id, text, perspective);
    setText("");
  };

  return (
    <div className={`chat ${pop ? "screen" : "chat-embed"}`}>
      <div className="chat-head">
        {pop && (
          <button className="icon-btn" type="button" onClick={pop} aria-label={t("back")}>
            <IBack />
          </button>
        )}
        <div className="chat-head-info">
          <div className="chat-head-name">
            {perspective === "user" ? t("agentName") : account?.name ?? t("fromAccount")}
            <i className="online-dot" />
          </div>
          <div className="chat-head-sub">
            {t("ticketNo")} {ticket.number}
            {account && perspective === "agent" ? ` · @${account.handle}` : ""}
          </div>
        </div>
        <span className={`t-status ${ticket.status}`}>{ticketStatusLabel(s.lang, ticket.status)}</span>
      </div>
      {perspective === "agent" && onStatus && (
        <div className="chat-tools">
          <button type="button" onClick={() => onStatus("pending")}>
            {t("ticketPending")}
          </button>
          <button type="button" onClick={() => onStatus("resolved")}>
            {t("resolve")}
          </button>
          <button type="button" onClick={() => onStatus("closed")}>
            {t("closeTicket")}
          </button>
          <button type="button" onClick={() => onStatus("open")}>
            {t("reopen")}
          </button>
        </div>
      )}
      <div className="chat-log">
        <div className="chat-welcome">{t("supportWelcome")}</div>
        {ticket.messages.map((m) => {
          if (m.from === "system") {
            return (
              <div key={m.id} className="bubble-sys">
                {m.text}
              </div>
            );
          }
          const mine = m.from === perspective;
          return (
            <div key={m.id} className={`bubble-row ${mine ? "mine" : "theirs"}`}>
              {!mine && (
                <div className="bubble-avatar">{m.from === "agent" ? "P" : (account?.name.slice(-1) ?? "U")}</div>
              )}
              <div>
                {!mine && <div className="bubble-name">{m.from === "agent" ? t("agentName") : m.authorName}</div>}
                <div className={`bubble ${mine ? "me" : m.from === "agent" ? "agent" : "client"}`}>{m.text}</div>
                <div className="bubble-time">{chatTime(m.at)}</div>
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      <div className="chat-compose">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("typeMessage")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button className="chat-send" type="button" onClick={send} disabled={!text.trim()} aria-label={t("sendMsg")}>
          <ISendMsg size={18} color="#fff" />
        </button>
      </div>
    </div>
  );
}

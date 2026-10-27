import { useEffect, useMemo, useState } from "react";
import { compactDate, yen } from "../format";
import { PayPayMark } from "../icons";
import { accountStatusLabel, ticketCatLabel, ticketStatusLabel, trErr, useT } from "../i18n";
import { useStore } from "../store";
import type { AccountStatus, Ticket, UserAccount } from "../types";
import { ChatThread } from "./Support";

type AdminTab = "home" | "users" | "tickets";

export function AdminApp() {
  const s = useStore();
  const t = useT();
  const [tab, setTab] = useState<AdminTab>("tickets");
  const [picked, setPicked] = useState<string | null>(s.tickets[0]?.id ?? null);

  if (!s.isAdmin) return <AdminLogin />;

  const users = s.accounts.filter((a) => a.role !== "admin");
  const frozen = users.filter((a) => a.status === "frozen");
  const open = s.tickets.filter((tk) => tk.status === "open" || tk.status === "pending");
  const unread = s.tickets.reduce((n, tk) => n + tk.unreadAgent, 0);
  const ticket = s.tickets.find((tk) => tk.id === picked) ?? null;

  return (
    <div className="admin-root">
      <aside className="admin-side">
        <div className="admin-brand">
          <PayPayMark size={28} color="#FF0033" />
          <span>{t("adminTitle")}</span>
        </div>
        <nav className="admin-nav">
          <button className={tab === "home" ? "on" : ""} type="button" onClick={() => setTab("home")}>
            {t("adminOverview")}
          </button>
          <button className={tab === "users" ? "on" : ""} type="button" onClick={() => setTab("users")}>
            {t("adminUsers")}
            <em>{users.length}</em>
          </button>
          <button className={tab === "tickets" ? "on" : ""} type="button" onClick={() => setTab("tickets")}>
            {t("adminTickets")}
            {unread > 0 && <em className="hot">{unread}</em>}
          </button>
        </nav>
        <div className="admin-side-foot">
          <button
            type="button"
            onClick={() => {
              s.logout();
              location.hash = "";
            }}
          >
            {t("backToApp")}
          </button>
          <button type="button" onClick={() => s.logout()}>
            {t("logout")}
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-top">
          <div>
            <h1>
              {tab === "home" ? t("adminOverview") : tab === "users" ? t("adminUsers") : t("adminTickets")}
            </h1>
            <p>{t("adminHint")}</p>
          </div>
          <div className="admin-lang">
            <button type="button" className={s.lang === "ja" ? "on" : ""} onClick={() => s.setLang("ja")}>
              日本語
            </button>
            <button type="button" className={s.lang === "en" ? "on" : ""} onClick={() => s.setLang("en")}>
              English
            </button>
          </div>
        </header>
        {tab === "home" && (
          <Overview
            users={users.length}
            frozen={frozen.length}
            open={open.length}
            unread={unread}
            tickets={s.tickets}
            accounts={users}
            onOpen={(id) => {
              setPicked(id);
              setTab("tickets");
            }}
            onUsers={() => setTab("users")}
          />
        )}
        {tab === "users" && (
          <UsersTable
            users={users}
            onOpenTicket={(accountId) => {
              const tk = s.tickets.find((x) => x.accountId === accountId);
              if (tk) {
                setPicked(tk.id);
                setTab("tickets");
              }
            }}
          />
        )}
        {tab === "tickets" && (
          <TicketsDesk tickets={s.tickets} accounts={s.accounts} picked={picked} onPick={setPicked} ticket={ticket} />
        )}
      </main>
    </div>
  );
}

function AdminLogin() {
  const s = useStore();
  const t = useT();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <PayPayMark size={40} color="#FF0033" />
        <h1>{t("adminLogin")}</h1>
        <p>{t("adminHint")}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const res = s.login(id, password);
            if (!res.ok) setError(trErr(s.lang, res.reason));
            else if (res.role !== "admin") {
              s.logout();
              setError(t("adminLogin"));
            }
          }}
        >
          <label>
            {t("phoneOrId")}
            <input value={id} onChange={(e) => setId(e.target.value)} />
          </label>
          <label>
            {t("password")}
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button className="btn primary" type="submit">
            {t("loginBtn")}
          </button>
        </form>
        <button className="auth-switch" type="button" onClick={() => (location.hash = "")}>
          {t("backToApp")}
        </button>
      </div>
    </div>
  );
}

function Overview({
  users,
  frozen,
  open,
  unread,
  tickets,
  accounts,
  onOpen,
  onUsers,
}: {
  users: number;
  frozen: number;
  open: number;
  unread: number;
  tickets: Ticket[];
  accounts: UserAccount[];
  onOpen: (id: string) => void;
  onUsers: () => void;
}) {
  const s = useStore();
  const t = useT();
  const frozenList = accounts.filter((a) => a.status === "frozen" || a.status === "restricted" || a.status === "blocked");
  return (
    <div className="admin-home">
      <div className="admin-stats">
        <button type="button" onClick={onUsers}>
          <b>{users}</b>
          {t("members")}
        </button>
        <button type="button" onClick={onUsers}>
          <b>{frozen}</b>
          {t("frozenAccounts")}
        </button>
        <button type="button">
          <b>{open}</b>
          {t("openTickets")}
        </button>
        <button type="button">
          <b>{unread}</b>
          {t("unreadInbox")}
        </button>
      </div>
      <h2>{t("frozenAccounts")}</h2>
      {frozenList.length === 0 ? (
        <p className="credit-note">—</p>
      ) : (
        frozenList.map((a) => (
          <div key={a.id} className="admin-flag">
            <div>
              <strong>{a.name}</strong>
              <span>
                @{a.handle} · {accountStatusLabel(s.lang, a.status)}
              </span>
              {a.freezeReason && <em>{a.freezeReason}</em>}
            </div>
            <StatusActions account={a} />
          </div>
        ))
      )}
      <h2>{t("adminTickets")}</h2>
      {tickets.slice(0, 6).map((tk) => {
        const acc = s.accounts.find((a) => a.id === tk.accountId);
        const last = tk.messages[tk.messages.length - 1];
        return (
          <button key={tk.id} className="admin-trow" type="button" onClick={() => onOpen(tk.id)}>
            <div>
              <strong>
                {acc?.name} · {tk.number}
              </strong>
              <span>{last?.text}</span>
            </div>
            <em className={`t-status ${tk.status}`}>{ticketStatusLabel(s.lang, tk.status)}</em>
          </button>
        );
      })}
    </div>
  );
}

function UsersTable({ users, onOpenTicket }: { users: UserAccount[]; onOpenTicket: (id: string) => void }) {
  const s = useStore();
  const t = useT();
  const [q, setQ] = useState("");
  const shown = users.filter((a) => {
    const hay = `${a.name} ${a.handle} ${a.phone}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });
  return (
    <div className="admin-users">
      <input className="admin-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`${t("colName")} / ${t("colId")}`} />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("colName")}</th>
              <th>{t("colId")}</th>
              <th>{t("colPhone")}</th>
              <th>{t("colStatus")}</th>
              <th>{t("colBalance")}</th>
              <th>{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((a) => {
              const tks = s.tickets.filter((tk) => tk.accountId === a.id);
              return (
                <tr key={a.id} className={a.status !== "active" ? a.status : ""}>
                  <td>
                    <strong>{a.name}</strong>
                    {tks.length > 0 && (
                      <button className="linkish" type="button" onClick={() => onOpenTicket(a.id)}>
                        {tks.length} {t("adminTickets")}
                      </button>
                    )}
                  </td>
                  <td>@{a.handle}</td>
                  <td>{a.phone}</td>
                  <td>
                    <span className={`t-status ${a.status}`}>{accountStatusLabel(s.lang, a.status)}</span>
                  </td>
                  <td>{yen(a.wallet.money + a.wallet.moneyLite)}</td>
                  <td>
                    <StatusActions account={a} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusActions({ account }: { account: UserAccount }) {
  const s = useStore();
  const t = useT();
  const [open, setOpen] = useState<AccountStatus | null>(null);
  const [reason, setReason] = useState(account.freezeReason);

  if (open) {
    return (
      <div className="status-pop">
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("freezeReasonPh")} />
        <div>
          <button
            className="btn primary sm"
            type="button"
            onClick={() => {
              s.setAccountStatus(account.id, open, reason);
              setOpen(null);
            }}
          >
            {t("apply")}
          </button>
          <button className="btn ghost sm" type="button" onClick={() => setOpen(null)}>
            {t("cancel")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="status-acts">
      {account.status !== "active" && (
        <button type="button" onClick={() => s.setAccountStatus(account.id, "active")}>
          {t("doActivate")}
        </button>
      )}
      {account.status !== "restricted" && (
        <button type="button" onClick={() => setOpen("restricted")}>
          {t("doRestrict")}
        </button>
      )}
      {account.status !== "frozen" && (
        <button className="danger" type="button" onClick={() => setOpen("frozen")}>
          {t("doFreeze")}
        </button>
      )}
      {account.status !== "blocked" && (
        <button className="danger" type="button" onClick={() => setOpen("blocked")}>
          {t("doBlock")}
        </button>
      )}
    </div>
  );
}

function TicketsDesk({
  tickets,
  accounts,
  picked,
  onPick,
  ticket,
}: {
  tickets: Ticket[];
  accounts: UserAccount[];
  picked: string | null;
  onPick: (id: string) => void;
  ticket: Ticket | null;
}) {
  const s = useStore();
  const t = useT();
  const [filter, setFilter] = useState<"all" | "open" | "frozen">("all");
  const list = useMemo(() => {
    const filtered = tickets.filter((tk) => {
      const acc = accounts.find((a) => a.id === tk.accountId);
      if (filter === "open") return tk.status === "open" || tk.status === "pending";
      if (filter === "frozen") return acc?.status === "frozen" || acc?.status === "restricted" || acc?.status === "blocked";
      return true;
    });
    if (picked && !filtered.some((tk) => tk.id === picked)) {
      const extra = tickets.find((tk) => tk.id === picked);
      if (extra) return [extra, ...filtered];
    }
    return filtered;
  }, [tickets, accounts, filter, picked]);

  return (
    <div className="desk">
      <div className="desk-list">
        <div className="seg" style={{ margin: "0 0 12px" }}>
          <button className={filter === "all" ? "on" : ""} type="button" onClick={() => setFilter("all")}>
            {t("filterAll")}
          </button>
          <button className={filter === "open" ? "on" : ""} type="button" onClick={() => setFilter("open")}>
            {t("openTickets")}
          </button>
          <button className={filter === "frozen" ? "on" : ""} type="button" onClick={() => setFilter("frozen")}>
            {t("frozenAccounts")}
          </button>
        </div>
        {list.map((tk) => {
          const acc = accounts.find((a) => a.id === tk.accountId);
          const last = tk.messages.filter((m) => m.from !== "system").slice(-1)[0] ?? tk.messages.slice(-1)[0];
          return (
            <button
              key={tk.id}
              className={`desk-item ${picked === tk.id ? "on" : ""}`}
              type="button"
              onClick={() => {
                onPick(tk.id);
                s.markTicketRead(tk.id, "agent");
              }}
            >
              <div className="desk-item-top">
                <strong>{acc?.name ?? "—"}</strong>
                {tk.unreadAgent > 0 && <span className="t-unread">{tk.unreadAgent}</span>}
              </div>
              <div className="desk-meta">
                {tk.number}
                {acc && acc.status !== "active" && (
                  <span className={`t-status ${acc.status}`}>{accountStatusLabel(s.lang, acc.status)}</span>
                )}
              </div>
              <p>{tk.subject}</p>
              <p className="desk-last">
                {last?.from === "user" ? acc?.name : last?.from === "agent" ? t("agentName") : ""} {last?.text}
              </p>
              <span className="desk-time">{compactDate(tk.updatedAt, s.lang)}</span>
            </button>
          );
        })}
      </div>
      <div className="desk-chat">
        {ticket ? (
          <>
            <TicketSwitcher list={list} pickedId={ticket.id} onPick={onPick} />
            <TicketMeta ticket={ticket} />
            <ChatThread
              ticket={ticket}
              perspective="agent"
              onStatus={(st) => s.setTicketStatus(ticket.id, st)}
            />
          </>
        ) : (
          <div className="empty">{t("noTickets")}</div>
        )}
      </div>
    </div>
  );
}

function TicketSwitcher({
  list,
  pickedId,
  onPick,
}: {
  list: Ticket[];
  pickedId: string;
  onPick: (id: string) => void;
}) {
  const s = useStore();
  const t = useT();
  const total = list.length;
  const idx = Math.max(0, list.findIndex((tk) => tk.id === pickedId));
  const prev = total ? list[(idx - 1 + total) % total] : null;
  const next = total ? list[(idx + 1) % total] : null;
  const unread = list.find((tk, i) => tk.unreadAgent > 0 && i > idx) ?? list.find((tk) => tk.unreadAgent > 0 && tk.id !== pickedId);

  const go = (id: string) => {
    onPick(id);
    s.markTicketRead(id, "agent");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (!prev || !next) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(prev.id);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(next.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prev?.id, next?.id]);

  if (total === 0) return null;
  const prevAcc = prev ? s.accounts.find((a) => a.id === prev.accountId) : null;
  const nextAcc = next ? s.accounts.find((a) => a.id === next.accountId) : null;

  return (
    <div className="ticket-switch">
      <button type="button" onClick={() => prev && go(prev.id)} disabled={total < 2} title={prevAcc?.name}>
        ← {t("prevInquiry")}
        {total > 1 && <small>{prevAcc?.name}</small>}
      </button>
      <div className="ticket-switch-mid">
        <label>
          {t("jumpInquiry")}
          <select value={pickedId} onChange={(e) => go(e.target.value)}>
            {list.map((tk) => {
              const acc = s.accounts.find((a) => a.id === tk.accountId);
              const unreadMark = tk.unreadAgent > 0 ? " •" : "";
              return (
                <option key={tk.id} value={tk.id}>
                  {acc?.name} · {tk.number}
                  {unreadMark}
                </option>
              );
            })}
          </select>
        </label>
        <span>{t("inquiryOf", { n: idx + 1, total })}</span>
      </div>
      <button className="next" type="button" onClick={() => next && go(next.id)} disabled={total < 2} title={nextAcc?.name}>
        {total > 1 && <small>{nextAcc?.name}</small>}
        {t("nextInquiry")} →
      </button>
      {unread && (
        <button className="unread-jump" type="button" onClick={() => go(unread.id)}>
          {t("nextUnread")}
        </button>
      )}
    </div>
  );
}

function TicketMeta({ ticket }: { ticket: Ticket }) {
  const s = useStore();
  const t = useT();
  const acc = s.accounts.find((a) => a.id === ticket.accountId);
  if (!acc) return null;
  return (
    <div className="ticket-meta">
      <div>
        <strong>{acc.name}</strong>
        <span>
          @{acc.handle} · {acc.phone}
        </span>
        <span>
          {t("ticketNo")} {ticket.number} · {ticketCatLabel(s.lang, ticket.category)}
        </span>
        {acc.freezeReason && (
          <em>
            {t("freezeReasonLabel")}: {acc.freezeReason}
          </em>
        )}
      </div>
      <div>
        <span className={`t-status ${acc.status}`}>{accountStatusLabel(s.lang, acc.status)}</span>
        <StatusActions account={acc} />
      </div>
    </div>
  );
}

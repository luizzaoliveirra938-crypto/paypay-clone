import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ticketNo, uid } from "./format";
import { fingerprint, mergePlatform } from "./platformMerge";
import type {
  AccountStatus,
  ChatAuthor,
  ChatMessage,
  Lang,
  PayMethod,
  Ticket,
  TicketCategory,
  TicketStatus,
  Transaction,
  User,
  UserAccount,
  Wallet,
} from "./types";

const DATA_KEY = "paypay-platform-v1";
const SESSION_KEY = "paypay-session-id";
const DEMO_IDS = new Set(["acc_yuki", "acc_misaki", "acc_kenta"]);

const favs = ["card", "points", "invest", "bank", "send", "bills", "nearby", "step"];

export function emptyWallet(): Wallet {
  return {
    money: 0,
    moneyLite: 0,
    points: 0,
    investedPoints: 0,
    creditLimit: 100000,
    creditUsed: 0,
    bankBalance: 50000,
    autoCharge: false,
    autoChargeAmount: 10000,
    usePoints: false,
    hideAmounts: false,
    method: "balance",
  };
}

const guestUser: User = {
  name: "",
  handle: "",
  phone: "",
  verified: false,
  step: "グリーン",
  stepProgress: 0,
};

function account(
  partial: Omit<
    UserAccount,
    "wallet" | "txs" | "notices" | "favorites" | "lang" | "verified" | "step" | "stepProgress" | "freezeReason"
  > &
    Partial<UserAccount>,
): UserAccount {
  return {
    verified: true,
    step: "グリーン",
    stepProgress: 0.2,
    wallet: emptyWallet(),
    txs: [],
    notices: [],
    favorites: [...favs],
    lang: "ja",
    freezeReason: "",
    updatedAt: partial.createdAt || new Date().toISOString(),
    ...partial,
  };
}

function seedAccounts(): UserAccount[] {
  const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
  return [
    account({
      id: "acc_admin",
      name: "PayPayサポート",
      handle: "admin",
      phone: "0120-990-634",
      password: "admin1234",
      role: "admin",
      status: "active",
      createdAt: ago(24 * 90),
      verified: true,
      step: "プラチナ",
      stepProgress: 1,
    }),
  ];
}

function scrubDemo(data: PlatformData): PlatformData {
  return {
    ...data,
    accounts: data.accounts.filter((a) => !DEMO_IDS.has(a.id) && (a.role === "admin" || !["yuki.tanaka", "misaki_s", "kenta_s"].includes(a.handle))),
    tickets: data.tickets.filter((tk) => !DEMO_IDS.has(tk.accountId) && tk.id !== "tk_seed_misaki"),
  };
}

function seedTickets(): Ticket[] {
  return [];
}

type PlatformData = {
  accounts: UserAccount[];
  tickets: Ticket[];
  lang: Lang;
};

type PlatformState = PlatformData & { sessionId: string | null };

function defaultData(): PlatformData {
  return { accounts: seedAccounts(), tickets: seedTickets(), lang: "ja" };
}

function loadData(): PlatformData {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    let data = defaultData();
    if (raw) {
      const parsed = JSON.parse(raw) as PlatformData;
      data = {
        lang: parsed.lang === "en" ? "en" : "ja",
        accounts: Array.isArray(parsed.accounts) && parsed.accounts.length ? parsed.accounts : data.accounts,
        tickets: Array.isArray(parsed.tickets) ? parsed.tickets : data.tickets,
      };
    }
    data = scrubDemo(data);
    if (!data.accounts.some((a) => a.role === "admin")) {
      data.accounts = [...seedAccounts(), ...data.accounts];
    }
    return data;
  } catch {
    return defaultData();
  }
}

function loadSession(): string | null {
  try {
    const id = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
    if (!id || DEMO_IDS.has(id)) {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    localStorage.setItem(SESSION_KEY, id);
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return null;
  }
}

function mapAcc(list: UserAccount[], id: string, fn: (a: UserAccount) => UserAccount) {
  return list.map((a) => (a.id === id ? fn(a) : a));
}

function moneyBlocked(a: UserAccount): string | null {
  if (a.status === "frozen") return "errFrozen";
  if (a.status === "restricted") return "errRestricted";
  if (a.status === "blocked") return "errBlocked";
  return null;
}

function msg(
  from: ChatAuthor,
  authorName: string,
  text: string,
): ChatMessage {
  return { id: uid("msg"), from, authorName, text, at: new Date().toISOString() };
}

function asUser(a: UserAccount): User {
  return {
    name: a.name,
    handle: a.handle,
    phone: a.phone,
    verified: a.verified,
    step: a.step,
    stepProgress: a.stepProgress,
  };
}

type Store = {
  user: User;
  wallet: Wallet;
  txs: Transaction[];
  notices: UserAccount["notices"];
  favorites: string[];
  lang: Lang;
  sessionId: string | null;
  role: UserAccount["role"] | null;
  status: AccountStatus;
  freezeReason: string;
  isAdmin: boolean;
  accounts: UserAccount[];
  tickets: Ticket[];
  myTickets: Ticket[];
  unreadSupport: number;
  reset: () => void;
  setLang: (lang: Lang) => void;
  patchWallet: (p: Partial<Wallet>) => void;
  setMethod: (m: PayMethod) => void;
  toggleFavorite: (id: string) => void;
  markNoticesRead: () => void;
  login: (id: string, password: string) => { ok: true; role: UserAccount["role"] } | { ok: false; reason: string };
  register: (opts: { name: string; handle: string; phone: string; password: string }) =>
    | { ok: true }
    | { ok: false; reason: string };
  logout: () => void;
  setAccountStatus: (accountId: string, status: AccountStatus, reason?: string) => { ok: true } | { ok: false; reason: string };
  openTicket: (category: TicketCategory, subject: string, message: string) =>
    | { ok: true; ticket: Ticket }
    | { ok: false; reason: string };
  sendMessage: (ticketId: string, text: string, as: "user" | "agent") => { ok: true } | { ok: false; reason: string };
  setTicketStatus: (ticketId: string, status: TicketStatus) => void;
  markTicketRead: (ticketId: string, who: "user" | "agent") => void;
  syncNow: () => void;
  pay: (opts: {
    title: string;
    subtitle?: string;
    amount: number;
    merchantId?: string;
    contactId?: string;
    kind?: Transaction["kind"];
  }) => { ok: true; tx: Transaction } | { ok: false; reason: string };
  charge: (amount: number, source: string) => { ok: true; tx: Transaction } | { ok: false; reason: string };
  sendTo: (
    contactId: string,
    name: string,
    amount: number,
    memo: string,
  ) => { ok: true; tx: Transaction } | { ok: false; reason: string };
  receiveFrom: (contactId: string, name: string, amount: number, memo: string) => Transaction;
};

const Ctx = createContext<Store | null>(null);

async function postPlatform(body: object): Promise<PlatformData | null> {
  try {
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as PlatformData;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlatformState>(() => ({
    ...loadData(),
    sessionId: loadSession(),
  }));
  const hydratedRef = useRef(false);
  const lastPushFp = useRef("");

  const applyRemote = useCallback((remote: PlatformData) => {
    lastPushFp.current = fingerprint(remote);
    setState((s) => {
      const next = mergePlatform(s, remote);
      if (fingerprint(next) === fingerprint(s)) return s;
      return { ...s, accounts: next.accounts, tickets: next.tickets };
    });
  }, []);

  useEffect(() => {
    const { sessionId, ...data } = state;
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    if (sessionId) {
      localStorage.setItem(SESSION_KEY, sessionId);
      sessionStorage.setItem(SESSION_KEY, sessionId);
    } else {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    }
    if (!hydratedRef.current) return;
    const fp = fingerprint(data);
    if (fp === lastPushFp.current) return;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/platform", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accounts: data.accounts, tickets: data.tickets, lang: data.lang }),
        });
        if (!res.ok) return;
        applyRemote((await res.json()) as PlatformData);
      } catch {
        /* offline: keep local copy */
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [applyRemote, state]);

  const pullRemote = useCallback(async () => {
    try {
      const res = await fetch("/api/platform", { cache: "no-store" });
      if (!res.ok) return;
      applyRemote((await res.json()) as PlatformData);
    } catch {
      /* offline */
    }
  }, [applyRemote]);

  useEffect(() => {
    let stop = false;
    const pull = async () => {
      if (stop) return;
      await pullRemote();
    };
    (async () => {
      await pull();
      if (stop) return;
      hydratedRef.current = true;
      setState((s) => ({ ...s }));
    })();
    const id = window.setInterval(pull, 2000);
    const onVis = () => {
      if (document.visibilityState === "visible") void pull();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [pullRemote]);

  useEffect(() => {
    const restoreSession = () => {
      const id = loadSession();
      setState((s) => (s.sessionId === id ? s : { ...s, sessionId: id }));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        const id = e.newValue && !DEMO_IDS.has(e.newValue) ? e.newValue : null;
        setState((s) => (s.sessionId === id ? s : { ...s, sessionId: id }));
        return;
      }
      if (e.key !== DATA_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue) as PlatformData;
        setState((s) => ({
          ...s,
          accounts: parsed.accounts ?? s.accounts,
          tickets: parsed.tickets ?? s.tickets,
          lang: parsed.lang === "en" ? "en" : parsed.lang === "ja" ? "ja" : s.lang,
        }));
      } catch {
        /* ignore */
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") restoreSession();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("pageshow", restoreSession);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pageshow", restoreSession);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const api = useMemo<Store>(() => {
    const current = state.accounts.find((a) => a.id === state.sessionId) ?? null;

    const patchMe = (fn: (a: UserAccount) => UserAccount) => {
      if (!state.sessionId) return;
      const id = state.sessionId;
      const now = new Date().toISOString();
      setState((s) => ({
        ...s,
        accounts: mapAcc(s.accounts, id, (a) => ({ ...fn(a), updatedAt: now })),
      }));
    };

    const pay: Store["pay"] = ({ title, subtitle, amount, merchantId, contactId, kind = "pay" }) => {
      if (!current) return { ok: false, reason: "errLogin" };
      const blocked = moneyBlocked(current);
      if (blocked) return { ok: false, reason: blocked };
      if (amount <= 0) return { ok: false, reason: "errAmount" };
      const { wallet: chargedWallet, charged } = maybeAutoCharge(current.wallet);
      let w = chargedWallet;
      const extra: Transaction[] = [];
      if (charged) {
        extra.push({
          id: uid("tx"),
          kind: "charge",
          title: "PayPay銀行",
          subtitle: "オートチャージ",
          amount: w.autoChargeAmount,
          pointsEarned: 0,
          pointsUsed: 0,
          method: "balance",
          at: new Date().toISOString(),
        });
      }
      const usePts = w.usePoints ? Math.min(w.points, amount) : 0;
      const rest = amount - usePts;
      if (w.method === "credit") {
        const available = w.creditLimit - w.creditUsed;
        if (rest > available) return { ok: false, reason: "errCredit" };
        w = { ...w, creditUsed: w.creditUsed + rest, points: w.points - usePts };
      } else {
        const spendLite = Math.min(w.moneyLite, rest);
        const spendMoney = rest - spendLite;
        if (spendMoney > w.money) return { ok: false, reason: "errBalance" };
        w = {
          ...w,
          moneyLite: w.moneyLite - spendLite,
          money: w.money - spendMoney,
          points: w.points - usePts,
        };
      }
      const rate = current.step === "シルバー" ? 0.015 : 0.005;
      const earned = Math.max(0, Math.floor(rest * rate));
      w = { ...w, points: w.points + earned };
      const tx: Transaction = {
        id: uid("tx"),
        kind,
        title,
        subtitle,
        amount: -amount,
        pointsEarned: earned,
        pointsUsed: usePts,
        method: usePts === amount ? "points" : w.method,
        at: new Date().toISOString(),
        merchantId,
        contactId,
      };
      const nextWallet = w;
      patchMe((a) => ({ ...a, wallet: nextWallet, txs: [tx, ...extra, ...a.txs] }));
      return { ok: true, tx };
    };

    const charge: Store["charge"] = (amount, source) => {
      if (!current) return { ok: false, reason: "errLogin" };
      const blocked = moneyBlocked(current);
      if (blocked) return { ok: false, reason: blocked };
      if (amount <= 0) return { ok: false, reason: "errAmount" };
      if (source === "PayPay銀行" && current.wallet.bankBalance < amount) {
        return { ok: false, reason: "errBank" };
      }
      const tx: Transaction = {
        id: uid("tx"),
        kind: "charge",
        title: source,
        subtitle: "チャージ",
        amount,
        pointsEarned: 0,
        pointsUsed: 0,
        method: "balance",
        at: new Date().toISOString(),
      };
      patchMe((a) => ({
        ...a,
        wallet: {
          ...a.wallet,
          money: a.wallet.money + amount,
          bankBalance: source === "PayPay銀行" ? a.wallet.bankBalance - amount : a.wallet.bankBalance,
        },
        txs: [tx, ...a.txs],
      }));
      return { ok: true, tx };
    };

    const sendTo: Store["sendTo"] = (contactId, name, amount, memo) => {
      if (!current) return { ok: false, reason: "errLogin" };
      const blocked = moneyBlocked(current);
      if (blocked) return { ok: false, reason: blocked };
      if (amount <= 0) return { ok: false, reason: "errAmount" };
      if (current.wallet.money < amount) return { ok: false, reason: "errMoney" };
      const tx: Transaction = {
        id: uid("tx"),
        kind: "send",
        title: name,
        subtitle: memo || "送金",
        amount: -amount,
        pointsEarned: 0,
        pointsUsed: 0,
        method: "balance",
        at: new Date().toISOString(),
        contactId,
      };
      patchMe((a) => ({
        ...a,
        wallet: { ...a.wallet, money: a.wallet.money - amount },
        txs: [tx, ...a.txs],
      }));
      return { ok: true, tx };
    };

    const receiveFrom: Store["receiveFrom"] = (contactId, name, amount, memo) => {
      const tx: Transaction = {
        id: uid("tx"),
        kind: "receive",
        title: name,
        subtitle: memo || "受け取り",
        amount,
        pointsEarned: 0,
        pointsUsed: 0,
        method: "balance",
        at: new Date().toISOString(),
        contactId,
      };
      patchMe((a) => ({
        ...a,
        wallet: { ...a.wallet, money: a.wallet.money + amount },
        txs: [tx, ...a.txs],
      }));
      return tx;
    };

    const myTickets = state.tickets
      .filter((t) => t.accountId === state.sessionId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    return {
      user: current ? asUser(current) : guestUser,
      wallet: current?.wallet ?? emptyWallet(),
      txs: current?.txs ?? [],
      notices: current?.notices ?? [],
      favorites: current?.favorites ?? favs,
      lang: current?.lang ?? state.lang,
      sessionId: state.sessionId,
      role: current?.role ?? null,
      status: current?.status ?? "active",
      freezeReason: current?.freezeReason ?? "",
      isAdmin: current?.role === "admin",
      accounts: state.accounts,
      tickets: [...state.tickets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      myTickets,
      unreadSupport: myTickets.reduce((n, t) => n + t.unreadUser, 0),
      reset: () => {
        if (!current || current.role === "admin") return;
        const seeded = seedAccounts().find((a) => a.id === current.id);
        patchMe((a) => ({
          ...a,
          wallet: seeded ? { ...seeded.wallet } : emptyWallet(),
          txs: seeded ? seeded.txs.map((x) => ({ ...x })) : [],
          notices: seeded ? seeded.notices.map((x) => ({ ...x })) : [],
          favorites: [...favs],
        }));
      },
      setLang: (lang) => {
        const now = new Date().toISOString();
        setState((s) => ({
          ...s,
          lang,
          accounts: s.sessionId ? mapAcc(s.accounts, s.sessionId, (a) => ({ ...a, lang, updatedAt: now })) : s.accounts,
        }));
      },
      patchWallet: (p) => patchMe((a) => ({ ...a, wallet: { ...a.wallet, ...p } })),
      setMethod: (m) => patchMe((a) => ({ ...a, wallet: { ...a.wallet, method: m } })),
      toggleFavorite: (id) =>
        patchMe((a) => ({
          ...a,
          favorites: a.favorites.includes(id) ? a.favorites.filter((x) => x !== id) : [...a.favorites, id],
        })),
      markNoticesRead: () => patchMe((a) => ({ ...a, notices: a.notices.map((n) => ({ ...n, unread: false })) })),
      login: (id, password) => {
        const q = id.trim().toLowerCase();
        const found = state.accounts.find(
          (a) => a.handle.toLowerCase() === q || a.phone.replace(/\D/g, "") === id.replace(/\D/g, ""),
        );
        if (!found || found.password !== password) return { ok: false, reason: "errLogin" };
        if (found.status === "blocked") return { ok: false, reason: "errBlocked" };
        setState((s) => ({ ...s, sessionId: found.id, lang: found.lang }));
        return { ok: true, role: found.role };
      },
      register: ({ name, handle, phone, password }) => {
        const n = name.trim();
        const h = handle.trim().replace(/^@/, "");
        const p = phone.trim();
        if (!n || !h || !p || !password) return { ok: false, reason: "errFields" };
        if (h.length < 3) return { ok: false, reason: "errHandle" };
        if (state.accounts.some((a) => a.handle.toLowerCase() === h.toLowerCase())) {
          return { ok: false, reason: "errHandleTaken" };
        }
        if (state.accounts.some((a) => a.phone.replace(/\D/g, "") === p.replace(/\D/g, ""))) {
          return { ok: false, reason: "errPhoneTaken" };
        }
        const now = new Date().toISOString();
        const acc = account({
          id: uid("acc"),
          name: n,
          handle: h,
          phone: p,
          password,
          role: "user",
          status: "active",
          createdAt: now,
          updatedAt: now,
          lang: state.lang,
        });
        setState((s) => ({ ...s, accounts: [...s.accounts, acc], sessionId: acc.id }));
        void postPlatform({ account: acc }).then((merged) => {
          if (merged) applyRemote(merged);
        });
        return { ok: true };
      },
      logout: () => setState((s) => ({ ...s, sessionId: null })),
      setAccountStatus: (accountId, status, reason = "") => {
        const target = state.accounts.find((a) => a.id === accountId);
        if (!target) return { ok: false, reason: "errNotFound" };
        if (target.role === "admin") return { ok: false, reason: "errAdminProtect" };
        const now = new Date().toISOString();
        const noteText =
          status === "frozen"
            ? { ja: "セキュリティ上の理由により、ご利用を制限しました。", en: "Your account was restricted for security reasons." }
            : status === "restricted"
              ? { ja: "一部機能の利用を制限しました。", en: "Some features on this account were restricted." }
              : status === "blocked"
                ? { ja: "このアカウントは停止されました。", en: "This account was blocked." }
                : { ja: "ご利用制限を解除しました。", en: "Account restrictions were lifted." };
        setState((s) => ({
          ...s,
          accounts: mapAcc(s.accounts, accountId, (a) => ({
            ...a,
            status,
            updatedAt: now,
            freezeReason: status === "active" ? "" : reason || a.freezeReason,
            notices: [
              {
                id: uid("n"),
                title: status === "active" ? "ご利用再開のお知らせ" : "ご利用制限のお知らせ",
                body: a.lang === "en" ? noteText.en : noteText.ja,
                at: now,
                unread: true,
              },
              ...a.notices,
            ],
          })),
          tickets: s.tickets.map((tk) => {
            if (tk.accountId !== accountId || tk.status === "closed") return tk;
            const sys =
              status === "frozen"
                ? "アカウントの利用が制限されました。サポートが内容を確認します。"
                : status === "active"
                  ? "アカウントの利用制限が解除されました。"
                  : status === "blocked"
                    ? "アカウントが停止されました。"
                    : "アカウントの一部機能が制限されました。";
            return {
              ...tk,
              updatedAt: now,
              unreadUser: tk.unreadUser + 1,
              messages: [...tk.messages, msg("system", "", sys)],
            };
          }),
          sessionId: status === "blocked" && s.sessionId === accountId ? s.sessionId : s.sessionId,
        }));
        return { ok: true };
      },
      openTicket: (category, subject, message) => {
        if (!current || current.role === "admin") return { ok: false, reason: "errLogin" };
        const body = message.trim();
        const sub = subject.trim();
        if (!sub || !body) return { ok: false, reason: "errFields" };
        const number = ticketNo();
        const now = new Date().toISOString();
        const ticket: Ticket = {
          id: uid("tk"),
          number,
          accountId: current.id,
          category,
          subject: sub,
          status: "open",
          createdAt: now,
          updatedAt: now,
          unreadUser: 0,
          unreadAgent: 1,
          messages: [
            msg(
              "system",
              "",
              current.lang === "en"
                ? `We received your inquiry. Ticket number: ${number}`
                : `お問い合わせを受け付けました。チケット番号は ${number} です。`,
            ),
            msg("user", current.name, body),
          ],
        };
        setState((s) => ({ ...s, tickets: [ticket, ...s.tickets] }));
        void postPlatform({ ticket, account: current }).then((merged) => {
          if (merged) applyRemote(merged);
        });
        return { ok: true, ticket };
      },
      sendMessage: (ticketId, text, as) => {
        const body = text.trim();
        if (!body) return { ok: false, reason: "errFields" };
        const ticket = state.tickets.find((t) => t.id === ticketId);
        if (!ticket) return { ok: false, reason: "errNotFound" };
        if (as === "user" && ticket.accountId !== state.sessionId) return { ok: false, reason: "errLogin" };
        const author =
          as === "agent"
            ? "PayPayサポート"
            : state.accounts.find((a) => a.id === ticket.accountId)?.name ?? current?.name ?? "";
        const now = new Date().toISOString();
        setState((s) => ({
          ...s,
          tickets: s.tickets.map((tk) => {
            if (tk.id !== ticketId) return tk;
            const nextStatus: TicketStatus =
              tk.status === "closed" || tk.status === "resolved" ? "open" : as === "agent" && tk.status === "open" ? "pending" : tk.status;
            return {
              ...tk,
              status: nextStatus,
              updatedAt: now,
              unreadUser: as === "agent" ? tk.unreadUser + 1 : tk.unreadUser,
              unreadAgent: as === "user" ? tk.unreadAgent + 1 : tk.unreadAgent,
              messages: [...tk.messages, msg(as, author, body)],
            };
          }),
        }));
        return { ok: true };
      },
      setTicketStatus: (ticketId, status) => {
        const now = new Date().toISOString();
        setState((s) => ({
          ...s,
          tickets: s.tickets.map((tk) =>
            tk.id === ticketId
              ? {
                  ...tk,
                  status,
                  updatedAt: now,
                  messages: [
                    ...tk.messages,
                    msg(
                      "system",
                      "",
                      status === "resolved"
                        ? "このチケットは対応完了になりました。"
                        : status === "closed"
                          ? "このチケットはクローズされました。"
                          : status === "pending"
                            ? "担当者が確認しています。"
                            : "チケットを再開しました。",
                    ),
                  ],
                  unreadUser: tk.unreadUser + 1,
                }
              : tk,
          ),
        }));
      },
      markTicketRead: (ticketId, who) => {
        const now = new Date().toISOString();
        setState((s) => ({
          ...s,
          tickets: s.tickets.map((tk) =>
            tk.id === ticketId
              ? {
                  ...tk,
                  updatedAt: now,
                  unreadUser: who === "user" ? 0 : tk.unreadUser,
                  unreadAgent: who === "agent" ? 0 : tk.unreadAgent,
                }
              : tk,
          ),
        }));
      },
      syncNow: () => {
        void pullRemote();
      },
      pay,
      charge,
      sendTo,
      receiveFrom,
    };
  }, [applyRemote, pullRemote, state]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

function maybeAutoCharge(wallet: Wallet): { wallet: Wallet; charged: boolean } {
  if (!wallet.autoCharge) return { wallet, charged: false };
  const total = wallet.money + wallet.moneyLite;
  if (total >= 3000) return { wallet, charged: false };
  if (wallet.bankBalance < wallet.autoChargeAmount) return { wallet, charged: false };
  return {
    charged: true,
    wallet: {
      ...wallet,
      money: wallet.money + wallet.autoChargeAmount,
      bankBalance: wallet.bankBalance - wallet.autoChargeAmount,
    },
  };
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("store");
  return v;
}

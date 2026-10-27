import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedNotices, seedTxs } from "./data";
import { ticketNo, uid } from "./format";
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
const OLD_KEY = "paypay-clone-v1";
const SESSION_KEY = "paypay-session-id";

const yukiWallet: Wallet = {
  money: 24850,
  moneyLite: 1200,
  points: 1284,
  investedPoints: 3500,
  creditLimit: 300000,
  creditUsed: 21480,
  bankBalance: 186420,
  autoCharge: true,
  autoChargeAmount: 10000,
  usePoints: false,
  hideAmounts: false,
  method: "balance",
};

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
    account({
      id: "acc_yuki",
      name: "田中 ゆうき",
      handle: "yuki.tanaka",
      phone: "090-1234-5678",
      password: "1234",
      role: "user",
      status: "active",
      createdAt: ago(24 * 40),
      step: "シルバー",
      stepProgress: 0.72,
      wallet: { ...yukiWallet },
      txs: seedTxs(),
      notices: seedNotices.map((n) => ({ ...n })),
    }),
    account({
      id: "acc_misaki",
      name: "佐藤 美咲",
      handle: "misaki_s",
      phone: "080-5555-1111",
      password: "1234",
      role: "user",
      status: "frozen",
      freezeReason: "Unusual sign-in from a new device. Identity check required.",
      createdAt: ago(24 * 18),
      step: "グリーン",
      stepProgress: 0.3,
      wallet: {
        ...emptyWallet(),
        money: 8420,
        points: 210,
        bankBalance: 62000,
      },
    }),
    account({
      id: "acc_kenta",
      name: "鈴木 健太",
      handle: "kenta_s",
      phone: "070-2222-8899",
      password: "1234",
      role: "user",
      status: "restricted",
      freezeReason: "Payment review in progress.",
      createdAt: ago(24 * 12),
      step: "シルバー",
      stepProgress: 0.4,
      wallet: {
        ...emptyWallet(),
        money: 15600,
        points: 540,
        bankBalance: 88000,
        autoCharge: true,
      },
    }),
  ];
}

function seedTickets(): Ticket[] {
  const t0 = new Date(Date.now() - 1000 * 60 * 50).toISOString();
  const t1 = new Date(Date.now() - 1000 * 60 * 48).toISOString();
  const t2 = new Date(Date.now() - 1000 * 60 * 12).toISOString();
  return [
    {
      id: "tk_seed_misaki",
      number: "PP261026-10482",
      accountId: "acc_misaki",
      category: "restriction",
      subject: "利用制限について",
      status: "open",
      createdAt: t0,
      updatedAt: t2,
      unreadUser: 0,
      unreadAgent: 1,
      messages: [
        {
          id: "m1",
          from: "system",
          authorName: "",
          text: "お問い合わせを受け付けました。チケット番号は PP261026-10482 です。",
          at: t0,
        },
        {
          id: "m2",
          from: "user",
          authorName: "佐藤 美咲",
          text: "突然PayPayが使えなくなりました。制限の理由を教えてください。解除をお願いします。",
          at: t1,
        },
        {
          id: "m3",
          from: "user",
          authorName: "佐藤 美咲",
          text: "本人確認の書類はすでに提出済みです。確認をお願いします。",
          at: t2,
        },
      ],
    },
  ];
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
    if (raw) {
      const parsed = JSON.parse(raw) as PlatformData;
      const base = defaultData();
      return {
        lang: parsed.lang === "en" ? "en" : "ja",
        accounts: Array.isArray(parsed.accounts) && parsed.accounts.length ? parsed.accounts : base.accounts,
        tickets: Array.isArray(parsed.tickets) ? parsed.tickets : base.tickets,
      };
    }
    const old = localStorage.getItem(OLD_KEY);
    const data = defaultData();
    if (old) {
      const parsed = JSON.parse(old) as {
        user?: User;
        wallet?: Wallet;
        txs?: Transaction[];
        notices?: UserAccount["notices"];
        favorites?: string[];
        lang?: Lang;
      };
      data.lang = parsed.lang === "en" ? "en" : "ja";
      data.accounts = data.accounts.map((a) =>
        a.id === "acc_yuki"
          ? {
              ...a,
              name: parsed.user?.name ?? a.name,
              handle: parsed.user?.handle ?? a.handle,
              phone: parsed.user?.phone ?? a.phone,
              wallet: { ...a.wallet, ...parsed.wallet },
              txs: parsed.txs?.length ? parsed.txs : a.txs,
              notices: parsed.notices?.length ? parsed.notices : a.notices,
              favorites: parsed.favorites?.length ? parsed.favorites : a.favorites,
              lang: parsed.lang === "en" ? "en" : a.lang,
            }
          : a,
      );
    }
    return data;
  } catch {
    return defaultData();
  }
}

function loadSession(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEY);
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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlatformState>(() => ({
    ...loadData(),
    sessionId: loadSession(),
  }));

  useEffect(() => {
    const { sessionId, ...data } = state;
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    if (sessionId) sessionStorage.setItem(SESSION_KEY, sessionId);
    else sessionStorage.removeItem(SESSION_KEY);
  }, [state]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
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
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const api = useMemo<Store>(() => {
    const current = state.accounts.find((a) => a.id === state.sessionId) ?? null;

    const patchMe = (fn: (a: UserAccount) => UserAccount) => {
      if (!state.sessionId) return;
      const id = state.sessionId;
      setState((s) => ({ ...s, accounts: mapAcc(s.accounts, id, fn) }));
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
        setState((s) => ({
          ...s,
          lang,
          accounts: s.sessionId ? mapAcc(s.accounts, s.sessionId, (a) => ({ ...a, lang })) : s.accounts,
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
        const acc = account({
          id: uid("acc"),
          name: n,
          handle: h,
          phone: p,
          password,
          role: "user",
          status: "active",
          createdAt: new Date().toISOString(),
          lang: state.lang,
        });
        setState((s) => ({ ...s, accounts: [...s.accounts, acc], sessionId: acc.id }));
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
        setState((s) => ({
          ...s,
          tickets: s.tickets.map((tk) =>
            tk.id === ticketId
              ? { ...tk, unreadUser: who === "user" ? 0 : tk.unreadUser, unreadAgent: who === "agent" ? 0 : tk.unreadAgent }
              : tk,
          ),
        }));
      },
      pay,
      charge,
      sendTo,
      receiveFrom,
    };
  }, [state]);

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

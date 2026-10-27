import type { Lang, Ticket, UserAccount } from "./types";

export type PlatformPayload = {
  accounts: UserAccount[];
  tickets: Ticket[];
  lang?: Lang;
};

const DEMO_IDS = new Set(["acc_yuki", "acc_misaki", "acc_kenta"]);
const DEMO_HANDLES = new Set(["yuki.tanaka", "misaki_s", "kenta_s"]);

function stamp(a: UserAccount): string {
  return a.updatedAt || a.createdAt || "";
}

function newerAccount(a: UserAccount, b: UserAccount): UserAccount {
  const ta = stamp(a);
  const tb = stamp(b);
  if (tb > ta) return b;
  if (ta > tb) return a;
  const rank: Record<string, number> = { blocked: 3, frozen: 2, restricted: 1, active: 0 };
  return (rank[b.status] ?? 0) >= (rank[a.status] ?? 0) ? b : a;
}

function keepAccount(a: UserAccount): boolean {
  if (DEMO_IDS.has(a.id)) return false;
  if (a.role !== "admin" && DEMO_HANDLES.has(a.handle)) return false;
  return true;
}

export function mergeAccounts(left: UserAccount[], right: UserAccount[]): UserAccount[] {
  const byId = new Map<string, UserAccount>();
  for (const acc of [...left, ...right]) {
    if (!acc?.id || !keepAccount(acc)) continue;
    const prev = byId.get(acc.id);
    byId.set(acc.id, prev ? newerAccount(prev, acc) : acc);
  }
  const byHandle = new Map<string, UserAccount>();
  for (const acc of byId.values()) {
    const key = acc.handle.trim().toLowerCase();
    const prev = byHandle.get(key);
    if (!prev) {
      byHandle.set(key, acc);
      continue;
    }
    if (acc.role === "admin" && prev.role !== "admin") {
      byHandle.set(key, acc);
      continue;
    }
    if (prev.role === "admin" && acc.role !== "admin") continue;
    byHandle.set(key, newerAccount(prev, acc));
  }
  const list = [...byHandle.values()];
  if (!list.some((a) => a.role === "admin")) {
    const admin = [...left, ...right].find((a) => a.role === "admin");
    if (admin) list.unshift(admin);
  }
  return list;
}

export function mergeTickets(left: Ticket[], right: Ticket[]): Ticket[] {
  const byId = new Map<string, Ticket>();
  for (const tk of [...left, ...right]) {
    if (!tk?.id) continue;
    const prev = byId.get(tk.id);
    if (!prev) {
      byId.set(tk.id, tk);
      continue;
    }
    const newer = (tk.updatedAt || "") >= (prev.updatedAt || "") ? tk : prev;
    const older = newer === tk ? prev : tk;
    const msgs = new Map<string, Ticket["messages"][number]>();
    for (const m of [...older.messages, ...newer.messages]) msgs.set(m.id, m);
    byId.set(tk.id, {
      ...newer,
      messages: [...msgs.values()].sort((a, b) => a.at.localeCompare(b.at)),
    });
  }
  return [...byId.values()];
}

export function mergePlatform(local: PlatformPayload, remote: PlatformPayload): PlatformPayload {
  return {
    accounts: mergeAccounts(local.accounts || [], remote.accounts || []),
    tickets: mergeTickets(local.tickets || [], remote.tickets || []),
    lang: local.lang === "en" || local.lang === "ja" ? local.lang : remote.lang === "en" ? "en" : "ja",
  };
}

export function fingerprint(data: PlatformPayload): string {
  const accounts = (data.accounts || [])
    .map((a) => `${a.id}:${stamp(a)}:${a.status}:${a.handle}:${a.wallet?.money ?? 0}`)
    .sort()
    .join("|");
  const tickets = (data.tickets || [])
    .map((t) => `${t.id}:${t.updatedAt}:${t.status}:${t.messages.length}:${t.unreadAgent}:${t.unreadUser}`)
    .sort()
    .join("|");
  return `${accounts}#${tickets}`;
}

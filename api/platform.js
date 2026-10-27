import { get, put } from "@vercel/blob";

const PATH = "platform.json";
const DEMO_IDS = new Set(["acc_yuki", "acc_misaki", "acc_kenta"]);
const DEMO_HANDLES = new Set(["yuki.tanaka", "misaki_s", "kenta_s"]);
const empty = { accounts: [], tickets: [], lang: "ja" };

function stamp(a) {
  return a.updatedAt || a.createdAt || "";
}

function newerAccount(a, b) {
  const ta = stamp(a);
  const tb = stamp(b);
  if (tb > ta) return b;
  if (ta > tb) return a;
  const rank = { blocked: 3, frozen: 2, restricted: 1, active: 0 };
  return (rank[b.status] ?? 0) >= (rank[a.status] ?? 0) ? b : a;
}

function keepAccount(a) {
  if (!a?.id) return false;
  if (DEMO_IDS.has(a.id)) return false;
  if (a.role !== "admin" && DEMO_HANDLES.has(a.handle)) return false;
  return true;
}

function mergeAccounts(left, right) {
  const byId = new Map();
  for (const acc of [...left, ...right]) {
    if (!keepAccount(acc)) continue;
    const prev = byId.get(acc.id);
    byId.set(acc.id, prev ? newerAccount(prev, acc) : acc);
  }
  const byHandle = new Map();
  for (const acc of byId.values()) {
    const key = String(acc.handle || "")
      .trim()
      .toLowerCase();
    const prev = byHandle.get(key);
    if (!prev) byHandle.set(key, acc);
    else if (acc.role === "admin" && prev.role !== "admin") byHandle.set(key, acc);
    else if (prev.role === "admin" && acc.role !== "admin") continue;
    else byHandle.set(key, newerAccount(prev, acc));
  }
  const list = [...byHandle.values()];
  if (!list.some((a) => a.role === "admin")) {
    const admin = [...left, ...right].find((a) => a.role === "admin");
    if (admin) list.unshift(admin);
  }
  return list;
}

function mergeTickets(left, right) {
  const byId = new Map();
  for (const tk of [...left, ...right]) {
    if (!tk?.id) continue;
    const prev = byId.get(tk.id);
    if (!prev) {
      byId.set(tk.id, tk);
      continue;
    }
    const newer = (tk.updatedAt || "") >= (prev.updatedAt || "") ? tk : prev;
    const older = newer === tk ? prev : tk;
    const msgs = new Map();
    for (const m of [...(older.messages || []), ...(newer.messages || [])]) msgs.set(m.id, m);
    byId.set(tk.id, {
      ...newer,
      messages: [...msgs.values()].sort((a, b) => String(a.at).localeCompare(String(b.at))),
    });
  }
  return [...byId.values()];
}

function mergePlatform(local, remote) {
  return {
    accounts: mergeAccounts(local.accounts || [], remote.accounts || []),
    tickets: mergeTickets(local.tickets || [], remote.tickets || []),
    lang: local.lang === "en" || local.lang === "ja" ? local.lang : remote.lang === "en" ? "en" : "ja",
  };
}

async function readStore() {
  try {
    const result = await get(PATH, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return { data: empty, etag: null };
    const text = await new Response(result.stream).text();
    const parsed = JSON.parse(text);
    return {
      data: {
        accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
        tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [],
        lang: parsed.lang === "en" ? "en" : "ja",
      },
      etag: result.blob?.etag ?? null,
    };
  } catch {
    return { data: empty, etag: null };
  }
}

async function writeStore(data, etag) {
  await put(PATH, JSON.stringify(data), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
    ...(etag ? { ifMatch: etag } : {}),
  });
}

export async function handlePlatform(method, body) {
  if (method === "OPTIONS") return { status: 204, data: null };
  if (method === "GET" || method === "HEAD") {
    const { data } = await readStore();
    return { status: 200, data };
  }
  if (method === "PUT" || method === "POST") {
    if (!body || typeof body !== "object") return { status: 400, data: { error: "invalid" } };
    let lastError = null;
    for (let i = 0; i < 4; i++) {
      const { data: existing, etag } = await readStore();
      const merged = mergePlatform(existing, body);
      try {
        await writeStore(merged, etag);
        return { status: 200, data: merged };
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError ?? new Error("store");
  }
  return { status: 405, data: { error: "method" } };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  let body = null;
  if (req.method === "PUT" || req.method === "POST") {
    body = await new Promise((resolve, reject) => {
      let raw = "";
      req.on("data", (chunk) => {
        raw += chunk;
      });
      req.on("end", () => {
        try {
          resolve(raw ? JSON.parse(raw) : null);
        } catch (err) {
          reject(err);
        }
      });
      req.on("error", reject);
    });
  }
  try {
    const result = await handlePlatform(req.method, body);
    res.statusCode = result.status;
    if (result.data == null) {
      res.end();
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(result.data));
  } catch {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "store" }));
  }
}

export type Tab = "home" | "deals" | "miniapps" | "account";
export type Lang = "ja" | "en";

export type PayMethod = "balance" | "credit";

export type TxKind =
  | "pay"
  | "charge"
  | "send"
  | "receive"
  | "refund"
  | "points"
  | "bill"
  | "atm";

export type Overlay =
  | { type: "pay" }
  | { type: "scan" }
  | { type: "scanPay"; merchantId: string }
  | { type: "charge" }
  | { type: "send" }
  | { type: "sendAmount"; contactId: string }
  | { type: "receive" }
  | { type: "history" }
  | { type: "detail"; id: string }
  | { type: "all" }
  | { type: "nearby" }
  | { type: "card" }
  | { type: "bank" }
  | { type: "points" }
  | { type: "invest" }
  | { type: "bills" }
  | { type: "notifications" }
  | { type: "settings" }
  | { type: "step" }
  | { type: "support" }
  | { type: "supportNew" }
  | { type: "supportChat"; ticketId: string }
  | { type: "soon"; title: string }
  | { type: "success"; txId: string };

export type AccountStatus = "active" | "restricted" | "frozen" | "blocked";
export type Role = "user" | "admin";
export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketCategory = "restriction" | "payment" | "account" | "other";
export type ChatAuthor = "user" | "agent" | "system";

export type ChatMessage = {
  id: string;
  from: ChatAuthor;
  authorName: string;
  text: string;
  at: string;
};

export type Ticket = {
  id: string;
  number: string;
  accountId: string;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  unreadUser: number;
  unreadAgent: number;
  messages: ChatMessage[];
};

export type Transaction = {
  id: string;
  kind: TxKind;
  title: string;
  subtitle?: string;
  amount: number;
  pointsEarned: number;
  pointsUsed: number;
  method: PayMethod | "points";
  at: string;
  merchantId?: string;
  contactId?: string;
};

export type Merchant = {
  id: string;
  name: string;
  kana: string;
  category: string;
  color: string;
  emoji: string;
  distance: string;
  coupon?: string;
  stamp?: string;
  typical: number[];
};

export type Contact = {
  id: string;
  name: string;
  handle: string;
  color: string;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  at: string;
  unread: boolean;
};

export type Campaign = {
  id: string;
  title: string;
  subtitle: string;
  tone: "red" | "gold" | "navy" | "mint";
  badge?: string;
};

export type MiniApp = {
  id: string;
  name: string;
  color: string;
  glyph: string;
  group: string;
};

export type Wallet = {
  money: number;
  moneyLite: number;
  points: number;
  investedPoints: number;
  creditLimit: number;
  creditUsed: number;
  bankBalance: number;
  autoCharge: boolean;
  autoChargeAmount: number;
  usePoints: boolean;
  hideAmounts: boolean;
  method: PayMethod;
};

export type User = {
  name: string;
  handle: string;
  phone: string;
  verified: boolean;
  step: "グリーン" | "シルバー" | "ゴールド" | "プラチナ";
  stepProgress: number;
};

export type AppState = {
  user: User;
  wallet: Wallet;
  txs: Transaction[];
  notices: Notice[];
  favorites: string[];
  lang: Lang;
};

export type UserAccount = {
  id: string;
  name: string;
  handle: string;
  phone: string;
  password: string;
  role: Role;
  status: AccountStatus;
  freezeReason: string;
  createdAt: string;
  verified: boolean;
  step: User["step"];
  stepProgress: number;
  wallet: Wallet;
  txs: Transaction[];
  notices: Notice[];
  favorites: string[];
  lang: Lang;
};

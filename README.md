# PayPay clone

Unofficial **demo** of Japan’s PayPay super-app. No real payments, banks, or identity checks.

## Run

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). On a phone, the UI goes full screen; on desktop it sits in an iPhone-style frame.

## What you can try

- **Pay** — barcode / QR, switch PayPay Balance ↔ Credit, spend points
- **Scan** — pick a demo merchant, enter an amount, pay
- **Charge** from PayPay Bank
- **Send / receive** money with contacts
- **History**, bills, points, card, bank, nearby deals, PayPay Step
- Red **payment-complete** screen with the “ペイペイ” chime
- **Accounts** — sign up / log in (demo only)
- **Support chat** — ticket numbers, user vs PayPay Support bubbles
- **Admin console** (`#/admin`) — freeze, restrict, or block accounts and reply as support

Wallet and tickets are stored in `localStorage`. Open the user app and the admin console in two tabs to see freezes and chats sync live.

### Demo logins

| Role | ID | Password |
| --- | --- | --- |
| User | `yuki.tanaka` | `1234` |
| Frozen user | `misaki_s` | `1234` |
| Restricted user | `kenta_s` | `1234` |
| Support admin | `admin` | `admin1234` |

Reset demo wallet data from **アカウント → 設定**.

## Admin inbox

In **Inbox**, switch people with **Previous / Next person**, the dropdown, or the ticket list on the left. Keyboard: ← →. **Next unread** jumps to the next waiting message.

## Phone app (Add to Home Screen)

This is a PWA, not an App Store listing. After you host it on HTTPS:

- **iPhone:** Safari → Share → **Add to Home Screen**. The PayPay icon appears on the home screen.
- **Android:** Chrome menu → **Install app** / **Add to Home Screen**.

Do not submit this clone to the App Store or Google Play as PayPay.

## Hosting

This is a static Vite app. The easiest free hosts are **[Vercel](https://vercel.com)**, **[Netlify](https://www.netlify.com)**, or **[Cloudflare Pages](https://pages.cloudflare.com)**.

```bash
npm run build
```

Upload the `dist` folder, or connect the Git repo and set the build command to `npm run build` and the output to `dist`.

**Important:** accounts, chats, and freezes live in the browser’s `localStorage`. Hosting the UI does **not** share data between two phones. For live support across devices you need a backend later (Firebase or Supabase). Until then, open the user app and `#/admin` in two tabs on the same computer.

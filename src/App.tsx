import { useCallback, useEffect, useState } from "react";
import { PayPayMark } from "./icons";
import { Account, AllFeatures, MiniApps, NearbyScreen, NoticesScreen, SettingsScreen, StepScreen } from "./screens/More";
import { Deals } from "./screens/Deals";
import { BankScreen, BillsScreen, CardScreen, InvestScreen, PointsScreen } from "./screens/Finance";
import { DetailScreen, HistoryScreen } from "./screens/History";
import { Home } from "./screens/Home";
import { ChargeScreen, ReceiveScreen, SendAmountScreen, SendScreen } from "./screens/Money";
import { PayScreen, ScanPayScreen, ScanScreen } from "./screens/PayScan";
import { AuthScreen } from "./screens/Auth";
import { FrozenScreen, BlockedScreen } from "./screens/Frozen";
import { SupportChat, SupportHome, SupportNew } from "./screens/Support";
import { AdminApp } from "./screens/Admin";
import { InstallBanner } from "./Install";
import { trErr, useT } from "./i18n";
import { useStore } from "./store";
import type { Overlay, Tab } from "./types";
import { BottomNav, NavHead, StatusBar, Success, Toast } from "./ui";

function useBleed() {
  const [bleed, setBleed] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("pp-bleed"),
  );
  useEffect(() => {
    const apply = () => {
      const coarse = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
      const stand =
        window.matchMedia("(display-mode: standalone)").matches ||
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
      const on = window.innerWidth <= 1024 || coarse || stand;
      document.documentElement.classList.toggle("pp-bleed", on);
      setBleed(on);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);
  return bleed;
}

export default function Root() {
  const [hash, setHash] = useState(() => location.hash);
  useEffect(() => {
    const on = () => setHash(location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  if (hash.startsWith("#/admin")) return <AdminApp />;
  return <App />;
}

function App() {
  const store = useStore();
  const t = useT();
  const bleed = useBleed();
  const [tab, setTab] = useState<Tab>("home");
  const [stack, setStack] = useState<Overlay[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    document.documentElement.lang = store.lang;
  }, [store.lang]);

  useEffect(() => {
    const id = setTimeout(() => setSplash(false), 1700);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (store.isAdmin) location.hash = "#/admin";
  }, [store.isAdmin]);

  const push = useCallback((o: Overlay) => setStack((st) => [...st, o]), []);
  const pop = useCallback(() => setStack((st) => st.slice(0, -1)), []);
  const closeAll = useCallback(() => setStack([]), []);
  const showToast = useCallback((msg: string) => setToast(msg), []);
  const onPaid = useCallback((txId: string) => {
    setStack((st) => [...st, { type: "success", txId }]);
  }, []);

  const onTab = (next: Tab) => {
    setTab(next);
    setStack([]);
  };

  const moneyPush = useCallback(
    (o: Overlay) => {
      if (store.status !== "active") {
        showToast(trErr(store.lang, store.status === "frozen" ? "errFrozen" : "errRestricted"));
        push({ type: "support" });
        return;
      }
      push(o);
    },
    [push, showToast, store.lang, store.status],
  );

  const top = stack[stack.length - 1];
  const hideNav = Boolean(top) || !store.sessionId || store.status === "frozen" || store.status === "blocked";
  const lightStatus = top?.type === "scan" || top?.type === "success" || splash;
  const supportOpen = stack.some((s) => s.type === "support" || s.type === "supportNew" || s.type === "supportChat");
  const loggedOut = !store.sessionId;

  return (
    <div className={`stage${bleed ? " bleed" : ""}`}>
      <div className={`device${bleed ? " bleed" : ""}`}>
        {!bleed && <div className="island" />}
        {!bleed && <StatusBar light={lightStatus} />}
        <div className="app">
          {loggedOut ? (
            !splash && <AuthScreen />
          ) : store.status === "blocked" ? (
            <BlockedScreen />
          ) : (
            <>
              {tab === "home" && <Home push={push} />}
              {tab === "deals" && <Deals push={push} />}
              {tab === "miniapps" && <MiniApps push={push} />}
              {tab === "account" && <Account push={push} />}
              {!hideNav && <BottomNav tab={tab} onTab={onTab} onPay={() => moneyPush({ type: "pay" })} />}

              {stack.map((o, i) => (
                <OverlayView
                  key={`${o.type}-${i}`}
                  o={o}
                  push={push}
                  pop={pop}
                  closeAll={closeAll}
                  onPaid={onPaid}
                  toast={showToast}
                />
              ))}

              {store.status === "frozen" && !supportOpen && (
                <FrozenScreen onContact={() => push({ type: "support" })} />
              )}
            </>
          )}

          {!splash && !loggedOut && store.status !== "frozen" && store.status !== "blocked" && <InstallBanner />}
          {toast && <Toast text={toast} />}
          {splash && (
            <div className="splash">
              <div className="splash-mark">
                <PayPayMark size={96} stacked color="#fff" />
                <div className="splash-sub">{t("splash")}</div>
              </div>
            </div>
          )}
        </div>
        {!bleed && <div className="home-indicator" />}
      </div>
    </div>
  );
}

function OverlayView({
  o,
  push,
  pop,
  closeAll,
  onPaid,
  toast,
}: {
  o: Overlay;
  push: (o: Overlay) => void;
  pop: () => void;
  closeAll: () => void;
  onPaid: (id: string) => void;
  toast: (msg: string) => void;
}) {
  const s = useStore();
  switch (o.type) {
    case "pay":
      return <PayScreen push={push} pop={pop} toast={toast} />;
    case "scan":
      return <ScanScreen push={push} pop={pop} />;
    case "scanPay":
      return <ScanPayScreen merchantId={o.merchantId} pop={pop} onPaid={onPaid} toast={toast} />;
    case "charge":
      return <ChargeScreen pop={pop} onPaid={onPaid} toast={toast} />;
    case "send":
      return <SendScreen push={push} pop={pop} />;
    case "sendAmount":
      return <SendAmountScreen contactId={o.contactId} pop={pop} onPaid={onPaid} toast={toast} />;
    case "receive":
      return <ReceiveScreen pop={pop} toast={toast} />;
    case "history":
      return <HistoryScreen push={push} pop={pop} />;
    case "detail":
      return <DetailScreen id={o.id} pop={pop} />;
    case "all":
      return <AllFeatures push={push} pop={pop} />;
    case "nearby":
      return <NearbyScreen push={push} pop={pop} />;
    case "card":
      return <CardScreen pop={pop} push={push} />;
    case "bank":
      return <BankScreen pop={pop} push={push} />;
    case "points":
      return <PointsScreen pop={pop} push={push} />;
    case "invest":
      return <InvestScreen pop={pop} />;
    case "bills":
      return <BillsScreen pop={pop} onPaid={onPaid} toast={toast} />;
    case "notifications":
      return <NoticesScreen pop={pop} />;
    case "settings":
      return <SettingsScreen pop={pop} toast={toast} />;
    case "step":
      return <StepScreen pop={pop} />;
    case "support":
      return <SupportHome push={push} pop={pop} />;
    case "supportNew":
      return <SupportNew push={push} pop={pop} />;
    case "supportChat":
      return <SupportChat ticketId={o.ticketId} pop={pop} perspective="user" />;
    case "soon":
      return <SoonScreen title={o.title} pop={pop} />;
    case "success": {
      const tx = s.txs.find((x) => x.id === o.txId);
      if (!tx) return null;
      return <Success tx={tx} onClose={closeAll} />;
    }
    default:
      return null;
  }
}

function SoonScreen({ title, pop }: { title: string; pop: () => void }) {
  const t = useT();
  return (
    <div className="screen">
      <NavHead title={title} onBack={pop} />
      <div className="empty">
        {t("soonPreview", { title })}
        <div className="pad" style={{ marginTop: 12 }}>
          <button className="btn outline" type="button" onClick={pop}>
            {t("back")}
          </button>
        </div>
      </div>
    </div>
  );
}

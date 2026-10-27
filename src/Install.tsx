import { useEffect, useState } from "react";
import { PayPayMark } from "./icons";
import { useT } from "./i18n";

type BIP = Event & { prompt: () => Promise<void> };

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallBanner() {
  const t = useT();
  const [show, setShow] = useState(false);
  const [deferred, setDeferred] = useState<BIP | null>(null);
  const ios = isIos();

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem("pp-install-dismiss")) return;
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIP);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    if (ios) setShow(true);
    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, [ios]);

  if (!show || isStandalone()) return null;

  const dismiss = () => {
    localStorage.setItem("pp-install-dismiss", "1");
    setShow(false);
  };

  const install = async () => {
    if (deferred) {
      await deferred.prompt();
      setShow(false);
      return;
    }
  };

  return (
    <div className="install-banner">
      <div className="install-mark">
        <PayPayMark size={28} stacked color="#fff" />
      </div>
      <div className="install-copy">
        <strong>{t("installApp")}</strong>
        <span>{deferred ? t("installAndroid") : ios ? t("installIos") : t("installAndroid")}</span>
      </div>
      {deferred && (
        <button className="install-go" type="button" onClick={install}>
          {t("installApp")}
        </button>
      )}
      <button className="install-skip" type="button" onClick={dismiss}>
        {t("installDismiss")}
      </button>
    </div>
  );
}

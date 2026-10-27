import { ILock } from "../icons";
import { useT } from "../i18n";
import { useStore } from "../store";

export function FrozenScreen({ onContact }: { onContact: () => void }) {
  const s = useStore();
  const t = useT();
  return (
    <div className="freeze">
      <div className="freeze-mark">
        <ILock size={36} color="#FF0033" />
      </div>
      <h1>{t("freezeTitle")}</h1>
      <p>{t("freezeBody")}</p>
      {s.freezeReason && (
        <div className="freeze-reason">
          <span>{t("freezeReasonLabel")}</span>
          {s.freezeReason}
        </div>
      )}
      <button className="btn primary" type="button" onClick={onContact}>
        {t("freezeContact")}
      </button>
      <button className="freeze-out" type="button" onClick={() => s.logout()}>
        {t("logout")}
      </button>
    </div>
  );
}

export function RestrictedBanner({ onContact }: { onContact: () => void }) {
  const t = useT();
  return (
    <button className="restrict-banner" type="button" onClick={onContact}>
      <strong>{t("restrictBanner")}</strong>
      <span>{t("restrictBody")}</span>
    </button>
  );
}

export function BlockedScreen() {
  const s = useStore();
  const t = useT();
  return (
    <div className="freeze">
      <div className="freeze-mark">
        <ILock size={36} color="#FF0033" />
      </div>
      <h1>{t("blockedTitle")}</h1>
      <p>{t("blockedBody")}</p>
      <button className="btn primary" type="button" onClick={() => s.logout()}>
        {t("logout")}
      </button>
    </div>
  );
}

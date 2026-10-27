import { useState } from "react";
import { PayPayMark } from "../icons";
import { trErr, useT } from "../i18n";
import { useStore } from "../store";

export function AuthScreen() {
  const s = useStore();
  const t = useT();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      const res = s.login(id, password);
      if (!res.ok) {
        setError(trErr(s.lang, res.reason));
        return;
      }
      if (res.role === "admin") location.hash = "#/admin";
      return;
    }
    const res = s.register({ name, handle, phone, password });
    if (!res.ok) setError(trErr(s.lang, res.reason));
  };

  return (
    <div className="auth">
      <div className="auth-hero">
        <PayPayMark size={72} stacked color="#fff" />
        <p>{t("splash")}</p>
      </div>
      <form className="auth-card" onSubmit={submit}>
        <h1>{mode === "login" ? t("login") : t("createAccount")}</h1>
        {mode === "register" && (
          <>
            <label>
              {t("name")}
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
            <label>
              {t("paypayId")}
              <input value={handle} onChange={(e) => setHandle(e.target.value)} autoComplete="username" />
            </label>
            <label>
              {t("phone")}
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" />
            </label>
          </>
        )}
        {mode === "login" && (
          <label>
            {t("phoneOrId")}
            <input value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" />
          </label>
        )}
        <label>
          {t("password")}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </label>
        {error && <div className="auth-error">{error}</div>}
        <button className="btn primary" type="submit">
          {mode === "login" ? t("loginBtn") : t("registerBtn")}
        </button>
        <button
          className="auth-switch"
          type="button"
          onClick={() => {
            setError("");
            setMode(mode === "login" ? "register" : "login");
          }}
        >
          {mode === "login" ? `${t("noAccount")} ${t("createAccount")}` : `${t("alreadyHave")} ${t("login")}`}
        </button>
        <div className="auth-lang">
          <button type="button" className={s.lang === "ja" ? "on" : ""} onClick={() => s.setLang("ja")}>
            {t("langJa")}
          </button>
          <button type="button" className={s.lang === "en" ? "on" : ""} onClick={() => s.setLang("en")}>
            {t("langEn")}
          </button>
        </div>
      </form>
      <div className="auth-demo">
        <button className="auth-admin" type="button" onClick={() => (location.hash = "#/admin")}>
          {t("adminConsole")} →
        </button>
      </div>
    </div>
  );
}

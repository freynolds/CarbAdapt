"use client";

import { translate, type Locale, type MessageKey } from "@carbadapt/i18n";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const ATHLETES = ["ana", "bruno", "carla", "eli", "dani"] as const;
const LOCALES: Locale[] = ["EN_US", "ES", "PT"];

type Health = { ok: boolean; service: string; phase: string };
type HomePayload = {
  user: { name: string | null; mode: string | null; email: string | null };
  hero: { name: string; target?: never; fuelingPlan: { targetGPerH: number | null } | null } | null;
  sweatTest: { status: string; scheduledFor: string | null } | null;
  todos: { id: string; type: string; payload: { titleKey?: string } | null }[];
  counts: { openTodos: number };
};

export default function HealthPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [locale, setLocale] = useState<Locale>("EN_US");
  const [health, setHealth] = useState<Health | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [athlete, setAthlete] = useState<(typeof ATHLETES)[number]>("ana");
  const [token, setToken] = useState<string | null>(null);
  const [home, setHome] = useState<HomePayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = (key: MessageKey) => translate(locale, key);

  useEffect(() => {
    const stored = window.localStorage.getItem("carbadapt-theme");
    const next = stored === "dark" || stored === "light" ? stored : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/health`)
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        return (await response.json()) as Health;
      })
      .then((body) => {
        if (!cancelled) setHealth(body);
      })
      .catch(() => {
        if (!cancelled) setHealthError("down");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function chooseTheme(next: "light" | "dark") {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("carbadapt-theme", next);
  }

  async function signIn() {
    setBusy(true);
    setError(null);
    try {
      const login = await fetch(`${API}/dev/login-as`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ athlete }),
      });
      if (!login.ok) throw new Error(`login ${login.status}`);
      const session = (await login.json()) as { token: string };
      setToken(session.token);
      const homeResponse = await fetch(`${API}/home`, {
        headers: { authorization: `Bearer ${session.token}` },
      });
      if (!homeResponse.ok) throw new Error(`home ${homeResponse.status}`);
      setHome((await homeResponse.json()) as HomePayload);
    } catch (cause) {
      setHome(null);
      setError(cause instanceof Error ? cause.message : "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
      <header>
        <p className="font-mono text-sm uppercase tracking-widest text-ember">{t("health.title")}</p>
        <h1 className="font-display text-5xl text-ink">{t("app.name")}</h1>
        <p className="mt-2 text-lg text-muted">{t("app.tagline")}</p>
      </header>

      <section className="rounded-2xl border border-tarmac/20 bg-card p-6">
        <h2 className="font-display text-2xl">{t("health.api")}</h2>
        <p className="mt-3 font-mono text-lg">
          {health ? t("health.ok") : healthError ? t("health.down") : "…"}{" "}
          <span className="text-muted">{health ? `${health.service} · ${t("health.phase")} ${health.phase}` : API}</span>
        </p>
      </section>

      <section className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-full bg-night px-4 py-2 font-mono text-sm text-bone data-[on=true]:bg-glucose data-[on=true]:text-night"
          data-on={theme === "light"}
          onClick={() => chooseTheme("light")}
        >
          {t("theme.light")}
        </button>
        <button
          type="button"
          className="rounded-full bg-night px-4 py-2 font-mono text-sm text-bone data-[on=true]:bg-glucose data-[on=true]:text-night"
          data-on={theme === "dark"}
          onClick={() => chooseTheme("dark")}
        >
          {t("theme.dark")}
        </button>
        <label className="flex items-center gap-2 font-mono text-sm">
          {t("locale.label")}
          <select
            className="rounded-md border border-tarmac/30 bg-card px-2 py-2 text-ink"
            value={locale}
            onChange={(event) => setLocale(event.target.value as Locale)}
          >
            {LOCALES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="rounded-2xl border border-glucose bg-tarmac p-6 text-bone">
        <h2 className="font-display text-2xl text-glucose">{t("athlete.label")}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {ATHLETES.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-md border border-glucose/40 px-3 py-2 font-mono capitalize data-[on=true]:bg-glucose data-[on=true]:text-night"
              data-on={athlete === item}
              onClick={() => setAthlete(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="mt-4 rounded-full bg-ember px-5 py-2 font-mono text-bone disabled:opacity-60"
          disabled={busy}
          onClick={() => void signIn()}
        >
          {t("athlete.signIn")}
        </button>
        {token ? <p className="mt-3 font-mono text-sm text-glucose">{t("athlete.signedIn")}</p> : null}
        {error ? <p className="mt-3 font-mono text-sm text-ember">{error}</p> : null}
      </section>

      {home ? (
        <section className="rounded-2xl bg-card p-6">
          <h2 className="font-display text-2xl">{t("home.title")}</h2>
          <dl className="mt-4 grid gap-3 font-mono text-sm">
            <div>
              <dt className="text-muted">{home.user.name}</dt>
              <dd>{home.user.email}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("home.mode")}</dt>
              <dd>{home.user.mode ?? t("home.mode.none")}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("home.hero")}</dt>
              <dd>
                {home.hero
                  ? `${home.hero.name} · ${home.hero.fuelingPlan?.targetGPerH ?? "—"} g/h`
                  : t("home.hero.none")}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t("home.sweat")}</dt>
              <dd>{home.sweatTest ? `${home.sweatTest.status} · ${home.sweatTest.scheduledFor}` : t("home.sweat.none")}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("home.todos")}</dt>
              <dd>{home.counts.openTodos}</dd>
            </div>
          </dl>
          <ul className="mt-4 list-disc pl-5">
            {home.todos.map((todo) => (
              <li key={todo.id}>{t((todo.payload?.titleKey ?? `todo.${todo.type}`) as MessageKey)}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-sm text-muted">{t("shell.note")}</p>
    </main>
  );
}

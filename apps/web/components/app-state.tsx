"use client";

import {
  localeFromUser,
  TRANSLATION_STATUS,
  translate,
  type Locale,
  type MessageId,
} from "@carbadapt/i18n";
import { HttpErrorCode, type MeResponse } from "@carbadapt/contracts";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";
import { ApiError, apiSend } from "@/lib/api";
import { parseAthletes, parseDeleted, parseLogin, parseMe } from "@/lib/parse";

const claimedSchema = z.object({ claimed: z.literal(true) }).strict();
const ANON_KEY = "carbadapt.anon";

const TOKEN_KEY = "carbadapt.token";
const ATHLETE_KEY = "carbadapt.athlete";
const LOCALE_KEY = "carbadapt.locale";
const THEME_KEY = "carbadapt.theme";

export type ThemeChoice = "system" | "light" | "dark";

type Athlete = {
  athleteId: string;
  name: string | null;
  email: string | null;
  mode: "FUEL_MY_WORKOUTS" | "GUT_TRAINING" | null;
};

type Load<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; code: HttpErrorCode };

type AppContextValue = {
  ready: boolean;
  token: string | null;
  athleteId: string | null;
  athletes: Athlete[];
  me: MeResponse | null;
  locale: Locale;
  theme: ThemeChoice;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeChoice) => void;
  login: (athleteId: string) => Promise<void>;
  acceptSession: (token: string, userId: string) => Promise<void>;
  logout: () => void;
  t: (id: MessageId, vars?: Record<string, string | number>) => string;
};

const AppContext = createContext<AppContextValue | null>(null);

function readTheme(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function readLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(LOCALE_KEY);
  if (stored === "en" || stored === "es" || stored === "pt") return stored;
  return null;
}

function applyTheme(theme: ThemeChoice) {
  document.documentElement.dataset.theme = theme;
}

export function AppState({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [athleteId, setAthleteId] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [locale, setLocaleState] = useState<Locale>("en");
  const [theme, setThemeState] = useState<ThemeChoice>("system");

  useEffect(() => {
    const storedTheme = readTheme();
    const storedLocale = readLocale();
    setThemeState(storedTheme);
    applyTheme(storedTheme);
    if (storedLocale) setLocaleState(storedLocale);
    document.documentElement.lang = storedLocale ?? "en";
    setToken(window.localStorage.getItem(TOKEN_KEY));
    setAthleteId(window.localStorage.getItem(ATHLETE_KEY));
    setReady(true);
    apiSend("/dev/athletes", { parse: parseAthletes })
      .then((body) => setAthletes(body.athletes))
      .catch(() => setAthletes([]));
  }, []);

  useEffect(() => {
    if (!token) {
      setMe(null);
      return;
    }
    let cancel = false;
    apiSend("/me", { token, parse: parseMe })
      .then((body) => {
        if (cancel) return;
        setMe(body);
        if (!window.localStorage.getItem(LOCALE_KEY))
          setLocaleState(localeFromUser(body.user.locale));
        if (!window.localStorage.getItem(THEME_KEY)) {
          const next =
            body.user.theme === "LIGHT" ? "light" : body.user.theme === "DARK" ? "dark" : "system";
          setThemeState(next);
          applyTheme(next);
        }
      })
      .catch((error: unknown) => {
        if (cancel) return;
        if (
          error instanceof ApiError &&
          (error.code === HttpErrorCode.Unauthorized || error.code === HttpErrorCode.SessionExpired)
        ) {
          window.localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setMe(null);
        }
      });
    return () => {
      cancel = true;
    };
  }, [token]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next);
    window.localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }, []);

  const acceptSession = useCallback(async (nextToken: string, nextUserId: string) => {
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    window.localStorage.setItem(ATHLETE_KEY, nextUserId);
    setToken(nextToken);
    setAthleteId(nextUserId);
    const draft = window.sessionStorage.getItem(ANON_KEY);
    if (!draft) return;
    try {
      await apiSend("/onboarding/claim", {
        method: "POST",
        token: nextToken,
        body: { anonId: draft },
        parse: (value) => claimedSchema.parse(value),
      });
    } catch (error: unknown) {
      if (!(error instanceof ApiError) || error.code !== HttpErrorCode.NotFound) return;
    }
  }, []);

  const login = useCallback(
    async (nextAthleteId: string) => {
      const body = await apiSend("/dev/login-as", {
        method: "POST",
        body: { athleteId: nextAthleteId },
        parse: parseLogin,
      });
      if (!window.localStorage.getItem(LOCALE_KEY))
        setLocaleState(localeFromUser(body.user.locale));
      await acceptSession(body.token, body.user.id);
    },
    [acceptSession],
  );

  const logout = useCallback(() => {
    const current = window.localStorage.getItem(TOKEN_KEY);
    if (current) {
      void apiSend("/auth/logout", { method: "POST", token: current, parse: parseDeleted }).catch(
        () => undefined,
      );
    }
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(ATHLETE_KEY);
    setToken(null);
    setAthleteId(null);
    setMe(null);
  }, []);

  const t = useCallback(
    (id: MessageId, vars?: Record<string, string | number>) => translate(locale, id, vars),
    [locale],
  );

  const value = useMemo(
    () => ({
      ready,
      token,
      athleteId,
      athletes,
      me,
      locale,
      theme,
      setLocale,
      setTheme,
      login,
      acceptSession,
      logout,
      t,
    }),
    [
      ready,
      token,
      athleteId,
      athletes,
      me,
      locale,
      theme,
      setLocale,
      setTheme,
      login,
      acceptSession,
      logout,
      t,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error("AppState is missing");
  return value;
}

export function useGet<T>(path: string | null, parse: (value: unknown) => T): Load<T> {
  const { token } = useApp();
  const [state, setState] = useState<Load<T>>({ status: "loading" });

  useEffect(() => {
    if (!path) {
      setState({ status: "idle" });
      return;
    }
    const open = path.startsWith("/dev/") || path.startsWith("/foods");
    if (!token && !open) {
      setState({ status: "idle" });
      return;
    }
    let cancel = false;
    setState({ status: "loading" });
    apiSend(path, { token, parse })
      .then((data) => {
        if (!cancel) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (cancel) return;
        const code = error instanceof ApiError ? error.code : HttpErrorCode.InternalError;
        setState({ status: "error", code });
      });
    return () => {
      cancel = true;
    };
  }, [path, token, parse]);

  return state;
}

export function DevBar() {
  const { athletes, athleteId, locale, theme, setLocale, setTheme, login, t } = useApp();
  return (
    <div className="devbar">
      <label>
        {t("common.athlete")}
        <select
          value={athleteId ?? ""}
          onChange={(event) => {
            if (event.target.value) void login(event.target.value);
          }}
        >
          <option value="">{t("common.athlete")}</option>
          {athletes.map((athlete) => (
            <option key={athlete.athleteId} value={athlete.athleteId}>
              {athlete.name ?? athlete.athleteId}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t("common.language")}
        <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
          <option value="en">EN</option>
          <option value="es">ES</option>
          <option value="pt">PT</option>
        </select>
      </label>
      <label>
        {t("common.theme")}
        <select value={theme} onChange={(event) => setTheme(event.target.value as ThemeChoice)}>
          <option value="system">{t("common.system")}</option>
          <option value="light">{t("common.light")}</option>
          <option value="dark">{t("common.dark")}</option>
        </select>
      </label>
      {TRANSLATION_STATUS[locale] === "draft" ? <span>{t("common.draft")}</span> : null}
      <p>{t("common.column")}</p>
    </div>
  );
}

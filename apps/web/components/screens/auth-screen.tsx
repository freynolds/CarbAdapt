"use client";

import { DataProvider, HttpErrorCode } from "@carbadapt/contracts";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/components/app-state";
import { BigStats, ErrorText, Preview, Screen } from "@/components/ui";
import { ApiError, apiSend } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { readAnswers, roughCarbsPerHour } from "@/lib/onboarding";
import { parseMagicSent, parseSession } from "@/lib/parse";

export function SignupScreen() {
  const { t, athletes, athleteId, login } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function enter() {
    const id = athleteId ?? athletes[0]?.athleteId;
    if (!id) return;
    setBusy(true);
    try {
      await login(id);
      router.push("/onboarding/briefing");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen kicker={t("auth.kicker")} title={t("auth.sign")} back="/onboarding/mode">
      <Preview />
      <p className="note">
        <b>{t("auth.whyNo")}</b>
        {t("auth.whyNoHelp")}
      </p>
      <button type="button" className="bt" disabled={busy} onClick={() => void enter()}>
        {t("auth.garmin")}
      </button>
      <button type="button" className="gh" disabled={busy} onClick={() => void enter()}>
        {t("auth.strava")}
      </button>
      <button type="button" className="gh" disabled={busy} onClick={() => void enter()}>
        {t("auth.tp")}
      </button>
      <p className="mu">{t("auth.tpHelp")}</p>
      <p className="note">
        <b>{t("on.why")}</b>
        {t("auth.whyBody")}
      </p>
      <Link href="/auth/magic">{t("auth.magic")}</Link>
      <Link href="/login">{t("auth.login")}</Link>
    </Screen>
  );
}

export function LoginScreen() {
  const { t, athletes, athleteId, login } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function enter() {
    const id = athleteId ?? athletes[0]?.athleteId;
    if (!id) return;
    setBusy(true);
    try {
      await login(id);
      router.push("/home");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen kicker={t("auth.login")} title={t("auth.sign")} back="/onboarding/welcome">
      <Preview />
      <p className="mu">{t("auth.whyNoHelp")}</p>
      <button type="button" className="bt" disabled={busy} onClick={() => void enter()}>
        {t("auth.garmin")}
      </button>
      <button type="button" className="gh" disabled={busy} onClick={() => void enter()}>
        {t("auth.strava")}
      </button>
      <Link href="/auth/magic">{t("auth.magic")}</Link>
      <Link href="/signup">{t("on.start")}</Link>
    </Screen>
  );
}

export function MagicScreen() {
  const { t, acceptSession } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<HttpErrorCode | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancel = false;
    setBusy(true);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    apiSend("/auth/magic-link/verify", {
      method: "POST",
      body: { token, timezone },
      parse: parseSession,
    })
      .then(async (body) => {
        if (cancel) return;
        await acceptSession(body.token, body.user.id);
        router.push("/home");
      })
      .catch((caught: unknown) => {
        if (cancel) return;
        setError(caught instanceof ApiError ? caught.code : HttpErrorCode.InternalError);
        setBusy(false);
      });
    return () => {
      cancel = true;
    };
  }, [token, acceptSession, router]);

  async function send() {
    setBusy(true);
    setError(null);
    try {
      await apiSend("/auth/magic-link", {
        method: "POST",
        body: { email },
        parse: parseMagicSent,
      });
      setSent(true);
    } catch (caught: unknown) {
      setError(caught instanceof ApiError ? caught.code : HttpErrorCode.InternalError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen kicker={t("auth.magic")} title={t("auth.magic")} back="/login">
      <Preview />
      <p className="mu">{t("auth.magicHelp")}</p>
      {error ? <ErrorText code={error} /> : null}
      <label className="field">
        <span>{t("acct.email")}</span>
        <input value={email} type="email" onChange={(event) => setEmail(event.target.value)} />
      </label>
      <button type="button" className="bt" disabled={busy} onClick={() => void send()}>
        {t("auth.send")}
      </button>
      {sent ? <p className="note">{t("auth.sent")}</p> : null}
    </Screen>
  );
}

export function CallbackScreen({ provider }: { provider: string }) {
  const { t } = useApp();
  const name =
    provider.toUpperCase() === DataProvider.Garmin
      ? t("conn.GARMIN")
      : provider.toUpperCase() === DataProvider.Strava
        ? t("conn.STRAVA")
        : provider.toUpperCase() === DataProvider.TrainingPeaks
          ? t("conn.TRAININGPEAKS")
          : provider;
  return (
    <Screen kicker={name} title={t("auth.login")} back="/login">
      <Preview />
      <p>{t("auth.callback")}</p>
      <Link href="/login" className="bt">
        {t("auth.login")}
      </Link>
    </Screen>
  );
}

export function ReportScreen() {
  const { t, locale } = useApp();
  const [ready, setReady] = useState(false);
  const answers = readAnswers();
  useEffect(() => {
    setReady(true);
  }, []);
  const shown = ready ? answers : readAnswers();
  const gh = roughCarbsPerHour(shown);
  const ghLabel = gh == null ? "—" : formatNumber(gh, locale);
  const fuel = shown.mode === "FUEL_MY_WORKOUTS";
  return (
    <Screen kicker={t("rep.kicker")} title={t("rep.title")}>
      <Preview />
      <p className="mu">{t("rep.from")}</p>
      <p className="ey">{t("rep.week")}</p>
      <BigStats
        items={[
          { value: shown.hours || "—", label: t("rep.hours") },
          { value: t("common.notSet"), label: t("rep.kcal") },
          { value: gh == null ? t("common.notSet") : ghLabel, label: t("rep.carbs") },
        ]}
      />
      <p className="ey">{t("rep.vs")}</p>
      <div className="bg">
        <div>
          <b>{ghLabel}</b>
          <span>{t("rep.you")}</span>
        </div>
        <div>
          <b>{t("common.notSet")}</b>
          <span>{t("rep.recommended")}</span>
        </div>
      </div>
      {fuel ? (
        <>
          <p className="ey">{t("rep.fuel")}</p>
          <p>
            {ghLabel} {t("rep.perHour")}
          </p>
          <p className="mu">{t("rep.rest")}</p>
          <p className="mu">{t("rep.brief")}</p>
        </>
      ) : (
        <>
          <p className="ey">{t("rep.gut")}</p>
          <BigStats
            items={[
              { value: ghLabel, label: t("rep.now") },
              { value: t("common.notSet"), label: t("rep.target") },
            ]}
          />
          <p className="mu">{t("rep.gap", { gap: t("common.notSet") })}</p>
        </>
      )}
      <Link href="/home" className="bt">
        {fuel ? t("rep.open") : t("rep.next")}
      </Link>
    </Screen>
  );
}

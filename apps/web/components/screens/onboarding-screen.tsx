"use client";

import type { MessageId } from "@carbadapt/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/components/app-state";
import { Mark } from "@/components/icons";
import { Preview, QuestionDots, Screen } from "@/components/ui";
import { formatNumber } from "@/lib/format";
import {
  readAnswers,
  roughCarbsPerHour,
  saveAnswers,
  type OnboardingAnswers,
} from "@/lib/onboarding";

const SPORTS = [
  ["cycling", "on.cycling"],
  ["running", "on.running"],
  ["tri", "on.tri"],
] as const;

const FUELS = [
  ["gels", "on.gels"],
  ["drinks", "on.drinks"],
  ["fruit", "on.fruit"],
  ["syrup", "on.syrup"],
  ["solid", "on.solid"],
  ["salt", "on.salt"],
  ["caffeine", "on.caffeine"],
] as const;

const GUT = [
  ["bloat", "on.bloat"],
  ["nausea", "on.nausea"],
  ["cramps", "on.cramps"],
  ["reflux", "on.reflux"],
  ["diarrhea", "on.diarrhea"],
] as const;

function useDraft() {
  const [answers, setAnswers] = useState<OnboardingAnswers>(() => readAnswers());
  useEffect(() => {
    setAnswers(readAnswers());
  }, []);
  function patch(next: Partial<OnboardingAnswers>) {
    setAnswers(saveAnswers(next));
  }
  return { answers, patch };
}

export function OnboardingScreen({ step }: { step: string }) {
  switch (step) {
    case "welcome":
      return <WelcomeStep />;
    case "sport":
      return <SportStep />;
    case "weight":
      return <WeightStep />;
    case "effort":
      return <EffortStep />;
    case "carbs":
      return <CarbsStep />;
    case "fuel":
      return <FuelStep />;
    case "sweat":
      return <SweatStep />;
    case "gut":
      return <GutStep />;
    case "briefing":
      return <BriefingStep />;
    case "device":
      return <DeviceStep />;
    default:
      return <UnknownStep />;
  }
}

export function ModeScreen() {
  const { t } = useApp();
  const router = useRouter();
  return (
    <Screen title={t("mode.how")} back="/onboarding/gut">
      <div className="modes">
        <button
          type="button"
          className="mode-card gut"
          onClick={() => {
            saveAnswers({ mode: "GUT_TRAINING" });
            router.push("/signup");
          }}
        >
          <span className="ey">{t("mode.GUT_TRAINING")}</span>
          <b className="h2">{t("mode.GUT_TRAINING")}</b>
          <span>{t("mode.gutCard")}</span>
        </button>
        <button
          type="button"
          className="mode-card fuel"
          onClick={() => {
            saveAnswers({ mode: "FUEL_MY_WORKOUTS" });
            router.push("/signup");
          }}
        >
          <span className="ey">{t("mode.FUEL_MY_WORKOUTS")}</span>
          <b className="h2">{t("mode.FUEL_MY_WORKOUTS")}</b>
          <span>{t("mode.fuelCard")}</span>
        </button>
      </div>
    </Screen>
  );
}

function WelcomeStep() {
  const { t } = useApp();
  return (
    <Screen kicker={t("on.kicker")} title={t("on.title")}>
      <Mark />
      <p>{t("on.lead")}</p>
      <p className="big">
        90<span style={{ fontSize: 18 }}> {t("on.goal")}</span>
      </p>
      <Link href="/onboarding/sport" className="bt">
        {t("on.start")}
      </Link>
      <Link href="/login" className="gh">
        {t("auth.login")}
      </Link>
    </Screen>
  );
}

function SportStep() {
  const { t } = useApp();
  const { answers, patch } = useDraft();
  return (
    <Screen
      lead={<QuestionDots filled={1} />}
      kicker={t("on.step", { n: 1 })}
      title={t("on.q1")}
      back="/onboarding/welcome"
    >
      <div className="wrap">
        {SPORTS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={answers.sport === id ? "pill sel" : "pill"}
            onClick={() => patch({ sport: id })}
          >
            {t(label)}
          </button>
        ))}
      </div>
      <div className="wrap">
        <button
          type="button"
          className={answers.goal === "race" ? "pill sel" : "pill"}
          onClick={() => patch({ goal: "race" })}
        >
          {t("on.race")}
        </button>
        <button
          type="button"
          className={answers.goal === "general" ? "pill sel" : "pill"}
          onClick={() => patch({ goal: "general" })}
        >
          {t("on.general")}
        </button>
      </div>
      {answers.goal === "race" ? (
        <>
          <label className="field">
            <span>{t("on.raceDate")}</span>
            <input
              type="date"
              value={answers.raceDate}
              onChange={(event) => patch({ raceDate: event.target.value })}
            />
          </label>
          <label className="field">
            <span>{t("on.distance")}</span>
            <input
              value={answers.distance}
              onChange={(event) => patch({ distance: event.target.value })}
            />
          </label>
        </>
      ) : null}
      <label className="field">
        <span>{t("on.hours")}</span>
        <input
          value={answers.hours}
          inputMode="decimal"
          onChange={(event) => patch({ hours: event.target.value })}
        />
      </label>
      <label className="field">
        <span>{t("on.longest")}</span>
        <input
          value={answers.longest}
          onChange={(event) => patch({ longest: event.target.value })}
        />
      </label>
      <p className="note">
        <b>{t("on.why")}</b>
        {answers.goal === "general" ? t("on.why1b") : t("on.why1")}
      </p>
      <Link href="/onboarding/weight" className="bt">
        {t("common.continue")}
      </Link>
    </Screen>
  );
}

function WeightStep() {
  const { t } = useApp();
  const { answers, patch } = useDraft();
  return (
    <Screen
      lead={<QuestionDots filled={2} />}
      kicker={t("on.step", { n: 2 })}
      title={t("on.q2")}
      back="/onboarding/sport"
    >
      <label className="field">
        <span>kg</span>
        <input
          value={answers.weight}
          inputMode="decimal"
          onChange={(event) => patch({ weight: event.target.value })}
        />
      </label>
      <p className="note">
        <b>{t("on.why")}</b>
        {t("on.why2")}
      </p>
      <Link href="/onboarding/effort" className="bt">
        {t("common.continue")}
      </Link>
    </Screen>
  );
}

function EffortStep() {
  const { t } = useApp();
  const { answers, patch } = useDraft();
  return (
    <Screen
      lead={<QuestionDots filled={3} />}
      kicker={t("on.step", { n: 3 })}
      title={t("on.q3")}
      back="/onboarding/weight"
    >
      <div className="wrap">
        <button
          type="button"
          className={answers.effort === "power" ? "pill sel" : "pill"}
          onClick={() => patch({ effort: "power" })}
        >
          {t("on.power")}
        </button>
        <button
          type="button"
          className={answers.effort === "hr" ? "pill sel" : "pill"}
          onClick={() => patch({ effort: "hr" })}
        >
          {t("on.hr")}
        </button>
        <button
          type="button"
          className={answers.effort === "unsure" ? "pill sel" : "pill"}
          onClick={() => patch({ effort: "unsure" })}
        >
          {t("on.unsure")}
        </button>
      </div>
      {answers.effort === "power" ? (
        <label className="field">
          <span>{t("on.ftp")}</span>
          <input
            value={answers.ftp}
            inputMode="numeric"
            onChange={(event) => patch({ ftp: event.target.value })}
          />
        </label>
      ) : null}
      {answers.effort === "hr" ? (
        <label className="field">
          <span>{t("on.maxHr")}</span>
          <input
            value={answers.maxHr}
            inputMode="numeric"
            onChange={(event) => patch({ maxHr: event.target.value })}
          />
        </label>
      ) : null}
      <p className="mu">{t("on.infer")}</p>
      <p className="note">
        <b>{t("on.why")}</b>
        {t("on.why3")}
      </p>
      <Link href="/onboarding/carbs" className="bt">
        {t("common.continue")}
      </Link>
    </Screen>
  );
}

function CarbsStep() {
  const { t, locale } = useApp();
  const { answers, patch } = useDraft();
  const perHour = Number(answers.carbs);
  const hours = Number(answers.carbHours);
  const total =
    answers.carbKnown === "hour" && Number.isFinite(perHour) && Number.isFinite(hours)
      ? Math.round(perHour * hours)
      : null;
  const rough = roughCarbsPerHour({ ...answers, carbKnown: "unknown" });
  return (
    <Screen
      lead={<QuestionDots filled={4} />}
      kicker={t("on.step", { n: 4 })}
      title={t("on.q4")}
      back="/onboarding/effort"
    >
      <div className="wrap">
        <button
          type="button"
          className={answers.carbKnown === "hour" ? "pill sel" : "pill"}
          onClick={() => patch({ carbKnown: "hour" })}
        >
          {t("on.perHour")}
        </button>
        <button
          type="button"
          className={answers.carbKnown === "total" ? "pill sel" : "pill"}
          onClick={() => patch({ carbKnown: "total" })}
        >
          {t("on.total")}
        </button>
        <button
          type="button"
          className={answers.carbKnown === "unknown" ? "pill sel" : "pill"}
          onClick={() => patch({ carbKnown: "unknown" })}
        >
          {t("on.dontKnow")}
        </button>
      </div>
      {answers.carbKnown === "hour" || answers.carbKnown === "total" ? (
        <>
          <label className="field">
            <span>{answers.carbKnown === "hour" ? t("on.perHour") : t("on.total")}</span>
            <input
              value={answers.carbs}
              inputMode="decimal"
              onChange={(event) => patch({ carbs: event.target.value })}
            />
          </label>
          <label className="field">
            <span>{t("on.forHowLong")}</span>
            <input
              value={answers.carbHours}
              inputMode="decimal"
              onChange={(event) => patch({ carbHours: event.target.value })}
            />
          </label>
          {total != null ? (
            <p className="m">{t("on.equals", { grams: formatNumber(total, locale) })}</p>
          ) : null}
        </>
      ) : null}
      {answers.carbKnown === "unknown" ? (
        <>
          <p>{t("on.usual")}</p>
          <label className="field">
            <span>{t("on.gelsPer")}</span>
            <input
              value={answers.gels}
              inputMode="decimal"
              onChange={(event) => patch({ gels: event.target.value })}
            />
          </label>
          <button
            type="button"
            className={answers.iso ? "pill sel" : "pill"}
            onClick={() => patch({ iso: !answers.iso })}
          >
            {t("on.isoYes")}
          </button>
          <label className="field">
            <span>{t("on.bottles")}</span>
            <input
              value={answers.bottles}
              inputMode="decimal"
              onChange={(event) => patch({ bottles: event.target.value })}
            />
          </label>
          <p className="ey">{t("on.rough")}</p>
          <p className="m">
            {t("on.roughMath", { gels: answers.gels || "0", bottles: answers.bottles || "0" })}
          </p>
          {rough != null ? <p className="big">{formatNumber(rough, locale)}</p> : null}
          <p className="note">
            <b>{t("on.why")}</b>
            {t("on.why4b")}
          </p>
        </>
      ) : (
        <p className="note">
          <b>{t("on.why")}</b>
          {t("on.why4")}
        </p>
      )}
      <Link href="/onboarding/fuel" className="bt">
        {answers.carbKnown === "unknown" ? t("on.useEstimate") : t("common.continue")}
      </Link>
    </Screen>
  );
}

function FuelStep() {
  const { t } = useApp();
  const { answers, patch } = useDraft();
  function toggle(id: string) {
    const fuels = answers.fuels.includes(id)
      ? answers.fuels.filter((item) => item !== id)
      : [...answers.fuels, id];
    patch({ fuels });
  }
  return (
    <Screen
      lead={<QuestionDots filled={5} />}
      kicker={t("on.step", { n: 5 })}
      title={t("on.q5")}
      back="/onboarding/carbs"
    >
      <Preview />
      <div className="wrap">
        {FUELS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={answers.fuels.includes(id) ? "pill sel" : "pill"}
            onClick={() => toggle(id)}
          >
            {t(label)}
          </button>
        ))}
      </div>
      <p>{t("on.scan")}</p>
      <p className="mu">{t("on.orEnter")}</p>
      <p className="note">
        <b>{t("on.why")}</b>
        {t("on.why5")}
      </p>
      <Link href="/onboarding/sweat" className="bt">
        {t("common.continue")}
      </Link>
      <Link href="/onboarding/sweat" className="gh">
        {t("on.skipGh")}
      </Link>
    </Screen>
  );
}

function SweatStep() {
  const { t } = useApp();
  const { answers, patch } = useDraft();
  return (
    <Screen
      lead={<QuestionDots filled={6} />}
      kicker={t("on.step", { n: 6 })}
      title={t("on.q6")}
      back="/onboarding/fuel"
    >
      <button
        type="button"
        className={answers.sweat === "estimate" ? "choice sel" : "choice"}
        onClick={() => patch({ sweat: "estimate" })}
      >
        <b>{t("on.estimateSweat")}</b>
        <span className="mu">{t("on.estimateSweatHelp")}</span>
      </button>
      <button
        type="button"
        className={answers.sweat === "test" ? "choice sel" : "choice"}
        onClick={() => patch({ sweat: "test" })}
      >
        <b>{t("on.doSweat")}</b>
        <span className="mu">{t("on.doSweatHelp")}</span>
      </button>
      {answers.sweat === "estimate" ? (
        <div className="cd">
          <p className="ey">{t("on.yourEstimate", { kg: answers.weight || "—" })}</p>
          <p className="big">—</p>
          <p className="mu">{t("on.sodiumH")}</p>
          <p className="mu">{t("on.adjusts")}</p>
        </div>
      ) : null}
      {answers.sweat === "test" ? (
        <p className="note">
          <b>{t("on.good")}</b>
          {t("on.goodBody")}
        </p>
      ) : null}
      <p className="note">
        <b>{t("on.why")}</b>
        {t("on.why6")}
      </p>
      <Link href="/onboarding/gut" className="bt">
        {t("common.continue")}
      </Link>
    </Screen>
  );
}

function GutStep() {
  const { t } = useApp();
  const { answers, patch } = useDraft();
  function toggle(id: string) {
    const gut = answers.gut.includes(id)
      ? answers.gut.filter((item) => item !== id)
      : [...answers.gut, id];
    patch({ gut });
  }
  return (
    <Screen
      lead={<QuestionDots filled={7} />}
      kicker={t("on.step", { n: 7 })}
      title={t("on.q7")}
      back="/onboarding/sweat"
    >
      <div className="wrap">
        {GUT.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={answers.gut.includes(id) ? "pill sel" : "pill"}
            onClick={() => toggle(id)}
          >
            {t(label as MessageId)}
          </button>
        ))}
      </div>
      <p className="note">
        <b>{t("on.why")}</b>
        {t("on.why7")}
      </p>
      <Link href="/onboarding/mode" className="bt">
        {t("common.continue")}
      </Link>
    </Screen>
  );
}

function BriefingStep() {
  const { t } = useApp();
  const { answers, patch } = useDraft();
  const [allowed, setAllowed] = useState(false);
  return (
    <Screen kicker={t("brief.kicker")} title={t("brief.title")} back="/signup">
      <Preview />
      <button
        type="button"
        className={answers.brief === "evening" ? "choice sel" : "choice"}
        onClick={() => patch({ brief: "evening" })}
      >
        {t("brief.evening")}
      </button>
      <button
        type="button"
        className={answers.brief === "morning" ? "choice sel" : "choice"}
        onClick={() => patch({ brief: "morning" })}
      >
        {t("brief.morning")}
      </button>
      <div className="cd">
        <b>{t("brief.sample")}</b>
        <p className="mu">{t("brief.sampleBody")}</p>
      </div>
      <button type="button" className="bt" onClick={() => setAllowed(true)}>
        {allowed ? t("common.done") : t("brief.allow")}
      </button>
      <Link href="/onboarding/device" className="gh">
        {t("brief.notNow")}
      </Link>
      {allowed ? (
        <Link href="/onboarding/device" className="bt">
          {t("common.continue")}
        </Link>
      ) : null}
    </Screen>
  );
}

function DeviceStep() {
  const { t } = useApp();
  const [code, setCode] = useState("");
  const [paired, setPaired] = useState(false);
  return (
    <Screen kicker={t("dev.kicker")} title={t("dev.title")} back="/onboarding/briefing">
      <Preview />
      <p className="ey">{t("dev.step1")}</p>
      <p className="mu">{t("dev.step1Help")}</p>
      <p className="choice">{t("dev.store")}</p>
      <p className="ey">{t("dev.step2")}</p>
      <p>{t("dev.found")}</p>
      <button type="button" className="bt" onClick={() => setPaired(true)}>
        {paired ? t("common.done") : t("dev.auto")}
      </button>
      <label className="field">
        <span>{t("dev.code")}</span>
        <input value={code} onChange={(event) => setCode(event.target.value)} />
      </label>
      <p className="note">
        <b>{t("dev.get")}</b>
        {t("dev.getHelp")}
      </p>
      <Link href="/report" className="bt">
        {t("common.continue")}
      </Link>
    </Screen>
  );
}

function UnknownStep() {
  const { t } = useApp();
  return (
    <Screen title={t("on.title")}>
      <Link href="/onboarding/welcome" className="bt">
        {t("on.start")}
      </Link>
    </Screen>
  );
}

"use client";

import type { RacePlan } from "@carbadapt/contracts";
import { HttpErrorCode } from "@carbadapt/contracts";
import type { MessageId } from "@carbadapt/i18n";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useApp, useGet } from "@/components/app-state";
import { ApiError, apiSend } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { parseRacePlan } from "@/lib/parse";
import { CarryList, type CarryExtra, ErrorText, LoadingText, StepSegments } from "@/components/ui";

type StepId = "distance" | "time" | "bottles" | "refill";

function raceClock(
  minute: number,
  t: (id: MessageId, vars?: Record<string, string | number>) => string,
): string {
  if (minute < 60) return t("race.min", { m: minute });
  return t("race.hm", { h: Math.floor(minute / 60), m: minute % 60 });
}

function stepsFor(plan: RacePlan): StepId[] {
  const steps: StepId[] = [];
  if (plan.distanceKm == null) steps.push("distance");
  if (plan.durationMin <= 0) steps.push("time");
  steps.push("bottles", "refill");
  return steps;
}

function positive(value: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function positiveInt(value: string): number | null {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export function RacePlanCard({
  workoutId,
  plan,
  colors,
}: {
  workoutId: string;
  plan: unknown;
  colors?: Map<string, string | null>;
}) {
  const { token, t, locale, refreshData } = useApp();
  const race = useGet(token ? `/workouts/${workoutId}/race-plan` : null, parseRacePlan);
  const [override, setOverride] = useState<RacePlan | null>(null);
  const ready = race.status === "ready" ? race.data.racePlan : null;
  useEffect(() => {
    setOverride(null);
  }, [ready]);
  const shown = override ?? ready;

  if (race.status === "error") {
    return (
      <>
        <ErrorText code={race.code} />
        <CarryList plan={plan} colors={colors} hideFluidChoice />
      </>
    );
  }
  if (!shown) {
    return (
      <>
        <LoadingText />
        <CarryList plan={plan} colors={colors} hideFluidChoice />
      </>
    );
  }

  const extra: CarryExtra[] = [
    ...shown.extraBottlesMl.map((ml, index) => ({
      key: `bottle-${index}`,
      name: t("race.extraBottle", { ml: formatNumber(ml, locale) }),
      detail: t("carry.refillFluid", { ml: formatNumber(ml, locale), carbs: formatNumber(0, locale) }),
      fluidMl: ml,
      carbsG: 0,
      sodiumMg: 0,
    })),
    ...shown.refills.map((refill, index) => ({
      key: `refill-${index}`,
      name: t("race.refillAt", { km: formatNumber(refill.km, locale, 1) }),
      detail: t("carry.refillFluid", {
        ml: formatNumber(refill.addedMl, locale),
        carbs: formatNumber(0, locale),
      }),
      fluidMl: refill.addedMl,
      carbsG: 0,
      sodiumMg: 0,
    })),
  ];

  return (
    <>
      <RaceWarning plan={shown} />
      <RaceQuestions
        plan={shown}
        onSaved={(next) => {
          setOverride(next);
          refreshData();
        }}
      />
      <FluidChart plan={shown} />
      <CarryList plan={plan} colors={colors} hideFluidChoice extra={extra} />
    </>
  );
}

function RaceWarning({ plan }: { plan: RacePlan }) {
  const { t, locale } = useApp();
  if (plan.sweatRateLPerH == null) {
    return (
      <div className="warn" data-race-warning>
        <b>{t("race.noSweat")}</b>
        <Link href="/profile" className="gh">
          {t("race.sweatLink")}
        </Link>
      </div>
    );
  }
  if (plan.distanceKm == null) {
    return (
      <div className="warn" data-race-warning>
        <b>{t("race.needDistance")}</b>
      </div>
    );
  }
  if (plan.durationMin <= 0) {
    return (
      <div className="warn" data-race-warning>
        <b>{t("race.needTime")}</b>
      </div>
    );
  }
  if (!plan.computable || plan.enough == null) return null;
  if (plan.enough) {
    return (
      <p className="mu" data-race-warning data-enough="true">
        {t("race.enough")}
      </p>
    );
  }
  return (
    <div
      className="warn"
      data-race-warning
      data-run-out-km={plan.runOutKm ?? ""}
      data-missing-ml={plan.missingMl ?? ""}
    >
      <b>{t("race.runOut", { time: raceClock(plan.runOutMin ?? 0, t), km: formatNumber(plan.runOutKm ?? 0, locale, 1) })}</b>
      {plan.missingMl != null ? <p className="mu">{t("race.missing", { ml: formatNumber(plan.missingMl, locale) })}</p> : null}
      {plan.stationsMissedKm.map((stop) => (
        <p key={stop} className="mu">
          {t("race.missed", { km: formatNumber(stop, locale, 1) })}
        </p>
      ))}
    </div>
  );
}

function RaceQuestions({ plan, onSaved }: { plan: RacePlan; onSaved: (plan: RacePlan) => void }) {
  const { token, t, locale } = useApp();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [distance, setDistance] = useState("");
  const [minutes, setMinutes] = useState("");
  const [more, setMore] = useState<boolean | null>(null);
  const [bottles, setBottles] = useState<string[]>([]);
  const [canRefill, setCanRefill] = useState<boolean | null>(null);
  const [stops, setStops] = useState<string[]>([]);
  const [formError, setFormError] = useState<MessageId | null>(null);
  const [error, setError] = useState<HttpErrorCode | null>(null);
  const [pending, setPending] = useState(false);
  const steps = stepsFor(plan);
  const current = steps[step] ?? "bottles";
  const distanceKm = plan.distanceKm ?? positive(distance);

  function begin() {
    setDistance(plan.distanceKm == null ? "" : String(plan.distanceKm));
    setMinutes(plan.durationMin > 0 ? String(plan.durationMin) : "");
    setMore(plan.saved ? plan.extraBottlesMl.length > 0 : null);
    setBottles(plan.extraBottlesMl.map(String));
    setCanRefill(plan.saved ? plan.refillKm.length > 0 : null);
    setStops(plan.refillKm.map(String));
    setStep(0);
    setFormError(null);
    setError(null);
    setOpen(true);
  }

  function chooseRefill(yes: boolean) {
    setCanRefill(yes);
    setFormError(null);
    if (!yes) {
      setStops([]);
      return;
    }
    if (stops.length > 0) return;
    const seeded = plan.courseAidKm.length > 0 ? plan.courseAidKm.map(String) : [""];
    setStops(seeded);
  }

  function resizeStops(count: number) {
    const nextCount = Math.max(1, Math.min(20, count));
    setStops((currentStops) => {
      const next = currentStops.slice(0, nextCount);
      while (next.length < nextCount) next.push("");
      return next;
    });
  }

  function validate(id: StepId): boolean {
    if (id === "distance") {
      if (positive(distance) == null) {
        setFormError("race.needDistance");
        return false;
      }
    }
    if (id === "time") {
      if (positiveInt(minutes) == null) {
        setFormError("race.needTime");
        return false;
      }
    }
    if (id === "bottles") {
      if (more == null) {
        setFormError("race.choose");
        return false;
      }
      if (more && (bottles.length === 0 || bottles.some((value) => positiveInt(value) == null))) {
        setFormError("race.bottleNeed");
        return false;
      }
    }
    if (id === "refill") {
      if (canRefill == null) {
        setFormError("race.choose");
        return false;
      }
      if (canRefill) {
        if (stops.length === 0 || stops.some((value) => positive(value) == null)) {
          setFormError("race.stopNeed");
          return false;
        }
        if (distanceKm == null || stops.some((value) => Number(value) >= distanceKm)) {
          setFormError("race.kmRange");
          return false;
        }
      }
    }
    setFormError(null);
    return true;
  }

  async function save() {
    if (!token || pending) return;
    if (!validate(current)) return;
    setPending(true);
    setError(null);
    const body: {
      extraBottlesMl: number[];
      refillKm: number[];
      distanceKm?: number;
      durationMin?: number;
    } = {
      extraBottlesMl: more ? bottles.map((value) => Number(value)) : [],
      refillKm: canRefill ? stops.map((value) => Number(value)) : [],
    };
    if (plan.distanceKm == null && positive(distance) != null) body.distanceKm = Number(distance);
    if (plan.durationMin <= 0 && positiveInt(minutes) != null) body.durationMin = Number(minutes);
    try {
      const saved = await apiSend(`/workouts/${plan.workoutId}/race-plan`, {
        method: "PUT",
        token,
        body,
        parse: parseRacePlan,
      });
      onSaved(saved.racePlan);
      setOpen(false);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.code : HttpErrorCode.InternalError);
    } finally {
      setPending(false);
    }
  }

  function next() {
    if (!validate(current)) return;
    if (step >= steps.length - 1) {
      void save();
      return;
    }
    setStep(step + 1);
  }

  if (!open) {
    return (
      <div>
        {plan.saved ? (
          plan.extraBottlesMl.length === 0 && plan.refillKm.length === 0 ? (
            <p className="mu">{t("race.noExtras")}</p>
          ) : (
            <>
              {plan.extraBottlesMl.length > 0 ? (
                <p className="mu">{t("race.savedBottles", { n: plan.extraBottlesMl.length })}</p>
              ) : null}
              {plan.refillKm.length > 0 ? (
                <p className="mu">
                  {t("race.savedStops", {
                    km: plan.refillKm.map((km) => formatNumber(km, locale, 1)).join(", "),
                  })}
                </p>
              ) : null}
            </>
          )
        ) : null}
        <button type="button" className="bt" data-race-build onClick={begin}>
          {plan.saved ? t("race.editPlan") : t("race.build")}
        </button>
      </div>
    );
  }

  return (
    <div data-race-questions>
      <StepSegments total={steps.length} current={step} />
      {current === "distance" ? (
        <label className="field">
          <span>{t("race.distanceQ")}</span>
          <input inputMode="decimal" value={distance} onChange={(event) => setDistance(event.target.value)} />
        </label>
      ) : null}
      {current === "time" ? (
        <label className="field">
          <span>{t("race.timeQ")}</span>
          <input inputMode="numeric" value={minutes} onChange={(event) => setMinutes(event.target.value)} />
        </label>
      ) : null}
      {current === "bottles" ? (
        <div>
          <p>{t("race.moreBottlesQ")}</p>
          <div className="wrap">
            <button type="button" className={more === true ? "pill sel" : "pill"} onClick={() => {
              setMore(true);
              setFormError(null);
              if (bottles.length === 0) setBottles([""]);
            }}>
              {t("race.yes")}
            </button>
            <button type="button" className={more === false ? "pill sel" : "pill"} onClick={() => {
              setMore(false);
              setBottles([]);
              setFormError(null);
            }}>
              {t("race.no")}
            </button>
          </div>
          {more ? (
            <>
              {bottles.map((value, index) => (
                <div key={index}>
                  <label className="field">
                    <span>{t("race.bottleMl")}</span>
                    <input
                      inputMode="numeric"
                      value={value}
                      onChange={(event) =>
                        setBottles((currentBottles) =>
                          currentBottles.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)),
                        )
                      }
                    />
                  </label>
                  {bottles.length > 1 ? (
                    <button
                      type="button"
                      className="gh"
                      onClick={() => setBottles((currentBottles) => currentBottles.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      {t("race.remove")}
                    </button>
                  ) : null}
                </div>
              ))}
              <button
                type="button"
                className="gh"
                onClick={() => setBottles((currentBottles) => [...currentBottles, ""])}
              >
                {t("race.addBottle")}
              </button>
            </>
          ) : null}
        </div>
      ) : null}
      {current === "refill" ? (
        <div>
          <p>{t("race.refillQ")}</p>
          <div className="wrap">
            <button type="button" className={canRefill === true ? "pill sel" : "pill"} onClick={() => chooseRefill(true)}>
              {t("race.yes")}
            </button>
            <button type="button" className={canRefill === false ? "pill sel" : "pill"} onClick={() => chooseRefill(false)}>
              {t("race.no")}
            </button>
          </div>
          {canRefill ? (
            <>
              <label className="field">
                <span>{t("race.stationCount")}</span>
                <input
                  inputMode="numeric"
                  value={stops.length}
                  onChange={(event) => resizeStops(Number(event.target.value))}
                />
              </label>
              {stops.map((value, index) => (
                <div key={index}>
                  <label className="field">
                    <span>{t("race.stationKm", { n: index + 1 })}</span>
                    <input
                      inputMode="decimal"
                      value={value}
                      onChange={(event) =>
                        setStops((currentStops) =>
                          currentStops.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)),
                        )
                      }
                    />
                  </label>
                  {stops.length > 1 ? (
                    <button
                      type="button"
                      className="gh"
                      onClick={() => setStops((currentStops) => currentStops.filter((_, itemIndex) => itemIndex !== index))}
                    >
                      {t("race.remove")}
                    </button>
                  ) : null}
                </div>
              ))}
            </>
          ) : null}
        </div>
      ) : null}
      {formError ? <p className="mu">{t(formError)}</p> : null}
      {error ? <ErrorText code={error} /> : null}
      <div className="row">
        {step > 0 ? (
          <button type="button" className="gh" disabled={pending} onClick={() => setStep(step - 1)}>
            {t("race.back")}
          </button>
        ) : (
          <button type="button" className="gh" onClick={() => setOpen(false)}>
            {t("race.back")}
          </button>
        )}
        <button
          type="button"
          className="bt"
          data-race-save={step >= steps.length - 1 ? "true" : undefined}
          disabled={pending}
          onClick={next}
        >
          {step >= steps.length - 1 ? t("race.savePlan") : t("race.next")}
        </button>
      </div>
    </div>
  );
}

function FluidChart({ plan }: { plan: RacePlan }) {
  const { t, locale } = useApp();
  if (!plan.computable || plan.distanceKm == null || plan.points.length < 2) return null;
  const distanceKm = plan.distanceKm;
  const width = 320;
  const height = 148;
  const padL = 44;
  const padR = 10;
  const padT = 16;
  const padB = 24;
  const maxMl = Math.max(...plan.points.map((point) => point.remainingMl), 1);
  const xOf = (km: number) => padL + (km / distanceKm) * (width - padL - padR);
  const yOf = (ml: number) => padT + (1 - ml / maxMl) * (height - padT - padB);
  const line = plan.points
    .map((point, index) => `${index === 0 ? "M" : "L"}${xOf(point.km).toFixed(1)},${yOf(point.remainingMl).toFixed(1)}`)
    .join(" ");
  const dry =
    plan.runOutKm == null
      ? null
      : `M${xOf(plan.runOutKm).toFixed(1)},${yOf(0).toFixed(1)} L${xOf(distanceKm).toFixed(1)},${yOf(0).toFixed(1)}`;
  const label =
    plan.enough === false
      ? t("race.runOut", {
          time: raceClock(plan.runOutMin ?? 0, t),
          km: formatNumber(plan.runOutKm ?? 0, locale, 1),
        })
      : t("race.enough");
  return (
    <figure data-race-chart style={{ margin: 0 }}>
      <figcaption className="ey">{t("race.chart")}</figcaption>
      <svg className="race-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
        <path d={line} fill="none" stroke="currentColor" strokeWidth="2" />
        {dry ? <path d={dry} fill="none" stroke="var(--mu)" strokeWidth="1.5" strokeDasharray="4 4" /> : null}
        {plan.points
          .filter((point) => point.kind === "refill")
          .map((point) => (
            <circle key={`refill-${point.km}`} cx={xOf(point.km)} cy={yOf(point.remainingMl)} r="4" fill="var(--ca-glucose)" />
          ))}
        {plan.runOutKm != null ? (
          <circle cx={xOf(plan.runOutKm)} cy={yOf(0)} r="4" fill="var(--ca-ember)" />
        ) : null}
        <text x={padL} y={height - 6}>
          0 km
        </text>
        <text x={width - padR} y={height - 6} textAnchor="end">
          {`${formatNumber(distanceKm, locale, distanceKm % 1 === 0 ? 0 : 1)} km`}
        </text>
        <text x={4} y={padT + 4}>
          {formatNumber(maxMl, locale)}
        </text>
      </svg>
      <p className="mu">{t("race.assumptions")}</p>
    </figure>
  );
}

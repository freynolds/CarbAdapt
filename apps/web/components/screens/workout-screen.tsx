"use client";

import type { Workout } from "@carbadapt/contracts";
import Link from "next/link";
import { useState } from "react";
import { useApp, useGet } from "@/components/app-state";
import { Icon } from "@/components/icons";
import { ErrorText, LoadingText, NeedSignIn, Preview, Screen, TypeChip } from "@/components/ui";
import { formatDay, formatDuration, formatNumber } from "@/lib/format";
import { blocksOf, carryItems } from "@/lib/json";
import {
  parseAchievements,
  parseContainers,
  parseFeedback,
  parseGut,
  parseWorkout,
} from "@/lib/parse";

export function WorkoutScreen({ id }: { id: string }) {
  const { token, me, t, locale } = useApp();
  const zone = me?.user.timezone ?? "UTC";
  const workout = useGet(token ? `/workouts/${id}` : null, parseWorkout);
  const gut = useGet(token ? "/gut-plan" : null, parseGut);
  const [localGh, setLocalGh] = useState<number | null>(null);

  if (!token)
    return (
      <Screen tabs>
        <NeedSignIn />
      </Screen>
    );
  if (workout.status === "loading" || workout.status === "idle")
    return (
      <Screen tabs>
        <LoadingText />
      </Screen>
    );
  if (workout.status === "error")
    return (
      <Screen tabs>
        <ErrorText code={workout.code} />
      </Screen>
    );

  const row = workout.data.workout;
  const plan = row.fuelingPlan;
  const blocks = blocksOf(row.structure);
  const gutPlan = gut.status === "ready" ? gut.data.plan : null;
  const planGh = plan?.targetGPerH ?? null;
  const shownGh = localGh ?? planGh;
  const unstructured = row.workoutType == null && row.kind !== "SWEAT_TEST";
  let minute = 0;

  return (
    <Screen
      back="/calendar"
      title={row.name}
      tabs
      kicker={
        row.plannedDate
          ? `${formatDay(row.plannedDate, locale, zone)} · ${formatDuration(row.durationMin)}`
          : undefined
      }
      action={
        row.kind === "SWEAT_TEST" ? (
          <span className="ch ci">{t("type.sweat")}</span>
        ) : (
          <TypeChip type={row.workoutType} />
        )
      }
    >
      {row.needsIntake ? (
        <div className="cd">
          <b>{t("wk.noIntake")}</b>
          <p className="mu">{t("wk.addHelp")}</p>
          <Link href={`/workouts/${row.id}/questionnaire`} className="bt">
            {t("cal.addIntake")}
          </Link>
        </div>
      ) : null}
      {unstructured && !plan ? (
        <div className="cd">
          <b>{t("wk.noNumbers")}</b>
          <p className="mu">{t("wk.unstructured")}</p>
          <p className="ey">{t("wk.duration")}</p>
          <p className="m">{formatDuration(row.durationMin)}</p>
          <p className="ey">{t("wk.type")}</p>
          <TypeChip type={row.workoutType} />
          <p className="preview">{t("common.preview")}</p>
        </div>
      ) : null}
      {plan ? (
        <>
          <div className="rw" style={{ gap: 8 }}>
            {(["drop", "bottle", "gel", "solid"] as const).map((name) => (
              <span
                key={name}
                className="ic"
                title={t(
                  name === "drop"
                    ? "wk.markers"
                    : name === "bottle"
                      ? "wk.isotonic"
                      : name === "gel"
                        ? "wk.gel"
                        : "wk.solid",
                )}
              >
                <Icon name={name === "bottle" ? "bottle" : name} size={20} />
              </span>
            ))}
          </div>
          <p className="mu">{t("wk.cue")}</p>
          {me?.user.mode === "GUT_TRAINING" && shownGh != null ? (
            <div className="cd">
              <p className="ey">{t("wk.target")}</p>
              <div className="stepper">
                <button
                  type="button"
                  onClick={() => setLocalGh(Math.max(0, (shownGh ?? 0) - 10))}
                  aria-label="-"
                >
                  −
                </button>
                <b className="m" style={{ fontSize: 32 }}>
                  {shownGh}
                  <span className="mu" style={{ fontSize: 14 }}>
                    {" "}
                    g/h
                  </span>
                </b>
                <button
                  type="button"
                  onClick={() => setLocalGh((shownGh ?? 0) + 10)}
                  aria-label="+"
                >
                  +
                </button>
              </div>
              {planGh != null ? <p className="mu">{t("wk.planGh", { gh: planGh })}</p> : null}
              {localGh != null && localGh !== planGh ? (
                <p className="mu">{t("wk.differs")}</p>
              ) : null}
              <Preview />
            </div>
          ) : null}
          <div className="rw" style={{ justifyContent: "space-between" }}>
            <span className="ey">{t("home.carry")}</span>
            <Link href="/profile/products/new" className="plus" aria-label={t("home.addScan")}>
              +
            </Link>
          </div>
          {carryItems(plan.carryList).map((item, index) => (
            <div className="rw" key={`${item.name}-${index}`}>
              <div className="ic">
                <Icon
                  name={item.kind === "gel" ? "gel" : item.kind === "solid" ? "solid" : "bottle"}
                />
              </div>
              <div>
                <b>{item.name}</b>
                <div className="mu m">{item.detail}</div>
              </div>
            </div>
          ))}
        </>
      ) : null}
      {blocks.length > 0 ? (
        <>
          <p className="ey">{t("wk.blocks")}</p>
          <table className="table">
            <thead>
              <tr>
                <th>{t("wk.time")}</th>
                <th>{t("wk.block")}</th>
                <th>{t("wk.zone")}</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((block) => {
                const label = formatDuration(minute);
                minute += block.durationMin;
                return (
                  <tr key={`${block.name}-${label}`}>
                    <td>{label}</td>
                    <td>{block.name}</td>
                    <td>{block.zone ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : null}
      {gutPlan?.tooFast ? <p className="warn">{t("plan.tooFast")}</p> : null}
      {row.status !== "PLANNED" ? (
        <Link href={`/workouts/${row.id}/questionnaire`} className="gh">
          {t("q.kicker")}
        </Link>
      ) : null}
    </Screen>
  );
}

const FEELINGS = ["q.strong", "q.steady", "q.hard", "q.veryHard"] as const;
const SYMPTOMS = ["NONE", "MILD", "MODERATE", "SEVERE"] as const;

export function QuestionnaireScreen({ id }: { id: string }) {
  const { token, t, locale } = useApp();
  const workout = useGet(token ? `/workouts/${id}` : null, parseWorkout);
  const feedback = useGet(token ? `/workouts/${id}/feedback` : null, parseFeedback);
  const containers = useGet(token ? "/containers" : null, parseContainers);
  const achievements = useGet(token ? "/achievements" : null, parseAchievements);
  const [step, setStep] = useState(0);
  const [carbs, setCarbs] = useState<number | null>(null);
  const [fluid, setFluid] = useState<number | null>(null);
  const [timing, setTiming] = useState("as");
  const [symptom, setSymptom] = useState<(typeof SYMPTOMS)[number]>("NONE");
  const [feeling, setFeeling] = useState(0);
  const [postKg, setPostKg] = useState("71.8");
  const [urine, setUrine] = useState("0");
  const [beforeG, setBeforeG] = useState("812");
  const [afterG, setAfterG] = useState("590");
  const [followed, setFollowed] = useState("yes");
  const [sip, setSip] = useState<"accept" | "reject" | null>(null);

  const row: Workout | null = workout.status === "ready" ? workout.data.workout : null;
  const validating =
    containers.status === "ready"
      ? containers.data.containers.find((item) =>
          item.calibrations.some((cal) => cal.validationsLeft > 0),
        )
      : undefined;
  if (!token)
    return (
      <Screen>
        <NeedSignIn />
      </Screen>
    );
  if (workout.status === "loading" || workout.status === "idle")
    return (
      <Screen>
        <LoadingText />
      </Screen>
    );
  if (workout.status === "error")
    return (
      <Screen>
        <ErrorText code={workout.code} />
      </Screen>
    );
  if (!row) return null;

  const pending =
    achievements.status === "ready"
      ? (achievements.data.achievements.find(
          (item) => item.workoutId === id && item.celebratedAt == null,
        ) ?? null)
      : null;
  const plannedCarbs =
    row.fuelingPlan?.totalCarbsG ??
    (feedback.status === "ready" ? feedback.data.log?.intakeCarbsG : null);
  const shownCarbs = carbs ?? (typeof plannedCarbs === "number" ? plannedCarbs : 0);
  const shownFluid = fluid ?? row.fuelingPlan?.totalFluidMl ?? 0;
  const sweat = row.kind === "SWEAT_TEST";
  const steps = [
    "carbs",
    "when",
    "fluid",
    "gi",
    "feel",
    ...(sweat ? ["post"] : []),
    ...(validating ? ["weigh", "followed", "sip"] : []),
  ];
  const current = steps[step] ?? "carbs";
  const last = step >= steps.length - 1;

  function finish() {
    if (pending) window.location.assign(`/celebration/${pending.id}`);
    else window.location.assign("/home");
  }

  return (
    <Screen
      kicker={sweat && current === "post" ? t("q.postSweat") : t("q.kicker")}
      back={`/workouts/${id}`}
    >
      <Preview />
      <p className="ey">{t("q.step", { n: step + 1, total: steps.length })}</p>
      {current === "carbs" ? (
        <>
          <h2 className="h2">{t("q.carbs")}</h2>
          <div className="stepper">
            <button type="button" onClick={() => setCarbs(Math.max(0, shownCarbs - 5))}>
              −
            </button>
            <p className="big">{formatNumber(shownCarbs, locale)}</p>
            <button type="button" onClick={() => setCarbs(shownCarbs + 5)}>
              +
            </button>
          </div>
          <p className="mu">
            {t("q.planned", { value: `${row.fuelingPlan?.totalCarbsG ?? "—"} g` })}
          </p>
        </>
      ) : null}
      {current === "when" ? (
        <>
          <h2 className="h2">{t("q.when")}</h2>
          {(["as", "late", "skip"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={timing === item ? "choice sel" : "choice"}
              onClick={() => setTiming(item)}
            >
              {t(item === "as" ? "q.asPlanned" : item === "late" ? "q.late" : "q.skipped")}
            </button>
          ))}
        </>
      ) : null}
      {current === "fluid" ? (
        <>
          <h2 className="h2">{t("q.fluid")}</h2>
          <div className="stepper">
            <button type="button" onClick={() => setFluid(Math.max(0, shownFluid - 50))}>
              −
            </button>
            <p className="big" style={{ fontSize: 40 }}>
              {formatNumber(shownFluid, locale)}
            </p>
            <button type="button" onClick={() => setFluid(shownFluid + 50)}>
              +
            </button>
          </div>
          <p className="mu">
            {t("q.planned", { value: `${row.fuelingPlan?.totalFluidMl ?? "—"} ml` })}
          </p>
        </>
      ) : null}
      {current === "gi" ? (
        <>
          <h2 className="h2">{t("q.gi")}</h2>
          {SYMPTOMS.map((item) => (
            <button
              key={item}
              type="button"
              className={symptom === item ? "choice sel" : "choice"}
              onClick={() => setSymptom(item)}
            >
              {t(`symptom.${item}`)}
            </button>
          ))}
        </>
      ) : null}
      {current === "feel" ? (
        <>
          <h2 className="h2">{t("q.feel")}</h2>
          {FEELINGS.map((item, index) => (
            <button
              key={item}
              type="button"
              className={feeling === index ? "choice sel" : "choice"}
              onClick={() => setFeeling(index)}
            >
              {t(item)}
            </button>
          ))}
        </>
      ) : null}
      {current === "post" ? (
        <>
          <h2 className="h2">{t("q.weighAfter")}</h2>
          <p className="mu">{t("q.towel")}</p>
          <label className="field">
            <span>kg</span>
            <input
              value={postKg}
              onChange={(event) => setPostKg(event.target.value)}
              inputMode="decimal"
            />
          </label>
          <p className="mu">{t("q.fluidBottles")}</p>
          <p className="m">{formatNumber((shownFluid || 0) / 1000, locale, 1)} L</p>
          <label className="field">
            <span>{t("q.urine")}</span>
            <input
              value={urine}
              onChange={(event) => setUrine(event.target.value)}
              inputMode="numeric"
            />
          </label>
        </>
      ) : null}
      {current === "weigh" && validating ? (
        <>
          <p className="ey">{t("q.afterKicker")}</p>
          <h2 className="h2">{t("q.weighTitle", { name: validating.name })}</h2>
          <label className="field">
            <span>{t("q.before")}</span>
            <input value={beforeG} onChange={(event) => setBeforeG(event.target.value)} />
          </label>
          <label className="field">
            <span>{t("q.after")}</span>
            <input value={afterG} onChange={(event) => setAfterG(event.target.value)} />
          </label>
          <p className="mu">{t("q.weighHelp")}</p>
        </>
      ) : null}
      {current === "followed" ? (
        <>
          <h2 className="h2">{t("q.followed")}</h2>
          {(["yes", "mostly", "no"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={followed === item ? "choice sel" : "choice"}
              onClick={() => setFollowed(item)}
            >
              {t(item === "yes" ? "q.yes" : item === "mostly" ? "q.mostly" : "q.no")}
            </button>
          ))}
        </>
      ) : null}
      {current === "sip" && validating ? (
        <>
          <p className="ey">{t("q.sipKicker")}</p>
          <h2 className="h2">{t("q.sipTitle")}</h2>
          <p className="m">{validating.name}</p>
          <p>{t("q.sipLooks", { next: 18, prev: validating.calibrations[0]?.mlPerSip ?? 22 })}</p>
          <div className="row">
            <button
              type="button"
              className={sip === "accept" ? "bt" : "choice"}
              onClick={() => setSip("accept")}
            >
              {t("q.accept")}
            </button>
            <button
              type="button"
              className={sip === "reject" ? "bt" : "choice"}
              onClick={() => setSip("reject")}
            >
              {t("q.reject")}
            </button>
          </div>
        </>
      ) : null}
      <button
        type="button"
        className="bt"
        onClick={() => {
          if (last) finish();
          else setStep((value) => value + 1);
        }}
      >
        {last ? t("q.finish") : t("common.next")}
      </button>
    </Screen>
  );
}

export function CelebrationScreen({ id }: { id: string }) {
  const { token, t, me } = useApp();
  const list = useGet(token ? "/achievements" : null, parseAchievements);
  if (!token)
    return (
      <Screen>
        <NeedSignIn />
      </Screen>
    );
  if (list.status === "loading" || list.status === "idle")
    return (
      <Screen>
        <LoadingText />
      </Screen>
    );
  if (list.status === "error")
    return (
      <Screen>
        <ErrorText code={list.code} />
      </Screen>
    );
  const item = list.data.achievements.find((row) => row.id === id);
  const initial = (me?.user.name ?? "C").slice(0, 1);
  return (
    <Screen>
      <div className="burst">
        <svg className="rays" viewBox="0 0 200 200" aria-hidden="true">
          {Array.from({ length: 16 }, (_, index) => {
            const angle = (index / 16) * Math.PI * 2;
            const x2 = 100 + Math.cos(angle) * 90;
            const y2 = 100 + Math.sin(angle) * 90;
            return (
              <line
                key={index}
                x1="100"
                y1="100"
                x2={x2}
                y2={y2}
                stroke="#C6F135"
                strokeWidth="2"
                opacity="0.7"
              />
            );
          })}
        </svg>
        <div className="avatar">{initial}</div>
        <p className="ey">{t("celeb.kicker")}</p>
        <h1 className="h2">{t("celeb.title")}</h1>
        <p className="big">{item ? item.valueGh : "—"}</p>
        <p className="m">g/h</p>
      </div>
      <Link href="/home" className="bt">
        {t("common.done")}
      </Link>
      <Preview />
    </Screen>
  );
}

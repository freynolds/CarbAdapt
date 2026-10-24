"use client";

import type { FeedbackResponse, Workout } from "@carbadapt/contracts";
import type { Locale, MessageId } from "@carbadapt/i18n";
import { HttpErrorCode } from "@carbadapt/contracts";
import Link from "next/link";
import { useState } from "react";
import { useApp, useGet } from "@/components/app-state";
import { ApiError, apiSend } from "@/lib/api";
import { BurstMark, IntakeMark } from "@/components/illustrations";
import {
  CarryList,
  ErrorText,
  LoadingText,
  NeedSignIn,
  Preview,
  Screen,
  StepSegments,
  TypeChip,
} from "@/components/ui";
import { RacePlanCard } from "@/components/race-plan";
import { RecoveryBlurb } from "@/components/recovery-blurb";
import { formatDay, formatDuration, formatNumber } from "@/lib/format";
import { blocksOf, scheduleOf, type BlockRow, type ScheduleMark } from "@/lib/json";
import {
  parseAchievements,
  parseContainers,
  parseFeedback,
  parseFueling,
  parseGut,
  parseRaces,
  parseSweatTest,
  parseSweatTests,
  parseWorkout,
} from "@/lib/parse";

function StageRecovery({
  stageId,
  races,
}: {
  stageId: string | null;
  races: { id: string; stages: { id: string; index: number; recovery: { gapCase: string; gapMin: number | null; carbsTargetG: number; meals: unknown } | null }[] }[];
}) {
  const { t } = useApp();
  if (!stageId) return null;
  for (const race of races) {
    const stage = race.stages.find((row) => row.id === stageId);
    if (!stage?.recovery) continue;
    return (
      <div className="cd" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span className="ey">{t("home.between")}</span>
        <RecoveryBlurb
          gapCase={stage.recovery.gapCase}
          gapMin={stage.recovery.gapMin}
          carbsTargetG={stage.recovery.carbsTargetG}
          meals={stage.recovery.meals}
        />
      </div>
    );
  }
  return null;
}

const ZONE_FILL: Record<string, string> = {
  Z1: "#3DDC97",
  Z2: "#4DA3FF",
};

const INTAKE_KEY = ["water", "isotonic", "gel", "solid"] as const;

export function WorkoutScreen({ id }: { id: string }) {
  const { token, me, t, locale } = useApp();
  const zone = me?.user.timezone ?? "UTC";
  const workout = useGet(token ? `/workouts/${id}` : null, parseWorkout);
  const feedback = useGet(token ? `/workouts/${id}/feedback` : null, parseFeedback);
  const gut = useGet(token ? "/gut-plan" : null, parseGut);
  const containers = useGet(token ? "/containers" : null, parseContainers);
  const races = useGet(token ? "/races" : null, parseRaces);
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
  const log = feedback.status === "ready" ? feedback.data.log : null;
  const plan = row.fuelingPlan;
  const blocks = blocksOf(row.structure);
  const schedule = scheduleOf(plan?.schedule);
  const colorById = new Map(
    containers.status === "ready"
      ? containers.data.containers.map((item) => [item.id, item.colorHex] as const)
      : [],
  );
  const gutPlan = gut.status === "ready" ? gut.data.plan : null;
  const planGh = plan?.targetGPerH ?? null;
  const shownGh = localGh ?? planGh;
  function adjustGh(next: number) {
    setLocalGh(next);
    void apiSend(`/workouts/${id}/fueling-plan`, {
      method: "PATCH",
      token,
      body: { targetGPerH: next },
      parse: parseFueling,
    }).catch(() => undefined);
  }
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
      {log ? (
        <FeedbackSummary
          log={log}
          t={t}
          locale={locale}
          href={`/workouts/${row.id}/questionnaire`}
        />
      ) : null}
      {feedback.status === "ready" && !log && row.needsIntake ? (
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
      {plan || blocks.length > 0 ? (
        <>
          <div className="marks">
            {INTAKE_KEY.map((kind) => (
              <span key={kind}>
                <IntakeMark kind={kind} />
                {t(
                  kind === "water"
                    ? "wk.markers"
                    : kind === "isotonic"
                      ? "wk.isotonic"
                      : kind === "gel"
                        ? "wk.gel"
                        : "wk.solid",
                )}
              </span>
            ))}
          </div>
          {blocks.length > 0 ? (
            <BlockStrip blocks={blocks} schedule={schedule} durationMin={row.durationMin ?? 0} />
          ) : null}
          <p className="mu">{t("wk.cue")}</p>
        </>
      ) : null}
      {plan ? (
        <>
          {row.stageId ? <p className="mu">{t("wk.raceFuel")}</p> : null}
          {me?.user.mode === "GUT_TRAINING" && !row.stageId && shownGh != null ? (
            <div className="cd">
              <p className="ey">{t("wk.target")}</p>
              <div className="stepper">
                <button
                  type="button"
                  onClick={() => adjustGh(Math.max(0, (shownGh ?? 0) - 10))}
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
                <button type="button" onClick={() => adjustGh((shownGh ?? 0) + 10)} aria-label="+">
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
          {row.stageId ? (
            <div className="cd" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="rw" style={{ justifyContent: "space-between" }}>
                <span className="ey">{t("home.carry")}</span>
                <Link href="/profile/products/new" className="plus" aria-label={t("home.addScan")}>
                  +
                </Link>
              </div>
              <RacePlanCard workoutId={row.id} plan={plan.carryList} colors={colorById} />
            </div>
          ) : (
            <>
              <div className="rw" style={{ justifyContent: "space-between" }}>
                <span className="ey">{t("home.carry")}</span>
                <Link href="/profile/products/new" className="plus" aria-label={t("home.addScan")}>
                  +
                </Link>
              </div>
              <CarryList plan={plan.carryList} colors={colorById} />
            </>
          )}
          <StageRecovery stageId={row.stageId} races={races.status === "ready" ? races.data.races : []} />
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
                <th>{t("wk.blockDuration")}</th>
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
                    <td>{formatDuration(block.durationMin)}</td>
                    <td>{block.zone ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : null}
      {gutPlan?.tooFast ? <p className="warn">{t("plan.tooFast")}</p> : null}
      {feedback.status === "ready" && !log && row.status !== "PLANNED" ? (
        <Link href={`/workouts/${row.id}/questionnaire`} className="gh">
          {t("q.kicker")}
        </Link>
      ) : null}
    </Screen>
  );
}

function markColor(kind: ScheduleMark["kind"]): string {
  if (kind === "water") return "#4DA3FF";
  if (kind === "gel") return "#FF6A3D";
  if (kind === "solid") return "#F4F1EA";
  return "#C6F135";
}

function IntakeShape({ kind, x, y }: { kind: ScheduleMark["kind"]; x: number; y: number }) {
  if (kind === "water") return <circle cx={x} cy={y} r="5" fill="#4DA3FF" />;
  if (kind === "gel")
    return (
      <polygon points={`${x},${y - 6} ${x + 6},${y} ${x},${y + 6} ${x - 6},${y}`} fill="#FF6A3D" />
    );
  if (kind === "solid") return <rect x={x - 4} y={y - 4} width="8" height="8" fill="#F4F1EA" />;
  return <polygon points={`${x},${y - 6} ${x + 5},${y + 4} ${x - 5},${y + 4}`} fill="#C6F135" />;
}

/** Equal-height zone strip. Bar height in the design encodes sample watts the fixtures do not store. */
function BlockStrip({
  blocks,
  schedule,
  durationMin,
}: {
  blocks: BlockRow[];
  schedule: ScheduleMark[];
  durationMin: number;
}) {
  const width = 342;
  const total = blocks.reduce((sum, block) => sum + block.durationMin, 0) || 1;
  const span = durationMin > 0 ? durationMin : total;
  let cursor = 0;
  return (
    <svg className="chart" viewBox={`0 0 ${width} 100`} role="img">
      {blocks.map((block) => {
        const bar = (block.durationMin / total) * width;
        const node = (
          <rect
            key={`${block.name}-${cursor}`}
            x={cursor}
            y={36}
            width={Math.max(bar - 1, 1)}
            height={48}
            fill={block.zone && ZONE_FILL[block.zone] ? ZONE_FILL[block.zone] : "#2B3A55"}
          >
            <title>{`${block.name} · ${block.zone ?? "—"} · ${block.durationMin} min`}</title>
          </rect>
        );
        cursor += bar;
        return node;
      })}
      {schedule.map((mark) => {
        const x = Math.min(width - 6, Math.max(6, (mark.offsetMin / span) * width));
        const label =
          mark.carbsG != null
            ? `${mark.offsetMin} min · ${mark.carbsG} g`
            : `${mark.offsetMin} min`;
        return (
          <g key={`${mark.kind}-${mark.offsetMin}`}>
            <title>{label}</title>
            <path
              d={`M${x} 28V84`}
              stroke={markColor(mark.kind)}
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <IntakeShape kind={mark.kind} x={x} y={18} />
          </g>
        );
      })}
    </svg>
  );
}

/** Step sizes for the intake controls. Not fueling rules. */
const CARB_FINE_G = 5;
const CARB_COARSE_G = 25;
const FLUID_FINE_ML = 50;
const FLUID_COARSE_ML = 250;

const FEELINGS = ["q.strong", "q.steady", "q.hard", "q.veryHard"] as const;
const SYMPTOMS = ["NONE", "MILD", "MODERATE", "SEVERE"] as const;

function timingWhen(value: unknown): "as" | "late" | "skip" | null {
  if (!value || typeof value !== "object" || !("when" in value)) return null;
  const when = (value as { when: unknown }).when;
  if (when === "as" || when === "late" || when === "skip") return when;
  return null;
}

function feelingId(value: string | null): (typeof FEELINGS)[number] | null {
  return FEELINGS.find((item) => item === value) ?? null;
}

function symptomId(value: string | null): (typeof SYMPTOMS)[number] | null {
  return SYMPTOMS.find((item) => item === value) ?? null;
}

function symptomKey(level: (typeof SYMPTOMS)[number]): MessageId {
  if (level === "MILD") return "symptom.MILD";
  if (level === "MODERATE") return "symptom.MODERATE";
  if (level === "SEVERE") return "symptom.SEVERE";
  return "symptom.NONE";
}

function amountHint(
  t: (id: MessageId, vars?: Record<string, string | number>) => string,
  source: FeedbackResponse["prefill"]["carbSource"],
  planned: number | null,
  current: number | null,
  unit: string,
): string {
  if (source === "plan" && planned != null) return t("q.planned", { value: `${planned} ${unit}` });
  if (source === "working_rate") return t("q.fromTarget");
  if (current == null) return t("common.notSet");
  return "";
}

function FeedbackSummary({
  log,
  t,
  locale,
  href,
}: {
  log: NonNullable<FeedbackResponse["log"]>;
  t: (id: MessageId, vars?: Record<string, string | number>) => string;
  locale: Locale;
  href: string;
}) {
  const when = timingWhen(log.intakeTiming);
  const feeling = feelingId(log.feeling);
  const symptom = symptomId(log.symptomUpper);
  const whenText =
    when === "as"
      ? t("q.asPlanned")
      : when === "late"
        ? t("q.late")
        : when === "skip"
          ? t("q.skipped")
          : t("common.notSet");
  return (
    <div className="cd">
      <b>{t("q.summary")}</b>
      <p className="ey">{t("q.carbs")}</p>
      <p className="m">
        {log.intakeCarbsG == null
          ? t("common.notSet")
          : `${formatNumber(log.intakeCarbsG, locale)} g`}
      </p>
      <p className="ey">{t("q.fluid")}</p>
      <p className="m">
        {log.fluidMl == null ? t("common.notSet") : `${formatNumber(log.fluidMl, locale)} ml`}
      </p>
      <p className="ey">{t("q.when")}</p>
      <p className="m">{whenText}</p>
      <p className="ey">{t("q.gi")}</p>
      <p className="m">{symptom ? t(symptomKey(symptom)) : t("common.notSet")}</p>
      <p className="ey">{t("q.feel")}</p>
      <p className="m">{feeling ? t(feeling) : t("common.notSet")}</p>
      {log.followedPrompts == null ? null : (
        <>
          <p className="ey">{t("q.followed")}</p>
          <p className="m">{t(log.followedPrompts ? "q.yes" : "q.no")}</p>
        </>
      )}
      <Link href={href} className="bt">
        {t("q.edit")}
      </Link>
    </div>
  );
}

function AmountField({
  value,
  onChange,
  fine,
  coarse,
  unit,
  label,
}: {
  value: number | null;
  onChange: (next: number | null) => void;
  fine: number;
  coarse: number;
  unit: string;
  label: string;
}) {
  return (
    <>
      <div className="stepper">
        <button
          type="button"
          aria-label={`-${fine} ${unit}`}
          onClick={() => onChange(Math.max(0, (value ?? 0) - fine))}
        >
          −
        </button>
        <input
          className="big"
          inputMode="numeric"
          aria-label={label}
          value={value == null ? "" : String(value)}
          onChange={(event) => {
            const raw = event.target.value.trim();
            if (raw === "") onChange(null);
            else if (/^\d+$/.test(raw)) onChange(Number(raw));
          }}
        />
        <button
          type="button"
          aria-label={`+${fine} ${unit}`}
          onClick={() => onChange((value ?? 0) + fine)}
        >
          +
        </button>
      </div>
      <div className="stepper">
        <button
          type="button"
          className="coarse"
          onClick={() => onChange(Math.max(0, (value ?? 0) - coarse))}
        >
          −{coarse}
        </button>
        <span className="mu">{unit}</span>
        <button type="button" className="coarse" onClick={() => onChange((value ?? 0) + coarse)}>
          +{coarse}
        </button>
      </div>
    </>
  );
}

export function QuestionnaireScreen({ id }: { id: string }) {
  const { token } = useApp();
  const workout = useGet(token ? `/workouts/${id}` : null, parseWorkout);
  const feedback = useGet(token ? `/workouts/${id}/feedback` : null, parseFeedback);
  if (!token)
    return (
      <Screen>
        <NeedSignIn />
      </Screen>
    );
  if (
    workout.status === "loading" ||
    workout.status === "idle" ||
    feedback.status === "loading" ||
    feedback.status === "idle"
  )
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
  if (feedback.status === "error")
    return (
      <Screen>
        <ErrorText code={feedback.code} />
      </Screen>
    );
  return <QuestionnaireForm id={id} row={workout.data.workout} feedback={feedback.data} />;
}

function QuestionnaireForm({
  id,
  row,
  feedback,
}: {
  id: string;
  row: Workout;
  feedback: FeedbackResponse;
}) {
  const { token, t, locale } = useApp();
  const containers = useGet(token ? "/containers" : null, parseContainers);
  const achievements = useGet(token ? "/achievements" : null, parseAchievements);
  const sweatTests = useGet(token ? "/sweat-tests" : null, parseSweatTests);
  const saved = feedback.log;
  const prefill = feedback.prefill;
  const [saveError, setSaveError] = useState<HttpErrorCode | null>(null);
  const [step, setStep] = useState(0);
  const [carbs, setCarbs] = useState<number | null>(saved?.intakeCarbsG ?? prefill.carbsG);
  const [fluid, setFluid] = useState<number | null>(saved?.fluidMl ?? prefill.fluidMl);
  const [timing, setTiming] = useState<"as" | "late" | "skip">(
    timingWhen(saved?.intakeTiming) ?? "as",
  );
  const [symptom, setSymptom] = useState<(typeof SYMPTOMS)[number]>(
    symptomId(saved?.symptomUpper ?? null) ?? "NONE",
  );
  const [feeling, setFeeling] = useState(() => {
    const match = feelingId(saved?.feeling ?? null);
    return match ? FEELINGS.indexOf(match) : 0;
  });
  const [postKg, setPostKg] = useState("71.8");
  const [urine, setUrine] = useState("0");
  const [beforeG, setBeforeG] = useState("812");
  const [afterG, setAfterG] = useState("590");
  const [followed, setFollowed] = useState<"yes" | "mostly" | "no">(
    saved == null
      ? "yes"
      : saved.followedPrompts === true
        ? "yes"
        : saved.followedPrompts === false
          ? "no"
          : "mostly",
  );
  const [sip, setSip] = useState<"accept" | "reject" | null>(null);

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

  const pending =
    achievements.status === "ready"
      ? (achievements.data.achievements.find(
          (item) => item.workoutId === id && item.celebratedAt == null,
        ) ?? null)
      : null;
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

  async function finish() {
    if (!token) return;
    setSaveError(null);
    try {
      await apiSend(`/workouts/${id}/feedback`, {
        method: "POST",
        token,
        body: {
          intakeCarbsG: carbs,
          fluidMl: fluid,
          symptomUpper: symptom,
          symptomLower: symptom,
          symptomSystemic: symptom,
          feeling: FEELINGS[feeling] ?? "q.steady",
          intakeTiming: { when: timing },
          followedPrompts: validating
            ? followed === "yes"
              ? true
              : followed === "no"
                ? false
                : null
            : null,
          containerWeighIns: validating
            ? { containerId: validating.id, beforeG: Number(beforeG), afterG: Number(afterG) }
            : null,
          sipProposal: sip ? { accepted: sip === "accept" } : null,
          sweatPostWeightKg: sweat && Number.isFinite(Number(postKg)) ? Number(postKg) : null,
        },
        parse: parseFeedback,
      });
      if (sweat && sweatTests.status === "ready") {
        const test = sweatTests.data.sweatTests.find(
          (item) => item.workoutId === id && item.startedAt && item.endedAt == null,
        );
        const post = Number(postKg);
        const urineMl = Number(urine);
        if (test && Number.isFinite(post) && post > 0) {
          await apiSend(`/sweat-tests/${test.id}/complete`, {
            method: "POST",
            token,
            body: {
              postWeightKg: post,
              fluidMl: fluid ?? 0,
              urineMl: Number.isFinite(urineMl) ? urineMl : 0,
            },
            parse: parseSweatTest,
          });
        }
      }
      const list = await apiSend("/achievements", { token, parse: parseAchievements });
      const created =
        list.achievements.find((item) => item.workoutId === id && item.celebratedAt == null) ??
        pending;
      if (created) window.location.assign(`/celebration/${created.id}`);
      else window.location.assign(`/workouts/${id}`);
    } catch (caught: unknown) {
      setSaveError(caught instanceof ApiError ? caught.code : HttpErrorCode.InternalError);
    }
  }

  return (
    <Screen
      kicker={sweat && current === "post" ? t("q.postSweat") : t("q.kicker")}
      back={`/workouts/${id}`}
    >
      <Preview />
      <StepSegments total={steps.length} current={step} />
      <p className="ey">{t("q.step", { n: step + 1, total: steps.length })}</p>
      {current === "carbs" ? (
        <>
          <h2 className="h2">{t("q.carbs")}</h2>
          <AmountField
            value={carbs}
            onChange={setCarbs}
            fine={CARB_FINE_G}
            coarse={CARB_COARSE_G}
            unit="g"
            label={t("q.carbs")}
          />
          <p className="mu">{amountHint(t, prefill.carbSource, prefill.carbsG, carbs, "g")}</p>
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
          <AmountField
            value={fluid}
            onChange={setFluid}
            fine={FLUID_FINE_ML}
            coarse={FLUID_COARSE_ML}
            unit="ml"
            label={t("q.fluid")}
          />
          <p className="mu">{amountHint(t, prefill.fluidSource, prefill.fluidMl, fluid, "ml")}</p>
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
          <p className="m">{formatNumber((fluid ?? 0) / 1000, locale, 1)} L</p>
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
      {saveError ? <ErrorText code={saveError} /> : null}
      <button
        type="button"
        className="bt"
        onClick={() => {
          if (last) void finish();
          else setStep((value) => value + 1);
        }}
      >
        {last ? t("q.finish") : t("common.next")}
      </button>
    </Screen>
  );
}

export function CelebrationScreen({ id }: { id: string }) {
  const { token, t } = useApp();
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
  return (
    <Screen>
      <div className="burst">
        <div style={{ width: "min(100%, 280px)" }}>
          <BurstMark value={item ? String(item.valueGh) : "—"} />
        </div>
        <p className="ey">{t("celeb.kicker")}</p>
        <h1 className="h2">{t("celeb.title")}</h1>
      </div>
      <button
        type="button"
        className="bt"
        onClick={() => {
          void apiSend(`/achievements/${id}/celebrated`, {
            method: "POST",
            token,
            parse: (value) => value,
          }).finally(() => {
            window.location.assign(item?.workoutId ? `/workouts/${item.workoutId}` : "/home");
          });
        }}
      >
        {t("common.done")}
      </button>
      <Preview />
    </Screen>
  );
}

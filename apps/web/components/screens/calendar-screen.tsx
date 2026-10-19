"use client";

import type { Workout } from "@carbadapt/contracts";
import { HttpErrorCode } from "@carbadapt/contracts";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useApp, useGet } from "@/components/app-state";
import { ErrorText, LoadingText, NeedSignIn, Preview, Screen, TabBar, TypeChip } from "@/components/ui";
import { labeledAmount } from "@/lib/amounts";
import { ApiError, apiSend } from "@/lib/api";
import { addDays, formatDay, formatDuration, todayKey } from "@/lib/format";
import { manualSport, readAnswers } from "@/lib/onboarding";
import { parseRaces, parseSweatTests, parseWorkout, parseWorkouts } from "@/lib/parse";

type Row = {
  key: string;
  date: string;
  href: string;
  title: string;
  meta: string;
  chip: string | null;
  kind: string;
};

export function CalendarScreen() {
  const { token, me, t, locale } = useApp();
  const zone = me?.user.timezone ?? "UTC";
  const from = addDays(todayKey(zone), -21);
  const to = addDays(todayKey(zone), 60);
  const workouts = useGet(token ? `/workouts?from=${from}&to=${to}` : null, parseWorkouts);
  const races = useGet(token ? "/races" : null, parseRaces);
  const sweat = useGet(token ? "/sweat-tests" : null, parseSweatTests);
  const today = todayKey(zone);

  const rows = useMemo(() => {
    if (workouts.status !== "ready") return [];
    const list: Row[] = [];
    for (const workout of workouts.data.workouts) {
      if (!workout.plannedDate) continue;
      list.push({
        key: workout.id,
        date: workout.plannedDate,
        href: `/workouts/${workout.id}`,
        title: workout.name,
        meta: metaFor(workout, t, locale),
        chip: workout.kind === "SWEAT_TEST" ? "SWEAT" : workout.workoutType,
        kind: workout.kind === "SWEAT_TEST" ? "sweat" : "workout",
      });
    }
    if (races.status === "ready") {
      for (const race of races.data.races) {
        if (race.date) {
          list.push({
            key: `race-${race.id}`,
            date: race.date,
            href: `/races/${race.id}/breakfast`,
            title: race.name,
            meta: t("cal.race"),
            chip: null,
            kind: "race",
          });
        }
        for (const day of race.loadingDays) {
          if (!day.date) continue;
          list.push({
            key: day.id,
            date: day.date,
            href: `/races/${race.id}/loading/${day.day === "D_MINUS_2" ? "d-2" : "d-1"}`,
            title: race.name,
            meta: t("cal.loading"),
            chip: null,
            kind: "loading",
          });
        }
        if (race.rehearsal?.status === "SUGGESTED" && race.rehearsal.date) {
          list.push({
            key: race.rehearsal.id,
            date: race.rehearsal.date,
            href: `/races/${race.id}/loading/rehearsal`,
            title: race.name,
            meta: t("cal.rehearsal"),
            chip: null,
            kind: "loading",
          });
        }
        for (const stage of race.stages) {
          if (!stage.date || !stage.recovery) continue;
          const gap = t(`rec.${stage.recovery.gapCase}` as "rec.UNDER_4H");
          list.push({
            key: `gap-${stage.id}`,
            date: stage.date,
            href: `/races/${race.id}/stages/${stage.id}/recovery`,
            title: t("cal.between"),
            meta: `${race.name} · ${t("race.stage", { n: stage.index + 1 })} · ${gap} · ${stage.recovery.carbsTargetG} g`,
            chip: null,
            kind: "between",
          });
        }
      }
    }
    if (sweat.status === "ready") {
      for (const test of sweat.data.sweatTests) {
        if (!test.scheduledFor || test.workoutId) continue;
        list.push({
          key: test.id,
          date: test.scheduledFor,
          href: `/sweat-test/${test.id}`,
          title: t("type.sweat"),
          meta: test.movedFrom
            ? t("sweat.moved", { date: formatDay(test.movedFrom, locale, zone) })
            : t("common.mustComplete"),
          chip: "SWEAT",
          kind: "sweat",
        });
      }
    }
    return list.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  }, [workouts, races, sweat, t, locale, zone]);
  const scroller = useRef<HTMLDivElement>(null);
  const anchor =
    rows.find((row) => row.date === today)?.key ?? rows.find((row) => row.date > today)?.key ?? null;

  useEffect(() => {
    const root = scroller.current;
    if (!root || !anchor) return;
    const index = rows.findIndex((row) => row.key === anchor);
    const previousKey = index > 0 ? rows[index - 1]?.key : anchor;
    const target = root.querySelector(`[data-key="${CSS.escape(previousKey ?? anchor)}"]`);
    if (!(target instanceof HTMLElement)) return;
    const top =
      target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
    root.scrollTop = Math.max(0, top);
  }, [anchor, rows]);

  if (!token)
    return (
      <Screen title={t("common.calendar")} tabs>
        <NeedSignIn />
      </Screen>
    );
  if (workouts.status === "loading" || workouts.status === "idle")
    return (
      <Screen tabs>
        <LoadingText />
      </Screen>
    );
  if (workouts.status === "error")
    return (
      <Screen tabs>
        <ErrorText code={workouts.code} />
      </Screen>
    );

  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const bucket = groups.get(row.date) ?? [];
    bucket.push(row);
    groups.set(row.date, bucket);
  }
  return (
    <div className="screen">
      <div className="cal-head">
        <h1 className="t">
          {t("common.calendar")}
          <Link href="/calendar/new" className="plus" aria-label={t("cal.add")}>
            +
          </Link>
        </h1>
      </div>
      <div className="screen-body" ref={scroller}>
        {rows.length === 0 ? <p className="mu">{t("cal.empty")}</p> : null}
        {[...groups.entries()].map(([date, items]) => {
          const when = date < today ? "past" : date === today ? "today" : "upcoming";
          return (
            <section key={date}>
              <p className={`ey cal-day ${when}`}>
                {when === "past"
                  ? t("cal.past", { day: formatDay(date, locale, zone) })
                  : when === "today"
                    ? t("cal.today", { day: formatDay(date, locale, zone) })
                    : t("cal.upcoming", { day: formatDay(date, locale, zone) })}
              </p>
              {items.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  data-key={item.key}
                  className={`cd cal-card ${when}${item.kind === "between" ? " between" : ""}`}
                >
                  <div className="rw" style={{ justifyContent: "space-between" }}>
                    <b>{item.title}</b>
                    {item.chip === "SWEAT" ? (
                      <span className="ch ci">{t("type.sweat")}</span>
                    ) : item.chip ? (
                      <TypeChip type={item.chip} />
                    ) : null}
                  </div>
                  <span className="mu m">{item.meta}</span>
                </Link>
              ))}
            </section>
          );
        })}
      </div>
      <TabBar />
    </div>
  );
}

function metaFor(
  workout: Workout,
  t: ReturnType<typeof useApp>["t"],
  locale: ReturnType<typeof useApp>["locale"],
): string {
  const duration = formatDuration(workout.durationMin);
  if (workout.needsIntake) return `${duration} · ${t("cal.addIntake")}`;
  if (workout.fuelingPlan?.targetGPerH && workout.status === "PLANNED") {
    return `${duration} · ${t("cal.ghTarget", { gh: workout.fuelingPlan.targetGPerH })}`;
  }
  if (workout.fuelingPlan) {
    const carbs = labeledAmount(
      workout.fuelingPlan.carryList,
      "carbStatus",
      workout.fuelingPlan.totalCarbsG,
      locale,
      t("common.notSet"),
    );
    const fluid = labeledAmount(
      workout.fuelingPlan.carryList,
      "fluidStatus",
      workout.fuelingPlan.totalFluidMl,
      locale,
      t("common.notSet"),
    );
    return `${duration} · ${carbs} g · ${fluid} ml`;
  }
  return duration;
}

const TYPES = ["BASE", "THRESHOLD", "VO2MAX", "ANAEROBIC", "RECOVERY"] as const;

const TYPE_LABEL = {
  BASE: "type.BASE",
  THRESHOLD: "type.THRESHOLD",
  VO2MAX: "type.VO2MAX",
  ANAEROBIC: "type.ANAEROBIC",
  RECOVERY: "type.RECOVERY",
} as const;

export function ManualWorkoutScreen() {
  const { token, t, locale } = useApp();
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("2");
  const [minutes, setMinutes] = useState("00");
  const [type, setType] = useState<(typeof TYPES)[number]>("BASE");
  const [saved, setSaved] = useState<Workout | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<HttpErrorCode | null>(null);

  async function save() {
    if (!token || !date) return;
    const durationMin = Number(hours) * 60 + Number(minutes);
    if (!Number.isFinite(durationMin) || durationMin <= 0) return;
    setBusy(true);
    setError(null);
    try {
      const body = await apiSend("/workouts", {
        method: "POST",
        token,
        body: {
          name: t(TYPE_LABEL[type]),
          sport: manualSport(readAnswers()),
          workoutType: type,
          plannedDate: date,
          durationMin,
        },
        parse: parseWorkout,
      });
      setSaved(body.workout);
    } catch (caught: unknown) {
      setError(caught instanceof ApiError ? caught.code : HttpErrorCode.InternalError);
    } finally {
      setBusy(false);
    }
  }

  if (saved) {
    return (
      <Screen kicker={t("man.added")} title={t("man.ready")} back="/calendar">
        <Preview />
        <div className="cd">
          <div className="rw" style={{ justifyContent: "space-between" }}>
            <b>{t(TYPE_LABEL[type])}</b>
            <TypeChip type={type} />
          </div>
          <p className="m mu">
            {date || "—"} · {hours}:{minutes.padStart(2, "0")}
          </p>
        </div>
        <p className="ey">{t("man.carry")}</p>
        {saved.fuelingPlan ? (
          <p className="mu">
            {labeledAmount(
              saved.fuelingPlan.carryList,
              "carbStatus",
              saved.fuelingPlan.totalCarbsG,
              locale,
              t("common.notSet"),
            )}{" "}
            g ·{" "}
            {labeledAmount(
              saved.fuelingPlan.carryList,
              "fluidStatus",
              saved.fuelingPlan.totalFluidMl,
              locale,
              t("common.notSet"),
            )}{" "}
            ml
          </p>
        ) : (
          <p className="mu">{t("man.noPlan")}</p>
        )}
        <div className="note">
          <b>{t("dev.get")}</b>
          {t("man.device")}
        </div>
        <Link href="/calendar" className="bt">
          {t("common.done")}
        </Link>
      </Screen>
    );
  }

  return (
    <Screen kicker={t("common.calendar")} title={t("man.title")} back="/calendar">
      <Preview />
      <label className="field">
        <span>{t("man.date")}</span>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>
      <div className="field">
        <span>{t("wk.duration")}</span>
        <div className="row">
          <input
            inputMode="numeric"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            aria-label={t("wk.duration")}
          />
          <input
            inputMode="numeric"
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
          />
        </div>
      </div>
      <p className="ey">{t("wk.type")}</p>
      <div className="wrap">
        {TYPES.map((item) => (
          <button
            key={item}
            type="button"
            className={item === type ? "pill sel" : "pill"}
            onClick={() => setType(item)}
          >
            <TypeChip type={item} />
          </button>
        ))}
      </div>
      {error ? <ErrorText code={error} /> : null}
      {!token ? <NeedSignIn /> : null}
      <button type="button" className="bt" disabled={busy || !token} onClick={() => void save()}>
        {t("common.save")}
      </button>
    </Screen>
  );
}

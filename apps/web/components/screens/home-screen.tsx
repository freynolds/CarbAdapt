"use client";

import type { Todo } from "@carbadapt/contracts";
import type { MessageId } from "@carbadapt/i18n";
import Link from "next/link";
import { useApp, useGet } from "@/components/app-state";
import {
  BigStats,
  CarryLine,
  ErrorText,
  LoadingText,
  NeedSignIn,
  Screen,
  SweatCard,
  TypeChip,
} from "@/components/ui";
import { labeledAmount } from "@/lib/amounts";
import { addDays, formatDay, formatDuration, todayKey } from "@/lib/format";
import { carryItems } from "@/lib/json";
import { parseContainers, parseGut, parseHome, parseRaces, parseWorkouts } from "@/lib/parse";

function todoHref(todo: Todo, raceByRehearsal: Map<string, string>): string {
  const ref = todo.refId;
  switch (todo.type) {
    case "LAST_SESSION_FEEDBACK":
    case "SIP_VALIDATION":
      return ref ? `/workouts/${ref}/questionnaire` : "/calendar";
    case "SIP_CALIBRATION":
      return ref ? `/profile/gear/${ref}/calibrate` : "/profile/gear";
    case "SWEAT_TEST":
      return ref ? `/sweat-test/${ref}` : "/home";
    case "COMPLETE_PROFILE":
    case "DATA_CONFLICT":
      return "/profile/physical-data";
    case "ADD_BOTTLE":
      return "/profile/gear/new";
    case "ADD_RACE":
      return "/races/new";
    case "CONNECT_CALENDAR":
      return "/profile/connections";
    case "PRE_RACE_STRATEGY":
      return ref ? `/races/${ref}/strategy` : "/races/new";
    case "LOADING_REHEARSAL":
      return ref && raceByRehearsal.get(ref)
        ? `/races/${raceByRehearsal.get(ref)}/loading/rehearsal`
        : "/calendar";
    case "ESTIMATE_GH":
      return "/profile/mode-plan/estimate";
    default:
      return "/home";
  }
}

export function HomeScreen() {
  const { token, me, t, locale } = useApp();
  const zone = me?.user.timezone ?? "UTC";
  const from = todayKey(zone);
  const home = useGet(token ? "/home" : null, parseHome);
  const gut = useGet(token ? "/gut-plan" : null, parseGut);
  const workouts = useGet(
    token ? `/workouts?from=${from}&to=${addDays(from, 21)}` : null,
    parseWorkouts,
  );
  const races = useGet(token ? "/races" : null, parseRaces);

  if (!token) {
    return (
      <Screen title={t("common.home")} tabs>
        <NeedSignIn />
      </Screen>
    );
  }
  if (home.status === "loading" || home.status === "idle")
    return (
      <Screen tabs>
        <LoadingText />
      </Screen>
    );
  if (home.status === "error")
    return (
      <Screen tabs>
        <ErrorText code={home.code} />
      </Screen>
    );

  const data = home.data;
  const mode = data.user.mode;
  const hero = data.hero;
  const plan = gut.status === "ready" ? gut.data.plan : null;
  const raceByRehearsal = new Map<string, string>();
  if (races.status === "ready") {
    for (const race of races.data.races) {
      if (race.rehearsal) raceByRehearsal.set(race.rehearsal.id, race.id);
    }
  }
  const upcoming =
    workouts.status === "ready"
      ? workouts.data.workouts
          .filter((row) => row.id !== hero?.id && row.status === "PLANNED")
          .slice(0, 2)
      : [];
  const steps = plan?.steps ?? [];
  const currentIndex = steps.findIndex((step) => step.status === "CURRENT");

  return (
    <Screen title={t("common.home")} tabs>
      {mode === "GUT_TRAINING" && plan ? (
        <>
          <p className="ey">
            {t("home.level", {
              current: currentIndex >= 0 ? currentIndex + 1 : 1,
              total: Math.max(steps.length, 1),
            })}
          </p>
          <div className="ladder" aria-hidden="true">
            {steps.map((step) => (
              <div key={step.id}>
                <i
                  className={
                    step.status === "CURRENT"
                      ? "nowbar"
                      : step.status === "DONE"
                        ? "done"
                        : undefined
                  }
                  style={{
                    height: 16 + (step.gh / Math.max(...steps.map((row) => row.gh), 1)) * 90,
                  }}
                />
                <span className={step.status === "CURRENT" ? "now" : undefined}>{step.gh}</span>
              </div>
            ))}
          </div>
          {hero ? (
            <Link
              href={`/workouts/${hero.id}`}
              className="cd ring"
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              <div className="rw" style={{ justifyContent: "space-between" }}>
                <span className="ey">
                  {t("home.next", {
                    when: hero.plannedDate ? formatDay(hero.plannedDate, locale, zone) : "",
                  })}
                </span>
                <TypeChip type={hero.workoutType} />
              </div>
              <div>
                <b>{hero.name}</b> <span className="m mu">{formatDuration(hero.durationMin)}</span>
              </div>
              <GutTarget
                gh={
                  hero.fuelingPlan?.targetGPerH ??
                  plan.steps.find((step) => step.status === "CURRENT")?.gh ??
                  plan.goalGh
                }
                total={hero.fuelingPlan?.totalCarbsG ?? "—"}
              />
            </Link>
          ) : null}
          {upcoming.map((row) => (
            <Link key={row.id} href={`/workouts/${row.id}`} className="cd">
              <div className="rw" style={{ justifyContent: "space-between" }}>
                <span className="ey">
                  {row.plannedDate ? formatDay(row.plannedDate, locale, zone) : ""}
                </span>
                <TypeChip type={row.workoutType} />
              </div>
              <b>{row.name}</b> <span className="m mu">{formatDuration(row.durationMin)}</span>
              {row.workoutType === "RECOVERY" ? (
                <p className="mu">{t("home.easy", { total: row.fuelingPlan?.totalCarbsG ?? 0 })}</p>
              ) : null}
            </Link>
          ))}
        </>
      ) : hero?.fuelingPlan ? (
        <div className="cd" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link
            href={`/workouts/${hero.id}`}
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div className="rw" style={{ justifyContent: "space-between" }}>
              <span className="ey">{t("home.today")}</span>
              {hero.kind === "SWEAT_TEST" ? (
                <span className="ch ci">{t("type.sweat")}</span>
              ) : (
                <TypeChip type={hero.workoutType} />
              )}
            </div>
            <div>
              <b style={{ font: "800 22px var(--font-display), sans-serif" }}>{hero.name}</b>{" "}
              <span className="m mu">{formatDuration(hero.durationMin)}</span>
            </div>
            <BigStats
              items={[
                {
                  value: labeledAmount(
                    hero.fuelingPlan.carryList,
                    "carbStatus",
                    hero.fuelingPlan.totalCarbsG,
                    locale,
                    t("common.notSet"),
                  ),
                  label: t("common.gCarbs"),
                },
                {
                  value: labeledAmount(
                    hero.fuelingPlan.carryList,
                    "fluidStatus",
                    hero.fuelingPlan.totalFluidMl,
                    locale,
                    t("common.notSet"),
                  ),
                  label: t("common.mlFluid"),
                },
                {
                  value: labeledAmount(
                    hero.fuelingPlan.carryList,
                    "sodiumStatus",
                    hero.fuelingPlan.totalSodiumMg,
                    locale,
                    t("common.notSet"),
                  ),
                  label: t("common.mgSodium"),
                },
              ]}
            />
          </Link>
          <div className="hr" />
          <Carry plan={hero.fuelingPlan.carryList} />
        </div>
      ) : (
        <div className="cd">
          <p className="ey">{t("home.today")}</p>
          <p>{t("home.none")}</p>
        </div>
      )}

      {data.sweatTest ? (
        <SweatCard
          href={`/sweat-test/${data.sweatTest.id}`}
          title={t("home.sweatWhen", {
            minutes: 60,
            when: data.sweatTest.scheduledFor
              ? formatDay(data.sweatTest.scheduledFor, locale, zone)
              : "—",
          })}
          detail={t("common.mustComplete")}
        />
      ) : null}

      <p className="ey">{t("home.todo")}</p>
      <div className="cd" style={{ padding: "6px 16px" }}>
        {data.todos.length === 0 ? <p className="mu">{t("common.empty")}</p> : null}
        {data.todos.map((todo, index) => (
          <div key={todo.id}>
            {index > 0 ? <div className="hr" /> : null}
            <Link href={todoHref(todo, raceByRehearsal)} className="td">
              <div>
                <b>{t(`todo.${todo.type}`)}</b>
                <TodoDetail type={todo.type} />
              </div>
              <i>›</i>
            </Link>
          </div>
        ))}
      </div>
    </Screen>
  );
}

const TODO_DETAIL = {
  LAST_SESSION_FEEDBACK: "todo.LAST_SESSION_FEEDBACK.detail",
  SIP_CALIBRATION: "todo.SIP_CALIBRATION.detail",
  SIP_VALIDATION: "todo.SIP_VALIDATION.detail",
  SWEAT_TEST: "todo.SWEAT_TEST.detail",
  PRE_RACE_STRATEGY: "todo.PRE_RACE_STRATEGY.detail",
  DATA_CONFLICT: "todo.DATA_CONFLICT.detail",
  ESTIMATE_GH: "todo.ESTIMATE_GH.detail",
  LOADING_REHEARSAL: "todo.LOADING_REHEARSAL.detail",
} as const satisfies Partial<Record<Todo["type"], MessageId>>;

function TodoDetail({ type }: { type: Todo["type"] }) {
  const { t } = useApp();
  const key = type in TODO_DETAIL ? TODO_DETAIL[type as keyof typeof TODO_DETAIL] : undefined;
  if (!key) return null;
  return <span className="mu">{t(key)}</span>;
}

function GutTarget({ gh, total }: { gh: number | string; total: number | string }) {
  const { t } = useApp();
  const line = t("home.targetLine", { gh: "\u0000", total });
  const [before, after] = line.split("\u0000");
  return (
    <p className="rw" style={{ alignItems: "baseline", gap: 8 }}>
      {before ? <span className="mu m">{before}</span> : null}
      <b className="m gh-num">{gh}</b>
      {after ? <span className="mu m">{after}</span> : null}
    </p>
  );
}

function Carry({ plan }: { plan: unknown }) {
  const { token, t } = useApp();
  const containers = useGet(token ? "/containers" : null, parseContainers);
  const colorById = new Map(
    containers.status === "ready"
      ? containers.data.containers.map((row) => [row.id, row.colorHex] as const)
      : [],
  );
  const items = carryItems(plan);
  return (
    <>
      <div className="rw" style={{ justifyContent: "space-between" }}>
        <span className="ey">{t("home.carry")}</span>
        <Link href="/profile/products/new" className="plus" aria-label={t("home.addScan")}>
          +
        </Link>
      </div>
      {items.map((item, index) => (
        <CarryLine
          key={`${item.name}-${index}`}
          name={item.name}
          detail={item.detail}
          kind={item.kind}
          color={item.containerId ? colorById.get(item.containerId) : null}
        />
      ))}
    </>
  );
}

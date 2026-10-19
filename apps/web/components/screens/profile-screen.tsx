"use client";

import { CONNECTION_PROVIDER_ORDER, ConnectionStatus, HttpErrorCode } from "@carbadapt/contracts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useApp, useGet } from "@/components/app-state";
import { ApiError, apiSend } from "@/lib/api";
import { ErrorText, LoadingText, NeedSignIn, Preview, Screen, TypeChip } from "@/components/ui";
import { addDays, formatDay, formatNumber, todayKey } from "@/lib/format";
import { displayJson } from "@/lib/json";
import {
  parseConflicts,
  parseConnections,
  parseContainers,
  parseDeleted,
  parseGut,
  parseGutPreview,
  parseMe,
  parsePhysical,
  parseProducts,
  parseRaces,
  parseStarting,
  parseWorkouts,
} from "@/lib/parse";

export function ProfileScreen() {
  const { token, logout, t } = useApp();
  const me = useGet(token ? "/me" : null, parseMe);
  const containers = useGet(token ? "/containers" : null, parseContainers);
  const products = useGet(token ? "/products" : null, parseProducts);
  const connections = useGet(token ? "/connections" : null, parseConnections);
  const gut = useGet(token ? "/gut-plan" : null, parseGut);

  if (!token)
    return (
      <Screen title={t("prof.title")} tabs>
        <NeedSignIn />
      </Screen>
    );
  if (me.status === "loading" || me.status === "idle")
    return (
      <Screen tabs>
        <LoadingText />
      </Screen>
    );
  if (me.status === "error")
    return (
      <Screen tabs>
        <ErrorText code={me.code} />
      </Screen>
    );

  const user = me.data.user;
  const counts =
    containers.status === "ready"
      ? countGear(containers.data.containers)
      : { bottles: 0, flasks: 0, bladders: 0 };
  const productCount = products.status === "ready" ? products.data.products.length : 0;
  const plan = gut.status === "ready" ? gut.data.plan : null;
  return (
    <Screen title={t("prof.title")} tabs>
      <div className="cd rw">
        <Link href="/profile/account" className="rw" style={{ flex: 1 }}>
          <span className="avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
            {initials(user.name)}
          </span>
          <span>
            <b>{user.name}</b>
            <span className="mu" style={{ display: "block" }}>
              {user.email}
            </span>
          </span>
        </Link>
        <button type="button" className="ch ci" onClick={logout}>
          {t("prof.logout")}
        </button>
      </div>

      <p className="ey">{t("prof.modeSection")}</p>
      <div className="cd" style={{ padding: "6px 16px" }}>
        <Link href="/profile/mode-plan" className="td">
          <div>
            <b>{t("prof.mode")}</b>
            <span className="mu">{user.mode ? t(`mode.${user.mode}`) : t("prof.notChosen")}</span>
          </div>
          <i>›</i>
        </Link>
        <div className="hr" />
        <Link href="/profile/mode-plan" className="td">
          <div>
            <b>{t("prof.plan")}</b>
            <span className="mu">
              {plan
                ? t("plan.range", { start: plan.startGh, goal: plan.goalGh })
                : t("plan.noPlan")}
            </span>
          </div>
          <i>›</i>
        </Link>
      </div>

      <p className="ey">{t("prof.subSection")}</p>
      <div className="cd" style={{ padding: "6px 16px" }}>
        <Link href="/profile/subscription" className="td">
          <div>
            <b>{t("prof.plan")}</b>
            <span className="mu">{t("prof.beta")}</span>
          </div>
          <i>›</i>
        </Link>
      </div>

      <p className="ey">{t("prof.physSection")}</p>
      <div className="cd" style={{ padding: "6px 16px" }}>
        <Link href="/profile/physical-data" className="td">
          <div>
            <b>{t("prof.physSection")}</b>
          </div>
          <i>›</i>
        </Link>
      </div>

      <p className="ey">{t("prof.gearSection")}</p>
      <div className="cd" style={{ padding: "6px 16px" }}>
        <Link href="/profile/gear" className="td">
          <div>
            <b>{t("prof.gearSection")}</b>
            <span className="mu">{t("prof.gearCount", counts)}</span>
          </div>
          <i>›</i>
        </Link>
      </div>

      <p className="ey">{t("prof.prodSection")}</p>
      <div className="cd" style={{ padding: "6px 16px" }}>
        <Link href="/profile/products" className="td">
          <div>
            <b>{t("prof.prodSection")}</b>
            <span className="mu">{t("prof.productCount", { count: productCount })}</span>
          </div>
          <i>›</i>
        </Link>
      </div>

      <p className="ey">{t("prof.connSection")}</p>
      <div className="cd" style={{ padding: "6px 16px" }}>
        {(connections.status === "ready" ? connections.data.connections : []).map((row, index) => (
          <div key={row.provider}>
            {index > 0 ? <div className="hr" /> : null}
            <Link href="/profile/connections" className="td">
              <div>
                <b>{t(`conn.${row.provider}`)}</b>
                <span className="mu">
                  {row.status === ConnectionStatus.Connected
                    ? t("status.connected")
                    : t("status.off")}
                </span>
              </div>
              <i>›</i>
            </Link>
          </div>
        ))}
      </div>
    </Screen>
  );
}

function initials(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function countGear(containers: { type: string }[]) {
  return {
    bottles: containers.filter((row) => row.type === "BOTTLE").length,
    flasks: containers.filter((row) => row.type === "SOFT_FLASK").length,
    bladders: containers.filter((row) => row.type === "BLADDER").length,
  };
}

export function AccountScreen() {
  const { token, t, logout } = useApp();
  const router = useRouter();
  const me = useGet(token ? "/me" : null, parseMe);
  const [ask, setAsk] = useState(false);
  if (!token)
    return (
      <Screen title={t("acct.title")} back="/profile">
        <NeedSignIn />
      </Screen>
    );
  if (me.status !== "ready")
    return (
      <Screen back="/profile">
        {me.status === "error" ? <ErrorText code={me.code} /> : <LoadingText />}
      </Screen>
    );
  const user = me.data.user;
  return (
    <Screen title={t("acct.title")} back="/profile">
      <div className="cd">
        <p className="ey">{t("acct.name")}</p>
        <p>{user.name}</p>
        <p className="ey">{t("acct.email")}</p>
        <p>{user.email ?? "—"}</p>
        <p className="ey">{t("acct.signed")}</p>
        <p>{t("conn.GARMIN")}</p>
      </div>
      <button type="button" className="gh" onClick={() => setAsk(true)}>
        {t("acct.delete")}
      </button>
      {ask ? (
        <div className="warn">
          <b>{t("acct.confirm")}</b>
          <p>{t("acct.confirmHelp")}</p>
          <Preview />
          <div className="row">
            <button type="button" className="choice" onClick={() => setAsk(false)}>
              {t("common.cancel")}
            </button>
            <button
              type="button"
              className="bt"
              onClick={() => {
                if (!token) return;
                void apiSend("/me", { method: "DELETE", token, parse: parseDeleted }).then(() => {
                  logout();
                  router.push("/");
                });
              }}
            >
              {t("acct.delete")}
            </button>
          </div>
        </div>
      ) : null}
    </Screen>
  );
}

export function SubscriptionScreen() {
  const { t } = useApp();
  return <Screen title={t("sub.title")} back="/profile" className="sub" />;
}

function providerRank(provider: string): number {
  const index = CONNECTION_PROVIDER_ORDER.indexOf(
    provider as (typeof CONNECTION_PROVIDER_ORDER)[number],
  );
  return index < 0 ? CONNECTION_PROVIDER_ORDER.length : index;
}

export function ConnectionsScreen() {
  const { token, t } = useApp();
  const connections = useGet(token ? "/connections" : null, parseConnections);
  const [local, setLocal] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<HttpErrorCode | null>(null);
  if (!token)
    return (
      <Screen title={t("conn.title")} tabs>
        <NeedSignIn />
      </Screen>
    );
  if (connections.status !== "ready") {
    return (
      <Screen title={t("conn.title")} tabs>
        {connections.status === "error" ? <ErrorText code={connections.code} /> : <LoadingText />}
      </Screen>
    );
  }
  return (
    <Screen title={t("conn.title")} back="/profile" tabs>
      <Preview />
      <p className="mu">{t("conn.preview")}</p>
      {error ? <ErrorText code={error} /> : null}
      {[...connections.data.connections]
        .sort((a, b) => providerRank(a.provider) - providerRank(b.provider))
        .map((row) => {
          const connected = local[row.provider] ?? row.status === ConnectionStatus.Connected;
          return (
            <div key={row.provider} className="cd rw" style={{ justifyContent: "space-between" }}>
              <div>
                <b>{t(`conn.${row.provider}`)}</b>
                <div className="mu">{connected ? t("status.connected") : t("status.off")}</div>
              </div>
              <button
                type="button"
                className="pill"
                onClick={() => {
                  const next = !connected;
                  void apiSend(`/connections/${row.provider}`, {
                    method: next ? "POST" : "DELETE",
                    token,
                    parse: (value) => {
                      if (!value || typeof value !== "object" || !("connected" in value)) {
                        throw new ApiError(HttpErrorCode.InternalError);
                      }
                      return value;
                    },
                  })
                    .then(() => setLocal((current) => ({ ...current, [row.provider]: next })))
                    .catch((caught: unknown) => {
                      setError(
                        caught instanceof ApiError ? caught.code : HttpErrorCode.InternalError,
                      );
                    });
                }}
              >
                {connected ? t("status.disconnect") : t("status.connect")}
              </button>
            </div>
          );
        })}
    </Screen>
  );
}

const FIELDS = [
  ["weight", "phys.weight", "kg"],
  ["ftp", "phys.ftp", "W"],
  ["sweat", "phys.sweat", "L/h"],
  ["gh", "phys.gh", "g/h"],
  ["hr", "phys.maxHr", "bpm"],
  ["zones", "phys.zones", ""],
  ["age", "phys.age", ""],
  ["sex", "phys.sex", ""],
  ["height", "phys.height", "cm"],
] as const;

export function PhysicalScreen() {
  const { token, t, locale } = useApp();
  const me = useGet(token ? "/me" : null, parseMe);
  const conflicts = useGet(token ? "/me/conflicts" : null, parseConflicts);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [kept, setKept] = useState<string | null>(null);
  if (!token)
    return (
      <Screen title={t("phys.title")} tabs>
        <NeedSignIn />
      </Screen>
    );
  if (me.status !== "ready")
    return (
      <Screen tabs>{me.status === "error" ? <ErrorText code={me.code} /> : <LoadingText />}</Screen>
    );
  const physical = me.data.physical;
  const values: Record<string, string> = {
    weight:
      physical?.weightKg != null
        ? `${formatNumber(physical.weightKg, locale, 1)} kg`
        : t("phys.missing"),
    ftp: physical?.ftpW != null ? `${physical.ftpW} W` : t("phys.missing"),
    sweat:
      physical?.sweatRateLPerH != null
        ? `${formatNumber(physical.sweatRateLPerH, locale, 2)} L/h`
        : t("phys.missing"),
    gh: physical?.ghTolerance != null ? `${physical.ghTolerance} g/h` : t("phys.missing"),
    hr: physical?.maxHr != null ? `${physical.maxHr} bpm` : t("phys.missing"),
    zones: zoneLabel(physical?.hrZones, t),
    age: physical?.age != null ? String(physical.age) : t("phys.missing"),
    sex: physical?.sex ?? t("phys.missing"),
    height: physical?.heightCm != null ? `${physical.heightCm} cm` : t("phys.missing"),
  };
  const open =
    conflicts.status === "ready"
      ? conflicts.data.conflicts.filter((row) => row.resolvedAt == null)
      : [];
  return (
    <Screen title={t("phys.title")} back="/profile" tabs>
      <div className="cd" style={{ padding: "6px 16px" }}>
        {FIELDS.map(([key, label], index) => (
          <div key={key}>
            {index > 0 ? <div className="hr" /> : null}
            <button
              type="button"
              className="td"
              onClick={() => {
                setEditing(key);
                setDraft(values[key] ?? "");
              }}
            >
              <div>
                <b>{t(label)}</b>
                <span className="mu m">{values[key]}</span>
              </div>
              <i>›</i>
            </button>
          </div>
        ))}
      </div>
      <p className="mu">{t("phys.sync")}</p>
      {editing ? (
        <div className="cd">
          <Preview />
          <label className="field">
            <span>{t(FIELDS.find((row) => row[0] === editing)?.[1] ?? "phys.weight")}</span>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} />
          </label>
          <button
            type="button"
            className="bt"
            onClick={() => {
              if (!token || !editing) return;
              if (editing === "sweat" || editing === "zones") {
                setEditing(null);
                return;
              }
              const numeric = Number(draft.replace(/[^0-9.]/g, ""));
              const body =
                editing === "sex"
                  ? { sex: draft }
                  : editing === "weight"
                    ? { weightKg: numeric }
                    : editing === "ftp"
                      ? { ftpW: Math.round(numeric) }
                      : editing === "gh"
                        ? { ghTolerance: Math.round(numeric) }
                        : editing === "hr"
                          ? { maxHr: Math.round(numeric) }
                          : editing === "age"
                            ? { age: Math.round(numeric) }
                            : { heightCm: Math.round(numeric) };
              if (editing !== "sex" && !Number.isFinite(numeric)) return;
              void apiSend("/me/physical-data", {
                method: "PATCH",
                token,
                body,
                parse: parsePhysical,
              }).then(() => window.location.reload());
            }}
          >
            {t("common.done")}
          </button>
        </div>
      ) : null}
      {open.map((conflict) => (
        <div key={conflict.id} className="cd">
          <p className="ey">{t("todo.DATA_CONFLICT")}</p>
          <h2 className="h2">{t("phys.which", { field: conflict.field })}</h2>
          <button
            type="button"
            className={kept === "manual" ? "choice sel" : "choice"}
            onClick={() => setKept("manual")}
          >
            <span>
              <b>{t("phys.yours")}</b>
              <span className="mu m">{displayJson(conflict.manualValue)}</span>
            </span>
          </button>
          <button
            type="button"
            className={kept === "synced" ? "choice sel" : "choice"}
            onClick={() => setKept("synced")}
          >
            <span>
              <b>{t("phys.synced", { provider: t(`conn.${conflict.provider}`) })}</b>
              <span className="mu m">{displayJson(conflict.syncedValue)}</span>
            </span>
          </button>
          <p className="mu">{t("phys.pick")}</p>
          <Preview />
          <button
            type="button"
            className="bt"
            disabled={kept !== "manual" && kept !== "synced"}
            onClick={() => {
              if (!token || (kept !== "manual" && kept !== "synced")) return;
              void apiSend(`/me/conflicts/${conflict.id}/resolve`, {
                method: "POST",
                token,
                body: { resolvedWith: kept },
                parse: (value) => value,
              }).then(() => window.location.reload());
            }}
          >
            {t("phys.keep")}
          </button>
        </div>
      ))}
    </Screen>
  );
}

function zoneLabel(value: unknown, t: ReturnType<typeof useApp>["t"]): string {
  if (Array.isArray(value)) return t("phys.zonesCount", { count: value.length });
  if (value && typeof value === "object")
    return t("phys.zonesCount", { count: Object.keys(value).length });
  return t("phys.missing");
}

export function ModePlanScreen() {
  const { token, me, t, locale } = useApp();
  const gut = useGet(token ? "/gut-plan" : null, parseGut);
  const races = useGet(token ? "/races" : null, parseRaces);
  const [mode, setMode] = useState<"GUT_TRAINING" | "FUEL_MY_WORKOUTS" | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const [kept, setKept] = useState(false);
  const [date, setDate] = useState("");
  const chosen = mode ?? me?.user.mode ?? null;
  const plan = gut.status === "ready" ? gut.data.plan : null;
  const shownGoal = goal ?? plan?.goalGh ?? 90;
  const start = plan?.startGh ?? me?.physical?.ghTolerance ?? 60;
  const zone = me?.user.timezone ?? "UTC";
  const target = date || plan?.targetDate || addDays(todayKey(zone), 14);
  const days = useMemo(() => {
    const ms =
      new Date(`${target}T12:00:00Z`).getTime() - new Date(`${todayKey(zone)}T12:00:00Z`).getTime();
    return Math.round(ms / 86400000);
  }, [target, zone]);
  const tooFast = shownGoal - start >= 50 && days <= 21;
  const over120 = shownGoal > 120;

  if (!token)
    return (
      <Screen title={t("plan.title")} tabs>
        <NeedSignIn />
      </Screen>
    );
  return (
    <Screen title={t("plan.title")} back="/profile" tabs>
      <Preview />
      <p className="ey">{t("plan.mode")}</p>
      <button
        type="button"
        className={chosen === "GUT_TRAINING" ? "choice sel" : "choice"}
        onClick={() => {
          setMode("GUT_TRAINING");
          if (token) {
            void apiSend("/me", {
              method: "PATCH",
              token,
              body: { mode: "GUT_TRAINING" },
              parse: parseMe,
            });
          }
        }}
      >
        <span>
          <b>{t("mode.GUT_TRAINING")}</b>
          <span className="mu">{t("plan.gutHelp")}</span>
        </span>
      </button>
      <button
        type="button"
        className={chosen === "FUEL_MY_WORKOUTS" ? "choice sel" : "choice"}
        onClick={() => {
          setMode("FUEL_MY_WORKOUTS");
          if (token) {
            void apiSend("/me", {
              method: "PATCH",
              token,
              body: { mode: "FUEL_MY_WORKOUTS" },
              parse: parseMe,
            });
          }
        }}
      >
        <span>
          <b>{t("mode.FUEL_MY_WORKOUTS")}</b>
          <span className="mu">{t("plan.fuelHelp")}</span>
        </span>
      </button>
      {chosen !== "GUT_TRAINING" ? (
        <p className="mu">{t("plan.fuelOnly")}</p>
      ) : (
        <>
          <p className="ey">{t("plan.target")}</p>
          <p className="mu">{t("plan.raceOrDate")}</p>
          <div className="carousel">
            {races.status === "ready"
              ? races.data.races.map((race) => (
                  <Link key={race.id} href={`/races/${race.id}/edit`} className="tile">
                    <b>{race.name}</b>
                    <div className="mu m">
                      {race.date ? formatDay(race.date, locale, zone) : "—"}
                    </div>
                  </Link>
                ))
              : null}
            <Link
              href="/races/new"
              className="tile"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              +
            </Link>
          </div>
          <label className="field">
            <span>{t("plan.date")}</span>
            <input type="date" value={target} onChange={(event) => setDate(event.target.value)} />
          </label>
          <p className="ey">{t("plan.goal")}</p>
          <div className="stepper">
            <button
              type="button"
              onClick={() => {
                setGoal(Math.max(10, shownGoal - 10));
                setKept(false);
              }}
            >
              −
            </button>
            <b className="m" style={{ fontSize: 36 }}>
              {shownGoal}
            </b>
            <button
              type="button"
              onClick={() => {
                setGoal(Math.min(200, shownGoal + 10));
                setKept(false);
              }}
            >
              +
            </button>
          </div>
          <p className="mu">{t("plan.max")}</p>
          {plan ? (
            <p className="mu">
              {t("plan.current", {
                gh: plan.steps.find((step) => step.status === "CURRENT")?.gh ?? start,
                step: plan.steps.findIndex((step) => step.status === "CURRENT") + 1 || 1,
                total: plan.steps.length || 1,
              })}
            </p>
          ) : null}
          {over120 || plan?.warningAbove120 ? <p className="warn">{t("plan.warn120")}</p> : null}
          {tooFast && !kept ? (
            <div className="warn">
              <b>{t("plan.tooFast")}</b>
              <p>{t("plan.suggest")}</p>
              <button
                type="button"
                className="choice"
                onClick={() => setDate(addDays(todayKey(zone), 35))}
              >
                {t("plan.later")}
              </button>
              <button
                type="button"
                className="choice"
                onClick={() => setGoal(Math.min(shownGoal, start + 10))}
              >
                {t("plan.lower")}
              </button>
              <button type="button" className="bt" onClick={() => setKept(true)}>
                {t("plan.keep")}
              </button>
            </div>
          ) : null}
          {!me?.physical?.ghTolerance ? (
            <Link href="/profile/mode-plan/estimate" className="bt">
              {t("plan.estimate")}
            </Link>
          ) : null}
          <p className="ey">{t("plan.ladder")}</p>
          <p className="mu">{t("plan.reaches")}</p>
          {(plan?.steps ?? []).map((step) => (
            <div key={step.id} className="rw" style={{ justifyContent: "space-between" }}>
              <b className="m">{step.gh} g/h</b>
              <span className="mu">
                {step.approxDate ? formatDay(step.approxDate, locale, zone) : "—"}
              </span>
              <span className="ch cu">
                {step.status === "DONE"
                  ? t("plan.done")
                  : step.status === "CURRENT"
                    ? t("plan.now")
                    : t("plan.upcoming")}
              </span>
            </div>
          ))}
          {!plan ? <p className="mu">{t("plan.noPlan")}</p> : null}
          <button
            type="button"
            className="bt"
            onClick={() => {
              const startGh = plan?.startGh ?? me?.physical?.ghTolerance ?? null;
              const targetDate = date || plan?.targetDate || "";
              if (!token || startGh == null || !targetDate) return;
              const body = {
                targetKind: "DATE" as const,
                targetDate,
                startGh,
                goalGh: shownGoal,
                sessionsPerWeek: null,
              };
              void apiSend("/gut-plan/preview", {
                method: "POST",
                token,
                body,
                parse: parseGutPreview,
              }).then(() =>
                apiSend("/gut-plan", { method: "PUT", token, body, parse: parseGut }).then(() =>
                  window.location.reload(),
                ),
              );
            }}
          >
            {t("common.save")}
          </button>
        </>
      )}
    </Screen>
  );
}

export function EstimateScreen() {
  const { token, me, t, locale } = useApp();
  const zone = me?.user.timezone ?? "UTC";
  const from = addDays(todayKey(zone), -45);
  const workouts = useGet(
    token ? `/workouts?from=${from}&to=${todayKey(zone)}` : null,
    parseWorkouts,
  );
  const products = useGet(token ? "/products" : null, parseProducts);
  const [picks, setPicks] = useState<
    Record<string, { productId: string; servings: number; mild: boolean }>
  >({});
  const [unknown, setUnknown] = useState(false);
  if (!token)
    return (
      <Screen title={t("est.title")} back="/profile/mode-plan">
        <NeedSignIn />
      </Screen>
    );
  const weight = me?.physical?.weightKg ?? 70;
  const fallback = Math.min(60, Math.round(weight));
  const list = products.status === "ready" ? products.data.products : [];
  const rows =
    workouts.status === "ready"
      ? workouts.data.workouts.filter((row) => row.status !== "PLANNED").slice(0, 5)
      : [];
  let best = 0;
  for (const row of rows) {
    const pick = picks[row.id];
    if (!pick || !pick.mild || !row.durationMin) continue;
    const product = list.find((item) => item.id === pick.productId);
    if (!product) continue;
    const gh = Math.round((product.carbsG * pick.servings) / (row.durationMin / 60));
    if (gh > best) best = gh;
  }
  return (
    <Screen title={t("est.title")} back="/profile/mode-plan">
      <Preview />
      <p>{t("est.help")}</p>
      {workouts.status === "error" ? <ErrorText code={workouts.code} /> : null}
      {rows.length === 0 ? <p className="mu">{t("est.empty")}</p> : null}
      {rows.map((row) => {
        const pick = picks[row.id] ?? { productId: list[0]?.id ?? "", servings: 1, mild: true };
        return (
          <div key={row.id} className="cd">
            <div className="rw" style={{ justifyContent: "space-between" }}>
              <b>{row.name}</b>
              <TypeChip type={row.workoutType} />
            </div>
            <p className="mu m">{row.durationMin ? `${row.durationMin} min` : "—"}</p>
            <label className="field">
              <span>{t("prof.prodSection")}</span>
              <select
                value={pick.productId}
                onChange={(event) =>
                  setPicks((current) => ({
                    ...current,
                    [row.id]: { ...pick, productId: event.target.value },
                  }))
                }
              >
                {list.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="stepper">
              <button
                type="button"
                onClick={() =>
                  setPicks((current) => ({
                    ...current,
                    [row.id]: { ...pick, servings: Math.max(0, pick.servings - 1) },
                  }))
                }
              >
                −
              </button>
              <span className="m">
                {t("est.servings")} {pick.servings}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPicks((current) => ({
                    ...current,
                    [row.id]: { ...pick, servings: pick.servings + 1 },
                  }))
                }
              >
                +
              </button>
            </div>
            <div className="row">
              <button
                type="button"
                className={pick.mild ? "pill sel" : "pill"}
                onClick={() =>
                  setPicks((current) => ({ ...current, [row.id]: { ...pick, mild: true } }))
                }
              >
                {t("est.mild")}
              </button>
              <button
                type="button"
                className={!pick.mild ? "pill sel" : "pill"}
                onClick={() =>
                  setPicks((current) => ({ ...current, [row.id]: { ...pick, mild: false } }))
                }
              >
                {t("est.worse")}
              </button>
            </div>
          </div>
        );
      })}
      <p className="big" style={{ fontSize: 40 }}>
        {t("est.live", { gh: best || "—" })}
      </p>
      {best > 0 ? <p>{t("est.start", { gh: best })}</p> : null}
      <button
        type="button"
        className={unknown ? "choice sel" : "choice"}
        onClick={() => setUnknown(true)}
      >
        {t("est.unknown")}
      </button>
      <p className="mu">{t("est.fallback")}</p>
      {unknown ? (
        <p className="m">{t("est.fallbackValue", { gh: formatNumber(fallback, locale) })}</p>
      ) : null}
      <button
        type="button"
        className="bt"
        onClick={() => {
          if (!token) return;
          const entries = unknown
            ? []
            : rows.flatMap((row) => {
                const pick = picks[row.id];
                if (!pick || !row.durationMin) return [];
                const product = list.find((item) => item.id === pick.productId);
                if (!product) return [];
                return [
                  {
                    carbsG: product.carbsG * pick.servings,
                    durationMin: row.durationMin,
                    symptom: pick.mild ? ("MILD" as const) : ("MODERATE" as const),
                  },
                ];
              });
          void apiSend("/gut-plan/starting-point", {
            method: "POST",
            token,
            body: { entries },
            parse: parseStarting,
          }).then((result) => {
            if (result.gh == null) return;
            return apiSend("/me/physical-data", {
              method: "PATCH",
              token,
              body: { ghTolerance: result.gh },
              parse: parsePhysical,
            }).then(() => window.location.assign("/profile/mode-plan"));
          });
        }}
      >
        {t("common.save")}
      </button>
    </Screen>
  );
}

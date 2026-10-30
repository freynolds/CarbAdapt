"use client";

import { HttpErrorCode, SWEAT_RATE_FORMULA } from "@carbadapt/contracts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp, useGet } from "@/components/app-state";
import { durationMinutes, zonedLocalToIso } from "@/lib/amounts";
import { ApiError, apiSend } from "@/lib/api";
import { RecoveryBlurb } from "@/components/recovery-blurb";
import {
  BigStats,
  CarryList,
  ErrorText,
  LoadingText,
  NeedSignIn,
  Preview,
  Screen,
} from "@/components/ui";
import { formatClock, formatDay, formatDuration, formatNumber } from "@/lib/format";
import { asArray, asRecord, asString, mealsOf } from "@/lib/json";
import {
  parseBreakfast,
  parseLoading,
  parseRace,
  parseRecovery,
  parseSweatTest,
} from "@/lib/parse";

const LOADING = ["NONE", "TWO_DAY", "ONE_DAY"] as const;
const SPORTS = ["road", "gravel", "trail"] as const;

export function RaceFormScreen({ id }: { id?: string }) {
  const { token, t, locale, me } = useApp();
  const router = useRouter();
  const zone = me?.user.timezone ?? "UTC";
  const existing = useGet(token && id ? `/races/${id}` : null, parseRace);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<HttpErrorCode | null>(null);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("5:30");
  const [distance, setDistance] = useState("");
  const [elevation, setElevation] = useState("");
  const [sport, setSport] = useState<(typeof SPORTS)[number]>("road");
  const [loading, setLoading] = useState<(typeof LOADING)[number]>("NONE");
  const [multi, setMulti] = useState<boolean | null>(null);
  const [stages, setStages] = useState([{ name: "1", date: "", start: "07:00", duration: "3:30" }]);
  const [aids, setAids] = useState([{ km: "32", water: true, iso: true, gels: false }]);
  const [editingAid, setEditingAid] = useState<number | null>(null);
  const row = existing.status === "ready" ? existing.data.race : null;
  const showMulti = multi ?? Boolean(row?.isMultiStage);

  async function save() {
    if (!token) return;
    const raceName = name || row?.name || "";
    const raceDate = date || row?.date || "";
    const minutes = durationMinutes(
      duration || (row ? formatDuration(row.estimatedDurationMin) : ""),
    );
    if (!raceName || !raceDate || minutes == null) {
      setError(HttpErrorCode.InvalidRequest);
      return;
    }
    const stageRows = showMulti
      ? row?.stages.length
        ? row.stages.flatMap((stage) => {
            if (!stage.date || !stage.startAt) return [];
            return [
              {
                date: stage.date,
                startAt: stage.startAt,
                estimatedDurationMin: stage.estimatedDurationMin,
                type: stage.type,
              },
            ];
          })
        : stages.flatMap((stage) => {
            const stageMinutes = durationMinutes(stage.duration);
            const startAt = stage.date
              ? zonedLocalToIso(stage.date, stage.start || "00:00", zone)
              : null;
            if (!stage.date || stageMinutes == null || !startAt) return [];
            return [
              {
                date: stage.date,
                startAt,
                estimatedDurationMin: stageMinutes,
                type: sport,
              },
            ];
          })
      : [];
    if (showMulti && stageRows.length === 0) {
      setError(HttpErrorCode.InvalidRequest);
      return;
    }
    const distanceKm = Number(distance || (row?.distanceKm != null ? String(row.distanceKm) : ""));
    const elevationGainM = Number(
      elevation || (row?.elevationGainM != null ? String(row.elevationGainM) : ""),
    );
    const body = {
      name: raceName,
      date: raceDate,
      estimatedDurationMin: minutes,
      type: sport,
      distanceKm: Number.isFinite(distanceKm) ? distanceKm : null,
      elevationGainM: Number.isFinite(elevationGainM) ? Math.round(elevationGainM) : null,
      carbLoading: loading,
      isMultiStage: showMulti,
      stages: stageRows,
      aidStations: showMulti
        ? []
        : aids.flatMap((aid) => {
            const kmMark = Number(aid.km);
            if (!Number.isFinite(kmMark)) return [];
            return [{ kmMark, hasWater: aid.water, hasIsotonic: aid.iso, hasGels: aid.gels }];
          }),
    };
    setBusy(true);
    setError(null);
    try {
      const saved = await apiSend(id ? `/races/${id}` : "/races", {
        method: id ? "PATCH" : "POST",
        token,
        body,
        parse: parseRace,
      });
      router.push(`/races/${saved.race.id}/strategy`);
    } catch (caught: unknown) {
      setError(caught instanceof ApiError ? caught.code : HttpErrorCode.InternalError);
    } finally {
      setBusy(false);
    }
  }

  if (!token) {
    return (
      <Screen title={t("race.add")} back="/home">
        <NeedSignIn />
      </Screen>
    );
  }
  if (id && existing.status === "error") {
    return (
      <Screen title={t("race.edit")} back="/home">
        <ErrorText code={existing.code} />
      </Screen>
    );
  }
  if (id && existing.status !== "ready") {
    return (
      <Screen title={t("race.edit")} back="/home">
        <LoadingText />
      </Screen>
    );
  }
  return (
    <Screen kicker={t("cal.race")} title={id ? t("race.edit") : t("race.add")} back="/home">
      <Preview />
      <label className="field">
        <span>{t("race.name")}</span>
        <input value={name || row?.name || ""} onChange={(event) => setName(event.target.value)} />
      </label>
      {!showMulti ? (
        <>
          <label className="field">
            <span>{t("man.date")}</span>
            <input
              type="date"
              value={date || row?.date || ""}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <label className="field">
            <span>{t("wk.duration")}</span>
            <input value={duration} onChange={(event) => setDuration(event.target.value)} />
          </label>
          <label className="field">
            <span>{t("race.distance")}</span>
            <input
              value={distance || (row?.distanceKm != null ? String(row.distanceKm) : "")}
              onChange={(event) => setDistance(event.target.value)}
            />
          </label>
          <label className="field">
            <span>{t("race.elevation")}</span>
            <input
              value={elevation || (row?.elevationGainM != null ? String(row.elevationGainM) : "")}
              onChange={(event) => setElevation(event.target.value)}
            />
          </label>
        </>
      ) : null}
      <div className="wrap">
        {SPORTS.map((item) => (
          <button
            key={item}
            type="button"
            className={sport === item ? "pill sel" : "pill"}
            onClick={() => setSport(item)}
          >
            {t(`race.${item}`)}
          </button>
        ))}
      </div>
      <p className="ey">{t("race.loading")}</p>
      <div className="wrap">
        {LOADING.map((item) => (
          <button
            key={item}
            type="button"
            className={(row?.carbLoading ?? loading) === item ? "pill sel" : "pill"}
            onClick={() => setLoading(item)}
          >
            {t(item === "NONE" ? "race.none" : item === "TWO_DAY" ? "race.two" : "race.one")}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={showMulti ? "choice sel" : "choice"}
        onClick={() => setMulti(!showMulti)}
      >
        {t("race.multi")} {showMulti ? "✓" : ""}
      </button>
      {showMulti ? (
        <>
          <p className="ey">{t("race.stages")}</p>
          {(row?.stages.length
            ? row.stages.map((stage) => ({
                name: String(stage.index + 1),
                date: stage.date ?? "",
                start: formatClock(stage.startAt, locale, zone),
                duration: formatDuration(stage.estimatedDurationMin),
              }))
            : stages
          ).map((stage, index) => (
            <div key={index} className="cd">
              <b>{t("race.stage", { n: index + 1 })}</b>
              <p className="mu m">
                {stage.date} {stage.start} · {stage.duration}
              </p>
            </div>
          ))}
          <button
            type="button"
            className="choice"
            onClick={() =>
              setStages((current) => [
                ...current,
                { name: String(current.length + 1), date: "", start: "15:00", duration: "1:00" },
              ])
            }
          >
            {t("race.addStage")}
          </button>
          <p className="mu">{t("race.multiNote")}</p>
        </>
      ) : (
        <>
          <p className="ey">{t("race.aids")}</p>
          {aids.map((aid, index) => (
            <button
              key={index}
              type="button"
              className="choice"
              onClick={() => setEditingAid(index)}
            >
              <span>km {aid.km}</span>
              <span className="mu">
                {[
                  aid.water ? t("gear.water") : null,
                  aid.iso ? t("wk.isotonic") : null,
                  aid.gels ? t("race.gels") : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </button>
          ))}
          <button
            type="button"
            className="choice"
            onClick={() =>
              setAids((current) => [...current, { km: "", water: true, iso: false, gels: false }])
            }
          >
            {t("race.addAid")}
          </button>
        </>
      )}
      {editingAid != null && aids[editingAid] ? (
        <AidEditor
          km={aids[editingAid].km}
          water={aids[editingAid].water}
          iso={aids[editingAid].iso}
          gels={aids[editingAid].gels}
          onChange={(next) =>
            setAids((current) => current.map((item, index) => (index === editingAid ? next : item)))
          }
          onClose={() => setEditingAid(null)}
        />
      ) : null}
      {error ? <ErrorText code={error} /> : null}
      <button type="button" className="bt" disabled={busy} onClick={() => void save()}>
        {t("race.save")}
      </button>
    </Screen>
  );
}

function AidEditor({
  km,
  water,
  iso,
  gels,
  onChange,
  onClose,
}: {
  km: string;
  water: boolean;
  iso: boolean;
  gels: boolean;
  onChange: (next: { km: string; water: boolean; iso: boolean; gels: boolean }) => void;
  onClose: () => void;
}) {
  const { t } = useApp();
  return (
    <div className="cd">
      <p className="ey">{t("race.addAid")}</p>
      <label className="field">
        <span>{t("race.km")}</span>
        <input
          value={km}
          onChange={(event) => onChange({ km: event.target.value, water, iso, gels })}
        />
      </label>
      <p className="ey">{t("race.offers")}</p>
      <button
        type="button"
        className={water ? "pill sel" : "pill"}
        onClick={() => onChange({ km, water: !water, iso, gels })}
      >
        {t("gear.water")}
      </button>
      <button
        type="button"
        className={iso ? "pill sel" : "pill"}
        onClick={() => onChange({ km, water, iso: !iso, gels })}
      >
        {t("wk.isotonic")}
      </button>
      <button
        type="button"
        className={gels ? "pill sel" : "pill"}
        onClick={() => onChange({ km, water, iso, gels: !gels })}
      >
        {t("race.gels")}
      </button>
      <button type="button" className="bt" onClick={onClose}>
        {t("common.save")}
      </button>
    </div>
  );
}

export function StrategyScreen({ id }: { id: string }) {
  const { token, t } = useApp();
  const race = useGet(token ? `/races/${id}` : null, parseRace);
  const [picked, setPicked] = useState<string | null>(null);
  const [km, setKm] = useState("");
  if (!token)
    return (
      <Screen>
        <NeedSignIn />
      </Screen>
    );
  if (race.status !== "ready")
    return (
      <Screen>{race.status === "error" ? <ErrorText code={race.code} /> : <LoadingText />}</Screen>
    );
  const row = race.data.race;
  const plans = row.strategies;
  const chosen = picked ?? plans.find((plan) => plan.chosen)?.id ?? null;
  return (
    <Screen
      kicker={t("race.strategy")}
      title={plans.length > 1 ? t("race.pick") : t("race.your")}
      back="/home"
    >
      <Preview />
      {plans.length === 0 ? (
        <>
          <h2 className="h2">{t("race.where")}</h2>
          <p>{t("race.whereHelp")}</p>
          {row.aidStations.map((aid) => (
            <div key={aid.id} className="choice">
              <span>km {aid.kmMark}</span>
              <span className="mu">{offer(aid, t)}</span>
            </div>
          ))}
          <label className="field">
            <span>{t("race.km")}</span>
            <input value={km} onChange={(event) => setKm(event.target.value)} />
          </label>
          <p className="mu">{t("race.noPlans")}</p>
          <button
            type="button"
            className="bt"
            onClick={() => {
              void apiSend(`/races/${id}/strategies/generate`, {
                method: "POST",
                token,
                parse: parseRace,
              }).then(() => window.location.reload());
            }}
          >
            {t("race.generate")}
          </button>
        </>
      ) : (
        <div className={plans.length > 1 ? "carousel" : undefined}>
          {plans.map((plan, index) => {
            const points = asRecord(plan.refillPoints);
            const kms = asArray(points?.km)
              .map((value) => String(value))
              .join(" · ");
            return (
              <article
                key={plan.id}
                className="tile"
                style={{ minWidth: plans.length > 1 ? 260 : "auto" }}
              >
                <b>{plan.description || `${t("race.your")} ${index + 1}`}</b>
                <p className="ey">{t("race.refill")}</p>
                <p className="m">{kms || "—"}</p>
                <p className="ey">{t("home.carry")}</p>
                <CarryList plan={plan.carryList} />
                <button
                  type="button"
                  className={chosen === plan.id ? "bt" : "choice"}
                  onClick={() => {
                    setPicked(plan.id);
                    void apiSend(`/races/${id}/strategies/${plan.id}/choose`, {
                      method: "POST",
                      token,
                      parse: parseRace,
                    });
                  }}
                >
                  {plan.chosen ? t("race.chosen") : t("race.use")}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </Screen>
  );
}

function offer(
  aid: { hasWater: boolean; hasIsotonic: boolean; hasGels: boolean },
  t: ReturnType<typeof useApp>["t"],
) {
  return [
    aid.hasWater ? t("gear.water") : null,
    aid.hasIsotonic ? t("wk.isotonic") : null,
    aid.hasGels ? t("race.gels") : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function LoadingScreen({ id, day }: { id: string; day: string }) {
  const { token, t, locale, me } = useApp();
  const zone = me?.user.timezone ?? "UTC";
  const rehearsal = day === "rehearsal";
  const race = useGet(token ? `/races/${id}` : null, parseRace);
  const loading = useGet(token && !rehearsal ? `/races/${id}/loading/${day}` : null, parseLoading);
  const [dismissed, setDismissed] = useState(false);
  if (!token)
    return (
      <Screen>
        <NeedSignIn />
      </Screen>
    );
  if (race.status === "error")
    return (
      <Screen>
        <ErrorText code={race.code} />
      </Screen>
    );
  if (!rehearsal && loading.status === "error")
    return (
      <Screen>
        <ErrorText code={loading.code} />
      </Screen>
    );
  if (race.status !== "ready" || (!rehearsal && loading.status !== "ready"))
    return (
      <Screen>
        <LoadingText />
      </Screen>
    );
  const payload = !rehearsal && loading.status === "ready" ? loading.data.loadingDay : null;
  const parsed = mealsOf(payload?.meals);
  const foods = asArray(asRecord(payload?.meals)?.exampleFoodList);
  return (
    <Screen title={rehearsal ? t("load.rehearsal") : t("load.title")} back="/calendar">
      {rehearsal ? (
        <>
          <p className="ey">{t("load.what")}</p>
          <p>{t("load.copy.rehearsal")}</p>
          <p>{t("load.rehearsalBody")}</p>
          {race.data.race.rehearsal?.date ? (
            <p className="m">{formatDay(race.data.race.rehearsal.date, locale, zone)}</p>
          ) : null}
          <p className="ey">{t("load.targets")}</p>
          {race.data.race.loadingDays.length === 0 ? (
            <p className="mu">{t("common.notSet")}</p>
          ) : (
            race.data.race.loadingDays.map((dayRow) => (
              <div key={dayRow.id} className="cd">
                <div className="rw" style={{ justifyContent: "space-between" }}>
                  <b>{dayRow.day === "D_MINUS_2" ? t("load.copy.d2") : t("load.copy.d1")}</b>
                  <span className="m">{formatNumber(dayRow.targetCarbsG, locale)} g</span>
                </div>
                {dayRow.date ? <p className="mu">{formatDay(dayRow.date, locale, zone)}</p> : null}
              </div>
            ))
          )}
          <p className="ey">{t("load.guidance")}</p>
          <p>{t("load.fiber")}</p>
          <p>{t("load.dinner")}</p>
          <p>{t("load.morning")}</p>
          {dismissed || race.data.race.rehearsal?.status === "DISMISSED" ? (
            <>
              <p className="mu">{t("load.dismissHelp")}</p>
              <button
                type="button"
                className="bt"
                onClick={() => {
                  void apiSend(`/races/${id}/rehearsal/restore`, {
                    method: "POST",
                    token,
                    parse: parseRace,
                  }).then(() => {
                    setDismissed(false);
                    window.location.reload();
                  });
                }}
              >
                {t("load.restore")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="gh"
              onClick={() => {
                void apiSend(`/races/${id}/rehearsal/dismiss`, {
                  method: "POST",
                  token,
                  parse: parseRace,
                }).then(() => setDismissed(true));
              }}
            >
              {t("load.dismiss")}
            </button>
          )}
          <Preview />
        </>
      ) : payload ? (
        <>
          <p className="ey">{t("load.dayTarget")}</p>
          <p className="big">
            {formatNumber(payload.targetCarbsG, locale)}
            <span style={{ fontSize: 18 }}> g</span>
          </p>
          <p className="mu">{t("load.perKg", { g: payload.gPerKg })}</p>
          <p className="mu">{day === "d-2" ? t("load.copy.d2") : t("load.copy.d1")}</p>
          <p className="ey">{t("load.guidance")}</p>
          <p>{t("load.fiber")}</p>
          {day === "d-1" ? <p>{t("load.dinner")}</p> : null}
          <p>{t("load.morning")}</p>
          {parsed.guidance.map((line) => (
            <p key={line} className="mu">
              {line}
            </p>
          ))}
          <p className="ey">{t("load.meals")}</p>
          {parsed.meals.map((meal) => (
            <div key={meal.name} className="cd">
              <div className="rw" style={{ justifyContent: "space-between" }}>
                <b>{meal.name}</b>
                <span className="m">{meal.carbsG ?? "—"} g</span>
              </div>
              <p className="mu">{t("load.example")}</p>
              {meal.example ? (
                <p>
                  {meal.example}
                  {meal.portionG != null ? ` · ${meal.portionG} g` : ""}
                </p>
              ) : null}
              {meal.fodmap ? (
                <span className="ch cu">
                  {meal.fodmap === "LOW" ? t("load.low") : t("load.high")}
                </span>
              ) : null}
            </div>
          ))}
          <p className="note">{t("load.fodmap")}</p>
          {foods.map((food) => {
            const record = asRecord(food);
            const fodmap = asString(record?.fodmap);
            return (
              <div
                key={asString(record?.name) ?? asString(record?.fdcId)}
                className="rw"
                style={{ justifyContent: "space-between" }}
              >
                <span>{asString(record?.name)}</span>
                <span className="ch cu">{fodmap === "LOW" ? t("load.low") : t("load.high")}</span>
              </div>
            );
          })}
        </>
      ) : (
        <p>{t("common.empty")}</p>
      )}
    </Screen>
  );
}

export function BreakfastScreen({ id }: { id: string }) {
  const { token, t, locale } = useApp();
  const breakfast = useGet(token ? `/races/${id}/breakfast` : null, parseBreakfast);
  if (!token)
    return (
      <Screen title={t("brk.title")}>
        <NeedSignIn />
      </Screen>
    );
  if (breakfast.status === "error")
    return (
      <Screen title={t("brk.title")} back="/calendar">
        <ErrorText code={breakfast.code} />
      </Screen>
    );
  if (breakfast.status !== "ready")
    return (
      <Screen>
        <LoadingText />
      </Screen>
    );
  const row = breakfast.data;
  const missing = t("common.notSet");
  const amount = (value: number | null) => (value == null ? missing : formatNumber(value, locale));
  return (
    <Screen title={t("brk.title")} back="/calendar">
      <p className="ey">{t("brk.carbs")}</p>
      <p className="big">
        {row.carbsG == null ? missing : formatNumber(row.carbsG, locale)}
        <span style={{ fontSize: 18 }}> g</span>
      </p>
      <p className="mu">{row.gPerKg == null ? missing : t("load.perKg", { g: row.gPerKg })}</p>
      <p>{row.note}</p>
      <p>{t("brk.early")}</p>
      <p>{t("brk.alarm")}</p>
      <BigStats
        items={[
          { value: amount(row.fluidMl), label: t("brk.fluid") },
          { value: amount(row.sodiumMg), label: t("brk.sodium") },
        ]}
      />
      <div className="cd">
        <div className="rw" style={{ justifyContent: "space-between" }}>
          <span>{t("brk.isotonic")}</span>
          <b className="m">{amount(row.isotonicMl)} ml</b>
        </div>
        <div className="rw" style={{ justifyContent: "space-between" }}>
          <span>{t("brk.water")}</span>
          <b className="m">{amount(row.waterMl)} ml</b>
        </div>
      </div>
      <p className="preview">{t("brk.derived")}</p>
    </Screen>
  );
}

function ArrivalLine({ source }: { source: "PLATFORM_WEBHOOK" | "FALLBACK_TIMER" | null }) {
  const { t } = useApp();
  if (!source) return null;
  return <p className="mu">{source === "FALLBACK_TIMER" ? t("rec.fallback") : t("rec.webhook")}</p>;
}

export function RecoveryScreen({ raceId, stageId }: { raceId: string; stageId: string }) {
  const { token, t, locale } = useApp();
  const recovery = useGet(token ? `/races/stages/${stageId}/recovery` : null, parseRecovery);
  const race = useGet(token ? `/races/${raceId}` : null, parseRace);
  const [sensitive, setSensitive] = useState<boolean | null>(null);
  if (!token)
    return (
      <Screen>
        <NeedSignIn />
      </Screen>
    );
  if (recovery.status === "error")
    return (
      <Screen back={`/races/${raceId}/edit`}>
        <ErrorText code={recovery.code} />
      </Screen>
    );
  if (recovery.status !== "ready")
    return (
      <Screen>
        <LoadingText />
      </Screen>
    );
  const row = recovery.data.recovery;
  if (!row)
    return (
      <Screen title={t("rec.title")} back="/calendar">
        <p>{t("rec.missing")}</p>
      </Screen>
    );
  const liquids = asRecord(row.meals)?.liquidsAndGelsOnly === true;
  const on = sensitive ?? row.sensitiveStomach;
  return (
    <Screen title={t("rec.title")} back="/calendar">
      <p className="ey">{t("rec.gap")}</p>
      <RecoveryBlurb
        gapCase={row.gapCase}
        gapMin={row.gapMin}
        carbsTargetG={row.carbsTargetG}
        meals={row.meals}
      />
      <p>{t("rec.push")}</p>
      <p className="mu">{t("rec.keep")}</p>
      {race.status === "ready" ? (
        <ArrivalLine
          source={
            race.data.race.stages.find((stage) => stage.id === stageId)?.arrivalSource ?? null
          }
        />
      ) : null}
      <BigStats
        items={[
          { value: formatNumber(row.carbsTargetG, locale), label: t("rec.carbs") },
          {
            value: row.proteinTargetG != null ? formatNumber(row.proteinTargetG, locale) : "—",
            label: t("rec.protein"),
          },
          {
            value: row.fluidTargetMl != null ? formatNumber(row.fluidTargetMl, locale) : "—",
            label: t("rec.fluid"),
          },
        ]}
      />
      <p className="mu">
        {t("rec.sodium")} {row.sodiumTargetMg ?? "—"} mg
      </p>
      {liquids ? <p className="ch ci">{t("rec.liquids")}</p> : null}
      <button
        type="button"
        className={on ? "choice sel" : "choice"}
        onClick={() => {
          const next = !on;
          setSensitive(next);
          void apiSend(`/races/stages/${stageId}/recovery`, {
            method: "PATCH",
            token,
            body: { sensitiveStomach: next },
            parse: parseRecovery,
          });
        }}
      >
        <span>
          <b>{t("rec.sensitive")}</b>
          <span className="mu">{t("rec.sensitiveHelp")}</span>
        </span>
      </button>
      <Preview />
      <p className="note">{t("load.fodmap")}</p>
    </Screen>
  );
}

export function SweatScreen({ id }: { id: string }) {
  const { token, t, locale, me } = useApp();
  const zone = me?.user.timezone ?? "UTC";
  const test = useGet(token ? `/sweat-tests/${id}` : null, parseSweatTest);
  const [pre, setPre] = useState("");
  const [post, setPost] = useState("");
  const [fluid, setFluid] = useState("");
  const [urine, setUrine] = useState("0");
  const [minutes, setMinutes] = useState("60");
  const [busy, setBusy] = useState(false);
  if (!token)
    return (
      <Screen>
        <NeedSignIn />
      </Screen>
    );
  if (test.status === "error")
    return (
      <Screen>
        <ErrorText code={test.code} />
      </Screen>
    );
  if (test.status !== "ready")
    return (
      <Screen>
        <LoadingText />
      </Screen>
    );
  const row = test.data.sweatTest;
  const done = row.status === "COMPLETED";
  const preValue = pre || (row.preWeightKg != null ? String(row.preWeightKg) : "");
  const postValue = post || (row.postWeightKg != null ? String(row.postWeightKg) : "");
  const fluidValue = fluid || (row.fluidMl != null ? String(row.fluidMl) : "");
  const urineValue = urine || (row.urineMl != null ? String(row.urineMl) : "0");
  return (
    <Screen kicker={t("type.sweat")} title={done ? t("sweat.rate") : t("sweat.how")} back="/home">
      <Preview />
      {row.movedFrom ? (
        <p className="mu">{t("sweat.moved", { date: formatDay(row.movedFrom, locale, zone) })}</p>
      ) : null}
      {done ? (
        <>
          <p className="big">
            {row.sweatRateLPerH != null ? formatNumber(row.sweatRateLPerH, locale, 2) : "—"}
            <span style={{ fontSize: 18 }}> L/h</span>
          </p>
          <p className="mu m">{SWEAT_RATE_FORMULA}</p>
          <div className="bg">
            <div>
              <b>{row.preWeightKg ?? "—"}</b>
              <span>{t("sweat.pre")}</span>
            </div>
            <div>
              <b>{row.postWeightKg ?? "—"}</b>
              <span>{t("sweat.post")}</span>
            </div>
            <div>
              <b>{row.fluidMl ?? "—"}</b>
              <span>{t("sweat.fluidIn")}</span>
            </div>
          </div>
          <p>{t("sweat.noCompare")}</p>
          <Link href="/home" className="bt">
            {t("common.done")}
          </Link>
        </>
      ) : (
        <>
          {row.status === "NOT_COMPLETED" ? <p>{t("sweat.notDoneState")}</p> : null}
          {row.status === "AWAITING_DATA" ? <p>{t("sweat.awaiting")}</p> : null}
          <p>{t("sweat.weighHelp")}</p>
          <label className="field">
            <span>{t("sweat.pre")}</span>
            <input value={preValue} onChange={(event) => setPre(event.target.value)} inputMode="decimal" />
          </label>
          <label className="field">
            <span>{t("sweat.post")}</span>
            <input value={postValue} onChange={(event) => setPost(event.target.value)} inputMode="decimal" />
          </label>
          <label className="field">
            <span>{t("sweat.fluidIn")}</span>
            <input value={fluidValue} onChange={(event) => setFluid(event.target.value)} inputMode="numeric" />
          </label>
          <label className="field">
            <span>{t("sweat.urine")}</span>
            <input value={urineValue} onChange={(event) => setUrine(event.target.value)} inputMode="numeric" />
          </label>
          <label className="field">
            <span>{t("sweat.minutes")}</span>
            <input value={minutes} onChange={(event) => setMinutes(event.target.value)} inputMode="numeric" />
          </label>
          <button
            type="button"
            className="bt"
            disabled={busy}
            onClick={() => {
              const preWeightKg = Number(preValue);
              const postWeightKg = Number(postValue);
              const fluidMl = Number(fluidValue);
              const urineMl = Number(urineValue || "0");
              const durationMin = Number(minutes || "60");
              if (
                !Number.isFinite(preWeightKg) ||
                preWeightKg <= 0 ||
                !Number.isFinite(postWeightKg) ||
                postWeightKg <= 0 ||
                !Number.isFinite(fluidMl) ||
                fluidMl < 0 ||
                !Number.isFinite(durationMin) ||
                durationMin <= 0
              ) {
                return;
              }
              setBusy(true);
              void apiSend(`/sweat-tests/${id}/record`, {
                method: "POST",
                token,
                body: { preWeightKg, postWeightKg, fluidMl, urineMl, durationMin },
                parse: parseSweatTest,
              }).then(() => window.location.reload());
            }}
          >
            {t("sweat.saveResult")}
          </button>
          <button
            type="button"
            className="gh"
            disabled={busy || row.status === "NOT_COMPLETED"}
            onClick={() => {
              setBusy(true);
              void apiSend(`/sweat-tests/${id}/not-completed`, {
                method: "POST",
                token,
                parse: parseSweatTest,
              }).then(() => window.location.reload());
            }}
          >
            {t("sweat.notDone")}
          </button>
        </>
      )}
    </Screen>
  );
}

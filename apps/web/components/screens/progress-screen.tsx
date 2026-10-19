"use client";

import { SymptomColor } from "@carbadapt/design-tokens";
import { useApp, useGet } from "@/components/app-state";
import { ErrorText, LoadingText, NeedSignIn, Screen } from "@/components/ui";
import { addDays, todayKey } from "@/lib/format";
import { parseProgress, parseWorkouts } from "@/lib/parse";

type Symptom = "NONE" | "MILD" | "MODERATE" | "SEVERE";

const ORDER: Symptom[] = ["NONE", "MILD", "MODERATE", "SEVERE"];
const COLOR: Record<Symptom, string> = {
  NONE: SymptomColor.None,
  MILD: SymptomColor.Mild,
  MODERATE: SymptomColor.Moderate,
  SEVERE: SymptomColor.Severe,
};

function worst(values: (Symptom | null)[]): Symptom | null {
  let best = -1;
  let found: Symptom | null = null;
  for (const value of values) {
    if (!value) continue;
    const rank = ORDER.indexOf(value);
    if (rank > best) {
      best = rank;
      found = value;
    }
  }
  return found;
}

export function ProgressScreen() {
  const { token, me, t } = useApp();
  const zone = me?.user.timezone ?? "UTC";
  const from = addDays(todayKey(zone), -180);
  const to = todayKey(zone);
  const progress = useGet(token ? "/achievements/progress" : null, parseProgress);
  const workouts = useGet(token ? `/workouts?from=${from}&to=${to}` : null, parseWorkouts);

  if (!token)
    return (
      <Screen title={t("prog.title")} tabs>
        <NeedSignIn />
      </Screen>
    );
  if (progress.status === "loading" || progress.status === "idle")
    return (
      <Screen tabs>
        <LoadingText />
      </Screen>
    );
  if (progress.status === "error")
    return (
      <Screen tabs>
        <ErrorText code={progress.code} />
      </Screen>
    );

  const duration = new Map<string, number>();
  if (workouts.status === "ready") {
    for (const workout of workouts.data.workouts) {
      if (workout.durationMin) duration.set(workout.id, workout.durationMin);
    }
  }
  const points = progress.data.sessions
    .map((session) => {
      const minutes = duration.get(session.workoutId);
      const gh =
        minutes && session.intakeCarbsG != null
          ? Math.round(session.intakeCarbsG / (minutes / 60))
          : null;
      return {
        ...session,
        gh,
        symptom: worst([session.symptomUpper, session.symptomLower, session.symptomSystemic]),
      };
    })
    .filter((session) => session.gh != null)
    .slice(-12);
  const max = Math.max(40, ...points.map((point) => point.gh ?? 0));

  return (
    <Screen title={t("prog.title")} tabs>
      <p className="ey">{t("prog.now")}</p>
      <p className="big">
        {progress.data.toleratedGh ?? "—"}
        <span style={{ fontSize: 18 }}> g/h</span>
      </p>
      <div className="cd">
        <p className="ey">{t("prog.streak")}</p>
        <p className="mu">{t("prog.streakHelp")}</p>
        <p className="m" style={{ fontSize: 28 }}>
          {progress.data.streak}
        </p>
      </div>
      <p className="ey">{t("prog.chart")}</p>
      {points.length === 0 ? (
        <p className="mu">{t("prog.empty")}</p>
      ) : (
        <svg className="chart" viewBox="0 0 320 180" role="img">
          {[0, 0.5, 1].map((fraction) => {
            const y = 160 - fraction * 140;
            return (
              <g key={fraction}>
                <line x1="28" x2="320" y1={y} y2={y} stroke="var(--ln)" />
                <text x="0" y={y - 4} fill="currentColor" fontSize="10" opacity="0.6">
                  {Math.round(max * fraction)}
                </text>
              </g>
            );
          })}
          {points.map((point, index) => {
            const x = 36 + index * (270 / Math.max(points.length - 1, 1));
            const y = 160 - ((point.gh ?? 0) / max) * 140;
            const symptom = point.symptom ?? "NONE";
            return (
              <a key={point.logId} href={`/workouts/${point.workoutId}`}>
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill={COLOR[symptom]}
                  stroke="var(--cd)"
                  strokeWidth="2"
                >
                  <title>{point.name}</title>
                </circle>
              </a>
            );
          })}
        </svg>
      )}
      <div className="legend">
        {ORDER.map((symptom) => (
          <span key={symptom}>
            <i className="dot" style={{ background: COLOR[symptom] }} />
            {t(`symptom.${symptom}`)}
          </span>
        ))}
      </div>
    </Screen>
  );
}

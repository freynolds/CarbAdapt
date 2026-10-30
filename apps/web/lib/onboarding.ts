export type OnboardingAnswers = {
  sport: "cycling" | "running" | "tri" | null;
  goal: "race" | "general" | null;
  raceDate: string;
  distance: string;
  hours: string;
  longest: string;
  weight: string;
  effort: "power" | "hr" | "unsure" | null;
  ftp: string;
  maxHr: string;
  carbKnown: "hour" | "total" | "unknown" | null;
  carbs: string;
  carbHours: string;
  gels: string;
  bottles: string;
  iso: boolean;
  fuels: string[];
  carbSplit: "BOTTLES_THEN_GELS" | "MOSTLY_WATER" | "MORE_MIX";
  fluidPlan: "MORE_BOTTLES" | "REFILL";
  sweat: "estimate" | "test" | null;
  gut: string[];
  mode: "GUT_TRAINING" | "FUEL_MY_WORKOUTS" | null;
  brief: "evening" | "morning" | null;
};

const EMPTY: OnboardingAnswers = {
  sport: null,
  goal: null,
  raceDate: "",
  distance: "",
  hours: "",
  longest: "",
  weight: "",
  effort: null,
  ftp: "",
  maxHr: "",
  carbKnown: null,
  carbs: "",
  carbHours: "",
  gels: "2",
  bottles: "1",
  iso: true,
  fuels: [],
  carbSplit: "BOTTLES_THEN_GELS",
  fluidPlan: "MORE_BOTTLES",
  sweat: null,
  gut: [],
  mode: null,
  brief: null,
};

const KEY = "carbadapt.onboarding";
const ANON_KEY = "carbadapt.anon";

export function anonId(): string {
  if (typeof window === "undefined") return "";
  const existing = window.sessionStorage.getItem(ANON_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.sessionStorage.setItem(ANON_KEY, next);
  return next;
}

/** Manual workout form has no sport field. Cycling and running come from onboarding. Triathlon has no Sport value. */
export function manualSport(answers: OnboardingAnswers): "CYCLING" | "RUNNING" | "OTHER" {
  if (answers.sport === "cycling") return "CYCLING";
  if (answers.sport === "running") return "RUNNING";
  return "OTHER";
}

export function readAnswers(): OnboardingAnswers {
  if (typeof window === "undefined") return { ...EMPTY, fuels: [], gut: [] };
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return { ...EMPTY, fuels: [], gut: [] };
    const parsed = JSON.parse(raw) as Partial<OnboardingAnswers>;
    return {
      ...EMPTY,
      ...parsed,
      fuels: Array.isArray(parsed.fuels) ? parsed.fuels : [],
      gut: Array.isArray(parsed.gut) ? parsed.gut : [],
    };
  } catch {
    return { ...EMPTY, fuels: [], gut: [] };
  }
}

export function saveAnswers(patch: Partial<OnboardingAnswers>): OnboardingAnswers {
  const next = { ...readAnswers(), ...patch };
  window.sessionStorage.setItem(KEY, JSON.stringify(next));
  const id = anonId();
  if (id) {
    void fetch("/backend/onboarding/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonId: id, answers: next }),
    }).catch(() => undefined);
  }
  return next;
}

/** Rough onboarding estimate printed in the design: gels × 25 g + bottles × 45 g. */
export function roughCarbsPerHour(answers: OnboardingAnswers): number | null {
  if (answers.carbKnown === "hour") {
    const value = Number(answers.carbs);
    return Number.isFinite(value) && answers.carbs !== "" ? value : null;
  }
  if (answers.carbKnown === "total") {
    const total = Number(answers.carbs);
    const hours = Number(answers.carbHours);
    if (!Number.isFinite(total) || !Number.isFinite(hours) || hours <= 0) return null;
    return Math.round(total / hours);
  }
  if (answers.carbKnown === "unknown") return null;
  return null;
}

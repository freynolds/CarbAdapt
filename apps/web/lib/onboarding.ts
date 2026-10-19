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
  sweat: null,
  gut: [],
  mode: null,
  brief: null,
};

const KEY = "carbadapt.onboarding";

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
  if (answers.carbKnown === "unknown") {
    const gels = Number(answers.gels);
    const bottles = Number(answers.bottles);
    if (!Number.isFinite(gels) || !Number.isFinite(bottles)) return null;
    return gels * 25 + bottles * 45;
  }
  return null;
}

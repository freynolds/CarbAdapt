export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function displayJson(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value == null) return "—";
  try {
    return JSON.stringify(value);
  } catch {
    return "—";
  }
}

export type CarryItem = {
  name: string;
  productName: string | null;
  containerName: string | null;
  containerId: string | null;
  productId: string | null;
  servings: number | null;
  unit: "serving" | "scoop" | "unit" | null;
  volumeMl: number | null;
  fluidMl: number | null;
  carbsG: number | null;
  sodiumMg: number | null;
  role: string | null;
  kind: "bottle" | "gel" | "solid" | "drink";
};

export function carryItems(value: unknown): CarryItem[] {
  const record = asRecord(value);
  return asArray(record?.items).flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const containerName = asString(row.containerName);
    const productName = asString(row.productName);
    const name = asString(row.name) ?? containerName ?? productName ?? "—";
    const role = asString(row.role);
    const kind: CarryItem["kind"] =
      role === "gel" || name.toLowerCase().includes("gel")
        ? "gel"
        : role === "solid"
          ? "solid"
          : role === "drink_mix"
            ? "drink"
            : "bottle";
    const unit = asString(row.unit);
    return [
      {
        name: containerName ?? name,
        productName,
        containerName,
        containerId: asString(row.containerId),
        productId: asString(row.productId),
        servings: asNumber(row.servings),
        unit: unit === "serving" || unit === "scoop" || unit === "unit" ? unit : null,
        volumeMl: asNumber(row.volumeMl),
        fluidMl: asNumber(row.fluidMl),
        carbsG: asNumber(row.carryCarbsG) ?? asNumber(row.carbsPerServing),
        sodiumMg: asNumber(row.sodiumMg),
        role,
        kind,
      },
    ];
  });
}

export type OccasionRow = {
  key: string;
  offsetMin: number | null;
  carbsG: number | null;
  proteinG: number | null;
  form: string | null;
};

export function occasionsOf(value: unknown): OccasionRow[] {
  const record = asRecord(value);
  return asArray(record?.occasions).flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const key = asString(row.key);
    if (!key) return [];
    return [
      {
        key,
        offsetMin: asNumber(row.offsetMin),
        carbsG: asNumber(row.carbsG),
        proteinG: asNumber(row.proteinG),
        form: asString(row.form),
      },
    ];
  });
}

export type ScheduleMark = {
  offsetMin: number;
  kind: "water" | "isotonic" | "gel" | "solid";
  carbsG: number | null;
};

const SCHEDULE_KIND = new Set<ScheduleMark["kind"]>(["water", "isotonic", "gel", "solid"]);

/** Intake marks stored on a fueling plan. Unknown kinds are omitted. */
export function scheduleOf(value: unknown): ScheduleMark[] {
  return asArray(value).flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const offsetMin = asNumber(row.offsetMin);
    const kind = asString(row.kind);
    if (offsetMin == null || !kind || !SCHEDULE_KIND.has(kind as ScheduleMark["kind"])) return [];
    return [{ offsetMin, kind: kind as ScheduleMark["kind"], carbsG: asNumber(row.carbsG) }];
  });
}

export type BlockRow = { name: string; durationMin: number; zone: string | null };

export function blocksOf(value: unknown): BlockRow[] {
  return asArray(value).flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const name = asString(row.name);
    const durationMin = asNumber(row.durationMin);
    if (!name || durationMin == null) return [];
    return [{ name, durationMin, zone: asString(row.zone) }];
  });
}

export type MealRow = {
  name: string;
  carbsG: number | null;
  proteinG: number | null;
  fodmap: string | null;
  example: string | null;
  portionG: number | null;
};

export function mealsOf(value: unknown): {
  meals: MealRow[];
  guidance: string[];
  fodmapNote: string | null;
  exampleFoods: string | null;
} {
  const record = asRecord(value);
  const meals = asArray(record?.meals).flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const example = asRecord(row.example);
    return [
      {
        name: asString(row.name) ?? "—",
        carbsG: asNumber(row.carbsG),
        proteinG: asNumber(row.proteinG),
        fodmap: asString(example?.fodmap),
        example: asString(example?.name),
        portionG: asNumber(example?.portionG),
      },
    ];
  });
  return {
    meals,
    guidance: asArray(record?.guidance).flatMap((item) => (typeof item === "string" ? [item] : [])),
    fodmapNote: asString(record?.fodmapNote),
    exampleFoods: asString(record?.exampleFoods),
  };
}

export function intakesOf(
  value: unknown,
): { offsetMin: number; carbsG: number | null; proteinG: number | null; form: string | null }[] {
  const record = asRecord(value);
  return asArray(record?.intakes).flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const offsetMin = asNumber(row.offsetMin);
    if (offsetMin == null) return [];
    return [
      {
        offsetMin,
        carbsG: asNumber(row.carbsG),
        proteinG: asNumber(row.proteinG),
        form: asString(row.form),
      },
    ];
  });
}

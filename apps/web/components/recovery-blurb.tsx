"use client";

import type { MessageId } from "@carbadapt/i18n";
import { useApp } from "@/components/app-state";
import { formatNumber } from "@/lib/format";
import { asRecord, mealsOf, occasionsOf } from "@/lib/json";

export function recoveryWhy(
  t: (id: MessageId, vars?: Record<string, string | number>) => string,
  gapCase: string,
  liquids: boolean,
): string {
  if (liquids) return t("rec.why.SHORT");
  const key = `rec.why.${gapCase}` as MessageId;
  return t(key);
}

export function RecoveryBlurb({
  gapCase,
  gapMin,
  carbsTargetG,
  meals,
}: {
  gapCase: string;
  gapMin: number | null;
  carbsTargetG: number;
  meals: unknown;
}) {
  const { t, locale } = useApp();
  const liquids = asRecord(meals)?.liquidsAndGelsOnly === true;
  const occasions = occasionsOf(meals);
  const named = mealsOf(meals);
  const why = recoveryWhy(t, gapCase, liquids);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <p className="m">
        {t(`rec.${gapCase}` as MessageId)}
        {gapMin != null ? ` · ${gapMin} min` : ""}
      </p>
      <p>{why}</p>
      <p className="m">
        {formatNumber(carbsTargetG, locale)} g
      </p>
      {occasions.map((occasion) => (
        <div key={occasion.key} className="rw" style={{ justifyContent: "space-between" }}>
          <span>
            {occasion.key === "middle"
              ? t("rec.middle", { min: occasion.offsetMin ?? 0 })
              : occasion.key === "first"
                ? t("rec.first")
                : occasion.key === "pre_start"
                  ? t("rec.preStart")
                  : t("rec.day")}
            {" · "}
            {occasion.form === "drink"
              ? t("rec.drink")
              : occasion.form === "snack"
                ? t("rec.snack")
                : t("rec.meal")}
          </span>
          <span className="m">
            {occasion.carbsG == null ? t("common.notSet") : `${formatNumber(occasion.carbsG, locale)} g`}
          </span>
        </div>
      ))}
      {occasions.length === 0
        ? named.meals.map((meal) => (
            <div key={meal.name} className="rw" style={{ justifyContent: "space-between" }}>
              <span>{meal.name}</span>
              <span className="m">
                {meal.carbsG == null ? t("common.notSet") : `${formatNumber(meal.carbsG, locale)} g`}
              </span>
            </div>
          ))
        : null}
    </div>
  );
}

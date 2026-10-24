"use client";

import { HTTP_ERROR_MESSAGE, HttpErrorCode } from "@carbadapt/contracts";
import type { MessageId } from "@carbadapt/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useApp } from "@/components/app-state";
import { ApiError, apiSend } from "@/lib/api";
import { Icon, carryIconName, paintIcon } from "@/components/icons";
import { formatNumber } from "@/lib/format";
import { asRecord, asString, carryItems } from "@/lib/json";
import { parseMe } from "@/lib/parse";

export function Screen({
  title,
  kicker,
  tabs = false,
  back,
  action,
  lead,
  children,
  className,
}: {
  title?: string;
  kicker?: string;
  tabs?: boolean;
  back?: string;
  action?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const { t } = useApp();
  return (
    <div className={className ? `screen ${className}` : "screen"}>
      <div className="screen-body">
        {back || action ? (
          <div className="nav">
            {back ? <Link href={back}>‹ {t("common.back")}</Link> : <span />}
            {action}
          </div>
        ) : null}
        {lead}
        {kicker ? <p className="ey">{kicker}</p> : null}
        {title ? <h1 className="t">{title}</h1> : null}
        {children}
      </div>
      {tabs ? <TabBar /> : null}
    </div>
  );
}

const TABS: { href: string; id: MessageId; icon: "home" | "calendar" | "progress" | "profile" }[] =
  [
    { href: "/home", id: "common.home", icon: "home" },
    { href: "/calendar", id: "common.calendar", icon: "calendar" },
    { href: "/progress", id: "common.progress", icon: "progress" },
    { href: "/profile", id: "common.profile", icon: "profile" },
  ];

export function TabBar() {
  const pathname = usePathname();
  const { t } = useApp();
  return (
    <nav className="tb">
      {TABS.map((tab) => {
        const on =
          tab.href === "/home"
            ? pathname === "/home"
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link key={tab.href} href={tab.href} className={on ? "on" : undefined}>
            <Icon name={tab.icon} />
            {t(tab.id)}
          </Link>
        );
      })}
    </nav>
  );
}

export function Preview() {
  const { t } = useApp();
  return <p className="preview">{t("common.preview")}</p>;
}

export function NeedSignIn() {
  const { token, t, athletes, login } = useApp();
  if (token) return null;
  if (athletes.length === 0) {
    return (
      <div className="note">
        <b>{t("auth.login")}</b>
        {t("common.signInFirst")}
        <div>
          <Link href="/auth/magic">{t("auth.magic")}</Link>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p className="ey">{t("auth.pick")}</p>
      {athletes.map((athlete) => (
        <button
          key={athlete.athleteId}
          type="button"
          className="choice"
          onClick={() => void login(athlete.athleteId)}
        >
          <span>
            <b>{athlete.name ?? athlete.athleteId}</b>
            <span className="mu">
              {athlete.mode ? t(`mode.${athlete.mode}` as "mode.FUEL_MY_WORKOUTS") : athlete.email}
            </span>
          </span>
        </button>
      ))}
      <Link href="/auth/magic">{t("auth.magic")}</Link>
    </div>
  );
}

export function ErrorText({ code }: { code: HttpErrorCode }) {
  return <p className="mu">{HTTP_ERROR_MESSAGE[code]}</p>;
}

export function LoadingText() {
  const { t } = useApp();
  return <p className="mu">{t("common.loading")}</p>;
}

const CHIP: Record<string, string> = {
  BASE: "cb",
  THRESHOLD: "cth",
  VO2MAX: "cv",
  ANAEROBIC: "can",
  RECOVERY: "cr",
};

export function TypeChip({ type }: { type: string | null }) {
  const { t } = useApp();
  if (!type) return <span className="ch cu">{t("type.unstructured")}</span>;
  const key = `type.${type}` as MessageId;
  const label =
    key in
    {
      "type.BASE": 1,
      "type.THRESHOLD": 1,
      "type.VO2MAX": 1,
      "type.ANAEROBIC": 1,
      "type.RECOVERY": 1,
    }
      ? t(key)
      : type;
  return <span className={`ch ${CHIP[type] ?? "cu"}`}>{label}</span>;
}

export function BigStats({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="bg">
      {items.map((item) => (
        <div key={item.label}>
          <b>{item.value}</b>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function CarryList({
  plan,
  colors,
}: {
  plan: unknown;
  colors?: Map<string, string | null>;
}) {
  const { t, locale } = useApp();
  const items = carryItems(plan);
  const record = asRecord(plan);
  const carbStatus = asString(record?.carbStatus);
  const notSet = t("common.notSet");
  const carbSum = items.reduce((sum, item) => sum + (item.carbsG ?? 0), 0);
  const fluidSum = items.reduce((sum, item) => sum + (item.fluidMl ?? 0), 0);
  const sodiumSum = items.reduce((sum, item) => sum + (item.sodiumMg ?? 0), 0);
  const carbsKnown = carbStatus === "computed" || items.some((item) => item.carbsG != null);
  const fluidKnown = items.some((item) => item.fluidMl != null);
  const showNotSplit = carbStatus === "not_set";
  const carbBasis = asString(record?.carbBasis);
  const roundedUp = record?.carbsRoundedUp === true;
  const hasShortfall = items.some((item) => item.role === "more_bottles" || item.role === "refill");
  const fluidPlan = items.some((item) => item.role === "refill") ? "REFILL" : "MORE_BOTTLES";
  return (
    <>
      {items.map((item, index) => {
        const title =
          item.role === "refill"
            ? t("carry.refill")
            : item.role === "more_bottles"
              ? item.count == null
                ? t("carry.moreBottlesUnknown")
                : t("carry.moreBottles", { n: item.count })
              : item.role === "extra_powder"
                ? t("carry.extraPowder")
                : item.role === "unassigned"
                  ? t("carry.unassigned")
                  : item.role === "water"
                    ? t("carry.water")
                    : (item.productName ?? item.name);
        const amount =
          item.servings == null
            ? notSet
            : item.unit === "scoop"
              ? t("carry.scoops", { n: item.servings })
              : item.unit === "unit"
                ? t("carry.units", { n: item.servings })
                : t("carry.servings", { n: item.servings });
        const volume = item.volumeMl == null ? null : t("carry.volume", { ml: formatNumber(item.volumeMl, locale) });
        const carbs = item.carbsG == null ? notSet : `${formatNumber(item.carbsG, locale)} g`;
        const fluid = item.fluidMl == null ? notSet : `${formatNumber(item.fluidMl, locale)} ml`;
        const sodium = item.sodiumMg == null ? notSet : `${formatNumber(item.sodiumMg, locale)} mg`;
        const plain =
          item.role === "refill"
            ? t("carry.refillFluid", { ml: formatNumber(item.fluidMl ?? 0, locale) })
            : item.role === "more_bottles"
              ? t("carry.moreBottlesFluid", { ml: formatNumber(item.fluidMl ?? 0, locale) })
              : null;
        const skipAmount = item.role === "water" || item.role === "unassigned" || item.role === "refill" || item.role === "more_bottles";
        return (
          <CarryLine
            key={`${item.name}-${index}`}
            name={item.containerName ?? title}
            kind={item.kind}
            color={item.containerId ? colors?.get(item.containerId) : null}
            detail={
              plain ? (
                <div>{plain}</div>
              ) : (
                <>
                  <div>
                    {item.role === "extra_powder" && item.productName ? item.productName : title}
                    {skipAmount ? "" : ` · ${amount}`}
                    {volume ? ` · ${volume}` : ""}
                  </div>
                  <div>
                    {carbs} · {fluid} · {sodium}
                  </div>
                </>
              )
            }
          />
        );
      })}
      {hasShortfall ? <FluidPlanSwitch current={fluidPlan} /> : null}
      <div className="rw" style={{ justifyContent: "space-between" }}>
        <b>{t("carry.total")}</b>
        <span className="m">
          {carbsKnown ? `${formatNumber(carbSum, locale)} g` : notSet}
          {" · "}
          {fluidKnown ? `${formatNumber(fluidSum, locale)} ml` : notSet}
          {" · "}
          {sodiumSum > 0 ? `${formatNumber(sodiumSum, locale)} mg` : notSet}
        </span>
      </div>
      {showNotSplit ? <p className="mu">{t("carry.notSplit")}</p> : null}
      {carbBasis === "band_low" ? <p className="mu">{t("carry.bandLow")}</p> : null}
      {roundedUp ? <p className="mu">{t("carry.rounded")}</p> : null}
    </>
  );
}

function FluidPlanSwitch({ current }: { current: "MORE_BOTTLES" | "REFILL" }) {
  const { token, t } = useApp();
  const [error, setError] = useState<HttpErrorCode | null>(null);
  const [pending, setPending] = useState(false);
  async function choose(fluidPlan: "MORE_BOTTLES" | "REFILL") {
    if (!token || pending || fluidPlan === current) return;
    setPending(true);
    setError(null);
    try {
      await apiSend("/me", {
        method: "PATCH",
        token,
        body: { fluidPlan },
        parse: parseMe,
      });
      window.location.reload();
    } catch (caught) {
      setPending(false);
      setError(caught instanceof ApiError ? caught.code : HttpErrorCode.InternalError);
    }
  }
  return (
    <div>
      <p className="ey">{t("pref.fluid")}</p>
      <div className="wrap">
        {(
          [
            ["MORE_BOTTLES", "pref.moreBottles"],
            ["REFILL", "pref.refill"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={current === id ? "pill sel" : "pill"}
            disabled={pending}
            onClick={() => void choose(id)}
          >
            {t(label)}
          </button>
        ))}
      </div>
      {error ? <ErrorText code={error} /> : null}
    </div>
  );
}

export function CarryLine({
  name,
  detail,
  kind,
  color,
}: {
  name: string;
  detail?: ReactNode;
  kind: string;
  color?: string | null;
}) {
  const icon = carryIconName(name, kind);
  return (
    <div className="rw">
      <div className="ic" style={{ color: paintIcon(name, kind || icon, color) }}>
        <Icon name={icon} size={24} />
      </div>
      <div>
        <b>{name}</b>
        {detail ? <div className="mu m">{detail}</div> : null}
      </div>
    </div>
  );
}

/** Questionnaire and calibration segments: done glucose, current ember. */
export function StepSegments({ total, current }: { total: number; current: number }) {
  return (
    <div className="sg" aria-hidden="true">
      {Array.from({ length: total }, (_, index) => (
        <i key={index} className={index < current ? "d" : index === current ? "c" : undefined} />
      ))}
    </div>
  );
}

/** Onboarding question bar. The first `filled` of 7 segments are lit. */
export function QuestionDots({ filled }: { filled: number }) {
  return (
    <div className="pr" aria-hidden="true">
      {Array.from({ length: 7 }, (_, index) => (
        <i key={index} className={index < filled ? "on" : undefined} />
      ))}
    </div>
  );
}

export function SweatCard({
  href,
  title,
  detail,
}: {
  href: string;
  title: string;
  detail: string;
}) {
  const { t } = useApp();
  return (
    <Link href={href} className="sweat">
      <span className="sweat-in">
        <span className="sweat-mark">
          <Icon name="drop" size={22} />
        </span>
        <span style={{ flex: 1 }}>
          <span className="m" style={{ fontSize: 11, letterSpacing: 1.5, color: "#C6F135" }}>
            {t("type.sweat")}
          </span>
          <b style={{ display: "block", fontSize: 16 }}>{title}</b>
          <span style={{ fontSize: 13, color: "#A3B0C4" }}>{detail}</span>
        </span>
        <b style={{ fontSize: 22, color: "#C6F135" }}>›</b>
      </span>
    </Link>
  );
}

"use client";

import { HTTP_ERROR_MESSAGE, HttpErrorCode } from "@carbadapt/contracts";
import type { MessageId } from "@carbadapt/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useApp } from "@/components/app-state";
import { Icon, carryIconName, paintIcon } from "@/components/icons";

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
  const { token, t } = useApp();
  if (token) return null;
  return (
    <div className="note">
      <b>{t("auth.login")}</b>
      {t("common.signInFirst")}
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

export function CarryLine({
  name,
  detail,
  kind,
  color,
}: {
  name: string;
  detail?: string;
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

import type { SVGProps } from "react";

/**
 * Symbol sprite copied from design/carbadapt-screens.html.
 * The file stores viewBox as sc-camel-view-box; these symbols restore viewBox.
 * ids: ih home, ic calendar, ipg progress, ip profile, sb bottle, sf flask,
 * sl bladder, sg gel, sp solid, sc caffeine, sd drop.
 */
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="ih" viewBox="0 0 24 24">
          <path
            d="M3 11l9-8 9 8v9h-6v-6H9v6H3z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="ic" viewBox="0 0 24 24">
          <rect
            x="4"
            y="5"
            width="16"
            height="15"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M4 10h16M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </symbol>
        <symbol id="ipg" viewBox="0 0 24 24">
          <path
            d="M4 19V5M4 19h16M8 15l3-4 3 2 5-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="ip" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </symbol>
        <symbol id="sb" viewBox="0 0 32 32">
          <rect x="14.2" y="0.5" width="3.6" height="4.2" rx="1.4" fill="currentColor" />
          <path
            d="M11.5 10V7.4c0-1.6 1.3-2.9 2.9-2.9h3.2c1.6 0 2.9 1.3 2.9 2.9V10z"
            fill="currentColor"
          />
          <rect x="10.8" y="10" width="10.4" height="2.2" rx="1.1" fill="currentColor" />
          <path
            d="M11.5 12.2h9c1 0 1.8.8 1.8 1.8v2.2c0 1.6-.8 2.6-.8 4.5s.8 2.9.8 4.5v3.3c0 1.9-1.5 3.4-3.4 3.4h-5.8c-1.9 0-3.4-1.5-3.4-3.4v-3.3c0-1.6.8-2.6.8-4.5s-.8-2.9-.8-4.5V14c0-1 .8-1.8 1.8-1.8z"
            fill="currentColor"
          />
          <rect x="12.2" y="14" width="1.5" height="15" rx=".75" fill="#fff" opacity=".35" />
        </symbol>
        <symbol id="sf" viewBox="0 0 32 32">
          <rect x="12.5" y="0.8" width="7" height="3.2" rx="1.2" fill="currentColor" />
          <path
            d="M13 4h6v2.4l3.6 4.9c.9 1.3 1.1 2.5 1.1 4V28c0 1.7-1.3 3-3 3H11.3c-1.7 0-3-1.3-3-3V15.3c0-1.5.2-2.7 1.1-4L13 6.4z"
            fill="currentColor"
          />
          <path
            d="M12 18h8M12 22h8M12 26h8"
            stroke="#fff"
            opacity=".3"
            strokeWidth="1.2"
            fill="none"
          />
        </symbol>
        <symbol id="sl" viewBox="0 0 32 32">
          <path
            d="M8 8h14c1.7 0 3 1.3 3 3v16c0 1.7-1.3 3-3 3H8c-1.7 0-3-1.3-3-3V11c0-1.7 1.3-3 3-3z"
            fill="currentColor"
          />
          <rect x="9" y="3" width="7" height="4" rx="1.5" fill="currentColor" />
          <path
            d="M21 8V5c0-1.2.9-2 2-2h3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="25.5" y="1.2" width="4.5" height="3.6" rx="1.2" fill="currentColor" />
          <path
            d="M8 15h14M8 20h14M8 25h14"
            stroke="#fff"
            opacity=".3"
            strokeWidth="1.2"
            fill="none"
          />
        </symbol>
        <symbol id="sg" viewBox="0 0 24 24">
          <path d="M7 8h10v13H7z" fill="currentColor" />
          <path d="M7 8l1-4 2 2 2-2 2 2 2-2 1 4z" fill="currentColor" />
        </symbol>
        <symbol id="sp" viewBox="0 0 24 24">
          <path
            d="M12 20c-5 0-8-3-8-7 0-3 2-5 4-5 2 0 4 2 4 4s-2 4-4 4M12 20c5 0 8-3 8-7 0-3-2-5-4-5-2 0-4 2-4 4s2 4 4 4M8 8c-1-3 1-5 3-5 1 0 1 1 1 2M16 8c1-3-1-5-3-5-1 0-1 1-1 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="sc" viewBox="0 0 24 24">
          <rect
            x="2"
            y="8"
            width="20"
            height="8"
            rx="4"
            transform="rotate(-40 12 12)"
            fill="currentColor"
          />
          <path d="M12 6l0 12" stroke="#101A2B" strokeWidth="1.5" transform="rotate(-40 12 12)" />
        </symbol>
        <symbol id="sd" viewBox="0 0 24 24">
          <path
            d="M12 2.5c3.5 4.2 6 7.4 6 11a6 6 0 0 1-12 0c0-3.6 2.5-6.8 6-11z"
            fill="currentColor"
          />
        </symbol>
      </defs>
    </svg>
  );
}

export type IconName =
  | "home"
  | "calendar"
  | "progress"
  | "profile"
  | "bottle"
  | "flask"
  | "bladder"
  | "gel"
  | "solid"
  | "caffeine"
  | "drop";

const SYMBOL: Record<IconName, string> = {
  home: "ih",
  calendar: "ic",
  progress: "ipg",
  profile: "ip",
  bottle: "sb",
  flask: "sf",
  bladder: "sl",
  gel: "sg",
  solid: "sp",
  caffeine: "sc",
  drop: "sd",
};

const BOX: Record<IconName, string> = {
  home: "0 0 24 24",
  calendar: "0 0 24 24",
  progress: "0 0 24 24",
  profile: "0 0 24 24",
  bottle: "0 0 32 32",
  flask: "0 0 32 32",
  bladder: "0 0 32 32",
  gel: "0 0 24 24",
  solid: "0 0 24 24",
  caffeine: "0 0 24 24",
  drop: "0 0 24 24",
};

export function Icon({
  name,
  size = 24,
  ...rest
}: { name: IconName; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg viewBox={BOX[name]} width={size} height={size} aria-hidden="true" {...rest}>
      <use href={`#${SYMBOL[name]}`} />
    </svg>
  );
}

/** Sprite id for a carry-list or gear row. Water bottles stay bottles; the drop is the sweat mark. */
export function carryIconName(name: string, kind: string): IconName {
  const text = `${name} ${kind}`.toLowerCase();
  if (text.includes("flask") || kind === "SOFT_FLASK") return "flask";
  if (text.includes("bladder") || kind === "BLADDER") return "bladder";
  if (text.includes("gel") || kind === "GEL") return "gel";
  if (text.includes("solid") || kind === "SOLID") return "solid";
  return "bottle";
}

function nearWhite(hex: string): boolean {
  const body = hex.replace("#", "");
  if (body.length < 6) return false;
  const red = Number.parseInt(body.slice(0, 2), 16);
  const green = Number.parseInt(body.slice(2, 4), 16);
  const blue = Number.parseInt(body.slice(4, 6), 16);
  return red > 220 && green > 220 && blue > 200;
}

/**
 * Paint a container icon. A stored hex wins, except near-white, which the
 * design draws as the clear-bottle gray so it stays visible on the icon well.
 */
export function paintIcon(name: string, kind: string, hex?: string | null): string {
  if (hex && !nearWhite(hex)) return hex;
  return iconTint(name, kind);
}

/** Colors painted on the design's container and product icons. */
export function iconTint(name: string, kind: string): string {
  const text = name.toLowerCase();
  if (text.includes("red")) return "#E5484D";
  if (text.includes("black")) return "#1B1F27";
  if (text.includes("clear") || text.includes("white")) return "#8A97AB";
  if (text.includes("orange")) return "#FF8A3D";
  if (text.includes("blue")) return "#4DA3FF";
  if (text.includes("yellow")) return "#FFC845";
  if (text.includes("green")) return "#3DDC97";
  if (text.includes("pink")) return "#FF8FB1";
  if (kind === "gel") return "#FF6A3D";
  if (kind === "solid") return "#A8672D";
  if (kind === "flask" || kind === "SOFT_FLASK") return "#FF8A3D";
  if (kind === "bladder" || kind === "BLADDER") return "#3C4D6C";
  return "#E5484D";
}

/** Welcome mark from the onboarding board. */
export function Mark({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      <path
        d="M20 28 H70 A11 11 0 0 1 70 50 H30 A11 11 0 0 0 30 72 H62"
        fill="none"
        stroke="#C6F135"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="78" cy="72" r="8" fill="#FF6A3D" />
    </svg>
  );
}

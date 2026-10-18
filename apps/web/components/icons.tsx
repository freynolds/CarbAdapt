import type { ReactNode, SVGProps } from "react";

type IconName =
  | "home"
  | "calendar"
  | "progress"
  | "profile"
  | "bottle"
  | "flask"
  | "bladder"
  | "gel"
  | "solid"
  | "drop"
  | "chart";

const viewBox: Record<IconName, string> = {
  home: "0 0 24 24",
  calendar: "0 0 24 24",
  progress: "0 0 24 24",
  profile: "0 0 24 24",
  bottle: "0 0 32 32",
  flask: "0 0 32 32",
  bladder: "0 0 32 32",
  gel: "0 0 24 24",
  solid: "0 0 24 24",
  drop: "0 0 24 24",
  chart: "0 0 24 24",
};

function paths(name: IconName): ReactNode {
  switch (name) {
    case "home":
      return (
        <path
          d="M3 11l9-8 9 8v9h-6v-6H9v6H3z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      );
    case "calendar":
      return (
        <>
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
        </>
      );
    case "profile":
      return (
        <>
          <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </>
      );
    case "chart":
      return (
        <path
          d="M4 19V5M4 19h16M8 15l3-4 3 2 5-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case "bottle":
      return (
        <>
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
        </>
      );
    case "flask":
      return (
        <>
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
        </>
      );
    case "bladder":
      return (
        <>
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
        </>
      );
    case "gel":
      return (
        <>
          <path d="M7 8h10v13H7z" fill="currentColor" />
          <path d="M7 8l1-4 2 2 2-2 2 2 2-2 1 4z" fill="currentColor" />
        </>
      );
    case "solid":
      return (
        <path
          d="M12 20c-5 0-8-3-8-7 0-3 2-5 4-5 2 0 4 2 4 4s-2 4-4 4M12 20c5 0 8-3 8-7 0-3-2-5-4-5-2 0-4 2-4 4s2 4 4 4M8 8c-1-3 1-5 3-5 1 0 1 1 1 2M16 8c1-3-1-5-3-5-1 0-1 1-1 2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    case "drop":
      return (
        <path
          d="M12 2.5c3.5 4.2 6 7.4 6 11a6 6 0 0 1-12 0c0-3.6 2.5-6.8 6-11z"
          fill="currentColor"
        />
      );
    default:
      return null;
  }
}

export function Icon({
  name,
  size = 24,
  ...rest
}: { name: IconName; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg viewBox={viewBox[name]} width={size} height={size} aria-hidden="true" {...rest}>
      {paths(name)}
    </svg>
  );
}

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

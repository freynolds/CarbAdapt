/** Play badge from the calibration boards. */
export function PlayMark() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" role="img" aria-hidden="true">
      <circle cx="28" cy="28" r="28" fill="#C6F135" />
      <path d="M23 18l17 10-17 10z" fill="#101A2B" />
    </svg>
  );
}

/** Kitchen-scale drawing from the calibration boards. The container is the design sprite. */
export function ScaleScene({ kind }: { kind: "bottle" | "flask" | "bladder" }) {
  const tint = kind === "flask" ? "#FF8A3D" : kind === "bladder" ? "#3C4D6C" : "#E5484D";
  return (
    <svg width="260" height="130" viewBox="0 0 260 130" role="img" aria-hidden="true">
      <rect x="40" y="100" width="180" height="26" rx="12" fill="#101A2B" />
      <rect x="60" y="92" width="140" height="8" rx="4" fill="#A3B0C4" />
      {kind === "bladder" ? (
        <path
          d="M64 74h132c0 22-26 36-66 36s-66-14-66-36z"
          fill="#3C4D6C"
          stroke="#A3B0C4"
          strokeWidth="2"
        />
      ) : (
        <use
          href={kind === "flask" ? "#sf" : "#sb"}
          x="98"
          y="26"
          width="64"
          height="64"
          style={{ color: tint }}
        />
      )}
    </svg>
  );
}

/** Camera corners and label lines from the scan-label board. */
export function ScanFrame() {
  return (
    <svg width="300" height="220" viewBox="0 0 300 360" role="img" aria-hidden="true">
      <rect x="10" y="10" width="280" height="340" rx="10" fill="#1b1f27" />
      <path
        d="M10 50V20a10 10 0 0 1 10-10h30M250 10h30a10 10 0 0 1 10 10v30M290 310v30a10 10 0 0 1-10 10h-30M50 350H20a10 10 0 0 1-10-10v-30"
        fill="none"
        stroke="#C6F135"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <g stroke="#3C4D6C" strokeWidth="6" strokeLinecap="round">
        <path d="M50 80h120M50 110h200M50 140h160M50 170h200M50 200h140M50 230h200" />
      </g>
    </svg>
  );
}

/** Ray burst from the celebration board. The number is the achievement, not the sample 72. */
export function BurstMark({ value }: { value: string }) {
  return (
    <svg
      viewBox="0 0 340 340"
      role="img"
      aria-hidden="true"
      style={{ color: "var(--ac)", width: "100%" }}
    >
      <path d="M268 170L282 170" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M263 200L290 209" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M249 228L261 236" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M228 249L244 272" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M200 263L205 277" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M170 268L170 296" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M140 263L135 277" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M112 249L96 272" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M91 228L79 236" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M77 200L50 209" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M72 170L58 170" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M77 140L50 131" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M91 112L79 104" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M112 91L96 68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M140 77L135 63" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M170 72L170 44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M200 77L205 63" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M228 91L244 68" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M249 112L261 104" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M263 140L290 131" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="170" cy="170" r="86" fill="var(--cd)" />
      <text
        x="170"
        y="184"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
        fontWeight="700"
        fontSize="64"
        fill="var(--ac)"
      >
        {value}
      </text>
      <text
        x="170"
        y="212"
        textAnchor="middle"
        fontFamily="var(--font-mono), monospace"
        fontWeight="500"
        fontSize="18"
        fill="var(--mu)"
      >
        g/h
      </text>
    </svg>
  );
}

/** Intake-key shapes from the workout block chart. */
export function IntakeMark({ kind }: { kind: "water" | "isotonic" | "gel" | "solid" }) {
  if (kind === "water") {
    return (
      <svg width="10" height="10" aria-hidden="true">
        <circle cx="5" cy="5" r="5" fill="#4DA3FF" />
      </svg>
    );
  }
  if (kind === "isotonic") {
    return (
      <svg width="10" height="10" aria-hidden="true">
        <polygon points="5,0 10,10 0,10" fill="#C6F135" />
      </svg>
    );
  }
  if (kind === "gel") {
    return (
      <svg width="10" height="10" aria-hidden="true">
        <polygon points="5,0 10,5 5,10 0,5" fill="#FF6A3D" />
      </svg>
    );
  }
  return (
    <svg width="10" height="10" aria-hidden="true">
      <rect x="1" y="1" width="8" height="8" fill="#F4F1EA" />
    </svg>
  );
}

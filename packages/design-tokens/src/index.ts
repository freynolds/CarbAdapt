/**
 * Brand tokens extracted from design/carbadapt-screens.html.
 * CSS variables live in ./tokens.css. The web app imports that file.
 */

export const TOKEN_SOURCE = "design/carbadapt-screens.html" as const;

export const BrandColor = {
  NightFuel: "#101A2B",
  Glucose: "#C6F135",
  Ember: "#FF6A3D",
  Tarmac: "#2B3A55",
  Bone: "#F4F1EA",
} as const;

export const SurfaceColor = {
  LightCard: "#FFFFFF",
  MutedOnDark: "#A3B0C4",
  MutedOnLight: "#5B6880",
  IconOnLight: "#E7E2D6",
  LineOnDark: "#3C4D6C",
  LineOnLight: "#E1DCCF",
  NoteOnDark: "#182640",
  NoteTextOnDark: "#C9D2E0",
  Stage: "#0A1220",
  Subscription: "#000000",
} as const;

/** Workout-type chips. Anaerobic is the handoff color that was missing from the first frames. */
export const WorkoutChipColor = {
  Base: "#4DA3FF",
  Threshold: "#FFC845",
  Vo2max: "#D96CFF",
  Recovery: "#3DDC97",
  Anaerobic: "#FF8FB1",
} as const;

export const SymptomColor = {
  None: "#3DDC97",
  Mild: "#C6F135",
  Moderate: "#FFC845",
  Severe: "#FF6A3D",
} as const;

export const FontFamily = {
  Display: "Bricolage Grotesque",
  Body: "DM Sans",
  Mono: "JetBrains Mono",
} as const;

export const Radius = {
  Card: 20,
  Control: 14,
  Button: 27,
  Pill: 999,
} as const;

/** Centered column width. Every designed frame is a 390px iPhone layout. */
export const COLUMN_PX = 390;

export const CssVariable = {
  Background: "--bg",
  Card: "--cd",
  Text: "--tx",
  Muted: "--mu",
  Accent: "--ac",
  Icon: "--ib",
  Line: "--ln",
} as const;

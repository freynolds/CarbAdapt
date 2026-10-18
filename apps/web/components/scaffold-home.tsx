import { healthUrl } from "@/lib/api";

/**
 * Developer placeholder for the web process.
 * This is not a product screen. Extracted screens replace it later.
 * The mark is the one drawn on the onboarding welcome frame in
 * design/carbadapt-screens.html, with viewBox restored from sc-camel-view-box.
 */
export function ScaffoldHome() {
  return (
    <main className="scaffold">
      <svg className="scaffold-mark" width="64" height="64" viewBox="0 0 96 96" aria-hidden="true">
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
      <p className="scaffold-kicker">Step 1 · local scaffold</p>
      <h1>CarbAdapt</h1>
      <p className="scaffold-lead">
        This is the web process. Product screens are not built yet. The source for those screens is{" "}
        <code>design/carbadapt-screens.html</code>.
      </p>
      <ul>
        <li>
          Web app, this page: <code>http://127.0.0.1:3000</code>
        </li>
        <li>
          API liveness: <a href={healthUrl}>{healthUrl}</a>
        </li>
        <li>
          MySQL 8.4 on <code>127.0.0.1:3306</code>, started with <code>pnpm db:up</code>
        </li>
      </ul>
    </main>
  );
}

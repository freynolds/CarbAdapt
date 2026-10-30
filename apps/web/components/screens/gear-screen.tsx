"use client";

import { HttpErrorCode } from "@carbadapt/contracts";
import type { MessageId } from "@carbadapt/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp, useGet } from "@/components/app-state";
import { ApiError, apiSend } from "@/lib/api";
import { Icon, carryIconName, paintIcon } from "@/components/icons";
import { PlayMark, ScaleScene } from "@/components/illustrations";
import { ErrorText, LoadingText, NeedSignIn, Preview, Screen, StepSegments } from "@/components/ui";
import { parseContainer, parseContainers, parseDeleted, parseProducts } from "@/lib/parse";

const COLORS: { id: string; label: MessageId; hex: string }[] = [
  { id: "red", label: "gear.red", hex: "#E5484D" },
  { id: "black", label: "gear.black", hex: "#1B1F27" },
  { id: "clear", label: "gear.clear", hex: "#D9DEE7" },
  { id: "blue", label: "gear.blue", hex: "#4DA3FF" },
  { id: "yellow", label: "gear.yellow", hex: "#FFC845" },
  { id: "green", label: "gear.green", hex: "#3DDC97" },
  { id: "orange", label: "gear.orange", hex: "#FF6A3D" },
  { id: "pink", label: "gear.pink", hex: "#FF8FB1" },
  { id: "other", label: "gear.other", hex: "#A3B0C4" },
];

export function GearListScreen() {
  const { token, t } = useApp();
  const list = useGet(token ? "/containers" : null, parseContainers);
  if (!token)
    return (
      <Screen title={t("gear.title")} tabs>
        <NeedSignIn />
      </Screen>
    );
  if (list.status !== "ready")
    return (
      <Screen title={t("gear.title")} tabs>
        {list.status === "error" ? <ErrorText code={list.code} /> : <LoadingText />}
      </Screen>
    );
  const groups = [
    ["BOTTLE", "gear.bottles", "bottle"],
    ["SOFT_FLASK", "gear.flasks", "flask"],
    ["BLADDER", "gear.bladders", "bladder"],
  ] as const;
  return (
    <Screen
      title={t("gear.title")}
      tabs
      action={
        <Link href="/profile/gear/new" className="plus" aria-label={t("gear.add")}>
          +
        </Link>
      }
    >
      {list.data.containers.length === 0 ? <p className="mu">{t("gear.empty")}</p> : null}
      {groups.map(([type, label, icon]) => {
        const rows = list.data.containers.filter((row) => row.type === type);
        if (rows.length === 0) return null;
        return (
          <section key={type}>
            <p className="ey">{t(label)}</p>
            {rows.map((row) => {
              const latest = row.calibrations[0];
              const detail =
                latest?.mlPerSip != null
                  ? t("gear.mlSip", { ml: latest.mlPerSip })
                  : latest?.gPerSqueeze != null
                    ? t("gear.gSqueeze", { g: latest.gPerSqueeze })
                    : t("gear.calibrate");
              return (
                <Link key={row.id} href={`/profile/gear/${row.id}`} className="td">
                  <span
                    className="ic"
                    style={{ color: paintIcon(row.name, row.type, row.colorHex) }}
                  >
                    <Icon name={icon} />
                  </span>
                  <div>
                    <b>{row.name}</b>
                    <span className="mu m">
                      {row.capacityMl} ml · {detail}
                    </span>
                  </div>
                  <i>›</i>
                </Link>
              );
            })}
          </section>
        );
      })}
    </Screen>
  );
}

export function GearFormScreen({ id }: { id?: string }) {
  const { token, t } = useApp();
  const router = useRouter();
  const existing = useGet(token && id ? `/containers/${id}` : null, parseContainer);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<HttpErrorCode | null>(null);
  const [type, setType] = useState<"BOTTLE" | "SOFT_FLASK" | "BLADDER">("BOTTLE");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("750");
  const [content, setContent] = useState("WATER");
  const [color, setColor] = useState<string | null>(null);
  const [colorsOpen, setColorsOpen] = useState(false);
  const row = existing.status === "ready" ? existing.data.container : null;
  const shownType = row?.type ?? type;
  const shownName = name || row?.name || "";
  const shownCapacity = capacity || (row ? String(row.capacityMl) : "750");
  const shownContent = row?.usualContent ?? content;
  const storedSwatch = COLORS.find(
    (swatch) => swatch.hex.toLowerCase() === (row?.colorHex ?? "").toLowerCase(),
  );
  const activeColor = color ?? storedSwatch?.id ?? null;
  const activeHex = color
    ? COLORS.find((swatch) => swatch.id === color)?.hex
    : (row?.colorHex ?? COLORS[0]?.hex);

  async function save() {
    if (!token || !shownName) return;
    const capacityMl = Number(shownCapacity);
    if (!Number.isFinite(capacityMl) || capacityMl <= 0) {
      setError(HttpErrorCode.InvalidRequest);
      return;
    }
    const body = {
      type: shownType,
      name: shownName,
      colorHex: activeHex ?? null,
      capacityMl: Math.round(capacityMl),
      usualContent: shownType === "SOFT_FLASK" ? "GEL_CONCENTRATE" : shownContent,
    };
    setBusy(true);
    setError(null);
    try {
      await apiSend(id ? `/containers/${id}` : "/containers", {
        method: id ? "PATCH" : "POST",
        token,
        body,
        parse: parseContainer,
      });
      router.push("/profile/gear");
    } catch (caught: unknown) {
      setError(caught instanceof ApiError ? caught.code : HttpErrorCode.InternalError);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!token || !id) return;
    setBusy(true);
    try {
      await apiSend(`/containers/${id}`, { method: "DELETE", token, parse: parseDeleted });
      router.push("/profile/gear");
    } catch (caught: unknown) {
      setError(caught instanceof ApiError ? caught.code : HttpErrorCode.InternalError);
      setBusy(false);
    }
  }

  return (
    <Screen
      kicker={id ? t("gear.edit") : t("gear.add")}
      title={id ? shownName : t("gear.new")}
      back="/profile/gear"
    >
      <Preview />
      {!id ? (
        <div className="wrap">
          {(["BOTTLE", "SOFT_FLASK", "BLADDER"] as const).map((item) => (
            <button
              key={item}
              type="button"
              className={shownType === item ? "pill sel" : "pill"}
              onClick={() => setType(item)}
            >
              {t(
                item === "BOTTLE"
                  ? "gear.bottle"
                  : item === "SOFT_FLASK"
                    ? "gear.flask"
                    : "gear.bladder",
              )}
            </button>
          ))}
        </div>
      ) : null}
      <label className="field">
        <span>{t("gear.name")}</span>
        <input value={shownName} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="field">
        <span>{t("gear.capacity")}</span>
        <input value={shownCapacity} onChange={(event) => setCapacity(event.target.value)} />
      </label>
      <p className="ey">{t("gear.content")}</p>
      <div className="wrap">
        {(shownType === "SOFT_FLASK"
          ? (["GEL_CONCENTRATE"] as const)
          : (["WATER", "ISOTONIC"] as const)
        ).map((item) => (
          <button
            key={item}
            type="button"
            className={shownContent === item ? "pill sel" : "pill"}
            onClick={() => setContent(item)}
          >
            {t(
              item === "WATER"
                ? "gear.water"
                : item === "ISOTONIC"
                  ? "gear.isotonic"
                  : "gear.gelMix",
            )}
          </button>
        ))}
      </div>
      <p className="mu">{shownType === "SOFT_FLASK" ? t("gear.gelNote") : t("gear.mix")}</p>
      {id ? (
        <>
          <button type="button" className="choice" onClick={() => setColorsOpen((value) => !value)}>
            <span>{t("gear.color")}</span>
            <i>›</i>
          </button>
          {colorsOpen ? (
            <div className="cd" style={{ display: "flex", justifyContent: "center" }}>
              <Icon
                name={carryIconName(shownName, shownType)}
                size={64}
                style={{ color: paintIcon(shownName, shownType, activeHex) }}
              />
            </div>
          ) : null}
          {colorsOpen ? (
            <div className="colors">
              {COLORS.map((swatch) => (
                <button
                  key={swatch.id}
                  type="button"
                  className={activeColor === swatch.id ? "swatch sel" : "swatch"}
                  style={{
                    background: swatch.hex,
                    color: swatch.id === "clear" || swatch.id === "yellow" ? "#101A2B" : "#F4F1EA",
                  }}
                  onClick={() => setColor(swatch.id)}
                >
                  {t(swatch.label)}
                </button>
              ))}
            </div>
          ) : null}
          <Link href={`/profile/gear/${id}/calibrate`} className="choice">
            <span>{t("gear.calibration")}</span>
            <span className="m">
              {row?.calibrations[0]?.mlPerSip ??
                row?.calibrations[0]?.gPerSqueeze ??
                t("gear.calibrate")}
            </span>
          </Link>
          <button type="button" className="gh" disabled={busy} onClick={() => void remove()}>
            {t("gear.delete")}
          </button>
        </>
      ) : null}
      {error ? <ErrorText code={error} /> : null}
      <button type="button" className="bt" disabled={busy} onClick={() => void save()}>
        {t("common.save")}
      </button>
    </Screen>
  );
}

export function CalibrateScreen({ id }: { id: string }) {
  const { token, t } = useApp();
  const container = useGet(token ? `/containers/${id}` : null, parseContainer);
  const products = useGet(token ? "/products" : null, parseProducts);
  const [step, setStep] = useState(0);
  const [weights, setWeights] = useState(["812", "800", "788", "776"]);
  const [gel, setGel] = useState("");
  if (!token)
    return (
      <Screen>
        <NeedSignIn />
      </Screen>
    );
  if (container.status !== "ready")
    return (
      <Screen>
        {container.status === "error" ? <ErrorText code={container.code} /> : <LoadingText />}
      </Screen>
    );
  const row = container.data.container;
  const flask = row.type === "SOFT_FLASK";
  const steps = flask
    ? ["intro", "need", "setup", "gel", "w0", "w1", "w2", "w3", "done"]
    : ["intro", "need", "setup", "w0", "w1", "w2", "w3", "done"];
  const current = steps[step] ?? "intro";
  const numbers = weights.map((value) => Number(value) || 0);
  const each = Math.round((numbers[0]! - numbers[3]!) / 3);
  const titles: Record<string, string> = {
    w0: t("calb.weigh"),
    w1: t(flask ? "calb.sq1" : "calb.sip1"),
    w2: t(flask ? "calb.sq2" : "calb.sip2"),
    w3: t(flask ? "calb.sq3" : "calb.sip3"),
  };
  const weightIndex =
    current === "w0" ? 0 : current === "w1" ? 1 : current === "w2" ? 2 : current === "w3" ? 3 : -1;
  return (
    <Screen
      kicker={row.name}
      title={
        current === "done"
          ? t(flask ? "calb.measuredSq" : "calb.measured")
          : current.startsWith("w")
            ? (titles[current] ?? "")
            : t(flask ? "calb.squeeze" : "calb.sip")
      }
      back={`/profile/gear/${id}`}
      lead={
        weightIndex >= 0 || current === "done" ? (
          <StepSegments total={4} current={current === "done" ? 4 : weightIndex} />
        ) : undefined
      }
    >
      <Preview />
      {current === "intro" ? (
        <>
          <div className="cd" style={{ display: "flex", justifyContent: "center" }}>
            <PlayMark />
          </div>
          <p>{t("calb.howto")}</p>
          <div className="note">
            <b>{t("calb.why")}</b>
            {t("calb.whyBody")}
          </div>
        </>
      ) : null}
      {current === "need" ? (
        <>
          <h2 className="h2">{t("calb.need")}</h2>
          <div className="cd">
            <b>{t("calb.scale")}</b>
            <p className="mu">{t("calb.scaleNote")}</p>
          </div>
          <div className="cd">
            <b>
              {t(
                row.type === "BLADDER" ? "calb.bladderFill" : flask ? "calb.fillGel" : "calb.fill",
              )}
            </b>
            <p className="mu">
              {t(
                row.type === "BLADDER"
                  ? "calb.bladderFillNote"
                  : flask
                    ? "calb.fillGelNote"
                    : "calb.fillNote",
              )}
            </p>
          </div>
        </>
      ) : null}
      {current === "setup" ? (
        <>
          <h2 className="h2">{t("calb.setup")}</h2>
          <div className="cd" style={{ display: "flex", justifyContent: "center" }}>
            <ScaleScene kind={row.type === "BLADDER" ? "bladder" : flask ? "flask" : "bottle"} />
          </div>
          <p>
            {t(
              row.type === "BLADDER"
                ? "calb.bladderSetup"
                : flask
                  ? "calb.flaskSetup"
                  : "calb.bottleSetup",
            )}
          </p>
        </>
      ) : null}
      {current === "gel" ? (
        <>
          <h2 className="h2">{t("calb.which")}</h2>
          {(products.status === "ready"
            ? products.data.products.filter((item) => item.type === "GEL")
            : []
          ).map((product) => (
            <button
              key={product.id}
              type="button"
              className={gel === product.id ? "choice sel" : "choice"}
              onClick={() => setGel(product.id)}
            >
              <span>
                <b>{product.name}</b>
                <span className="mu m">{product.carbsG} g</span>
              </span>
            </button>
          ))}
          <div className="note">
            <b>{t("calb.one")}</b>
            {t("calb.oneHelp")}
          </div>
        </>
      ) : null}
      {weightIndex >= 0 ? (
        <>
          <div className="cd" style={{ display: "flex", justifyContent: "center" }}>
            <ScaleScene kind={row.type === "BLADDER" ? "bladder" : flask ? "flask" : "bottle"} />
          </div>
          <p className="ey">{t("calb.step", { n: weightIndex + 1 })}</p>
          <label className="field">
            <span>g</span>
            <input
              value={weights[weightIndex]}
              onChange={(event) =>
                setWeights((current) =>
                  current.map((value, index) =>
                    index === weightIndex ? event.target.value : value,
                  ),
                )
              }
              inputMode="numeric"
            />
          </label>
          <p className="mu">{t("calb.resolution")}</p>
        </>
      ) : null}
      {current === "done" ? (
        <>
          <p className="ey">{t(flask ? "calb.perSq" : "calb.per")}</p>
          <p className="big">
            {each}
            <span style={{ fontSize: 20 }}>{flask ? " g" : " ml"}</span>
          </p>
          {weights.map((value, index) => (
            <div key={index} className="rw" style={{ justifyContent: "space-between" }}>
              <span className="mu">{index === 0 ? t("q.before") : String(index)}</span>
              <b className="m">{value} g</b>
            </div>
          ))}
          {!flask ? (
            <p className="mu">{t("calb.math", { grams: numbers[0]! - numbers[3]!, each })}</p>
          ) : null}
          <p className="mu">{t("calb.keep")}</p>
        </>
      ) : null}
      <button
        type="button"
        className="bt"
        onClick={() => {
          if (current === "w3") {
            const weightsG = weights.map((value) => Number(value));
            if (weightsG.some((value) => !Number.isFinite(value))) return;
            void apiSend(`/containers/${id}/calibrations`, {
              method: "POST",
              token,
              body: { weightsG },
              parse: parseContainer,
            })
              .then(() => setStep((value) => Math.min(steps.length - 1, value + 1)))
              .catch(() => undefined);
            return;
          }
          if (current === "done") {
            window.location.assign(`/profile/gear/${id}`);
            return;
          }
          setStep((value) => Math.min(steps.length - 1, value + 1));
        }}
      >
        {current === "w3"
          ? t("calb.finish")
          : current === "done"
            ? t("common.done")
            : t("common.next")}
      </button>
      {current === "done" ? (
        <button type="button" className="gh" onClick={() => setStep(0)}>
          {t("calb.redo")}
        </button>
      ) : null}
    </Screen>
  );
}

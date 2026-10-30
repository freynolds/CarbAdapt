"use client";

import type { Product, Workout } from "@carbadapt/contracts";
import { HttpErrorCode } from "@carbadapt/contracts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useApp, useGet } from "@/components/app-state";
import { ApiError, apiSend } from "@/lib/api";
import { ScanFrame } from "@/components/illustrations";
import { ErrorText, LoadingText, NeedSignIn, Preview, Screen } from "@/components/ui";
import { addDays, formatNumber, todayKey } from "@/lib/format";
import { carryItems } from "@/lib/json";
import { parseDeleted, parseProduct, parseProducts, parseWorkouts } from "@/lib/parse";

const TYPES = ["DRINK_MIX", "GEL", "SOLID"] as const;

export function ProductListScreen() {
  const { token, t, locale } = useApp();
  const list = useGet(token ? "/products" : null, parseProducts);
  if (!token)
    return (
      <Screen title={t("prod.title")} tabs>
        <NeedSignIn />
      </Screen>
    );
  if (list.status !== "ready")
    return (
      <Screen title={t("prod.title")} tabs>
        {list.status === "error" ? <ErrorText code={list.code} /> : <LoadingText />}
      </Screen>
    );
  return (
    <Screen
      title={t("prod.title")}
      back="/profile"
      tabs
      action={
        <Link href="/profile/products/new" className="plus" aria-label={t("prod.scan")}>
          +
        </Link>
      }
    >
      <p className="ey">{t("prod.per")}</p>
      {list.data.products.length === 0 ? <p className="mu">{t("prod.empty")}</p> : null}
      {TYPES.map((type) => {
        const rows = [...list.data.products.filter((row) => row.type === type)].sort(
          (a, b) => Number(b.favorite) - Number(a.favorite),
        );
        if (rows.length === 0) return null;
        return (
          <section key={type}>
            <p className="ey">{t(`prod.${type}`)}</p>
            <div className="cd" style={{ padding: "4px 16px" }}>
              {rows.map((row, index) => (
                <div key={row.id}>
                  {index > 0 ? <div className="hr" /> : null}
                  <Link href={`/profile/products/${row.id}`} className="td">
                    <div>
                      <b>
                        {row.favorite ? "★ " : ""}
                        {row.name}
                      </b>
                      <span className="mu">{row.brand}</span>
                      <span className="mu m">{line(row, t, locale)}</span>
                    </div>
                    <i>›</i>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </Screen>
  );
}

function line(
  row: Product,
  t: ReturnType<typeof useApp>["t"],
  locale: ReturnType<typeof useApp>["locale"],
) {
  return t("prod.line", {
    carbs: formatNumber(row.carbsG, locale),
    sodium: formatNumber(row.sodiumMg ?? 0, locale),
    caffeine: formatNumber(row.caffeineMg ?? 0, locale),
  });
}

export function ProductDetailScreen({ id }: { id: string }) {
  const { token, me, t, locale } = useApp();
  const product = useGet(token ? `/products/${id}` : null, parseProduct);
  const zone = me?.user.timezone ?? "UTC";
  const workouts = useGet(
    token ? `/workouts?from=${todayKey(zone)}&to=${addDays(todayKey(zone), 60)}` : null,
    parseWorkouts,
  );
  const library = useGet(token ? "/products" : null, parseProducts);
  const router = useRouter();
  const [favorite, setFavorite] = useState<boolean | null>(null);
  const [error, setError] = useState<HttpErrorCode | null>(null);
  const [warn, setWarn] = useState(false);
  const [replacement, setReplacement] = useState<string | null>(null);
  const affected = useMemo(() => {
    if (workouts.status !== "ready") return [] as Workout[];
    return workouts.data.workouts.filter((workout) =>
      carryItems(workout.fuelingPlan?.carryList).some((item) => item.productId === id),
    );
  }, [workouts, id]);
  if (!token)
    return (
      <Screen>
        <NeedSignIn />
      </Screen>
    );
  if (product.status !== "ready")
    return (
      <Screen>
        {product.status === "error" ? <ErrorText code={product.code} /> : <LoadingText />}
      </Screen>
    );
  const row = product.data.product;
  const starred = favorite ?? row.favorite;
  const others =
    library.status === "ready"
      ? library.data.products.filter((item) => item.id !== row.id && item.type === row.type)
      : [];
  return (
    <Screen
      title={row.name}
      back="/profile/products"
      action={
        <button
          type="button"
          className="plus"
          onClick={() => {
            const next = !starred;
            setFavorite(next);
            void apiSend(`/products/${id}`, {
              method: "PATCH",
              token,
              body: {
                type: row.type,
                name: row.name,
                brand: row.brand,
                servingG: row.servingG,
                scoopG: row.scoopG,
                carbsG: row.carbsG,
                sodiumMg: row.sodiumMg,
                caffeineMg: row.caffeineMg,
                favorite: next,
                label: row.label,
              },
              parse: parseProduct,
            }).catch((caught: unknown) => {
              setFavorite(!next);
              setError(caught instanceof ApiError ? caught.code : HttpErrorCode.InternalError);
            });
          }}
        >
          {starred ? "★" : "☆"}
        </button>
      }
    >
      <p className="mu">
        {row.brand} · {t(`prod.${row.type}`)}
      </p>
      <p className="ey">{t("prod.label")}</p>
      <div className="cd">
        <Row label={t("prod.serving")} value={row.servingG != null ? `${row.servingG} g` : "—"} />
        <Row label={t("prod.carbs")} value={`${row.carbsG} g`} />
        <Row label={t("prod.sodium")} value={`${row.sodiumMg ?? 0} mg`} />
        <Row label={t("prod.caffeine")} value={`${row.caffeineMg ?? 0} mg`} />
      </div>
      <button type="button" className="choice" onClick={() => setFavorite(!starred)}>
        <span>{t("prod.favorite")}</span>
        <span className={starred ? "sw on" : "sw"}>
          <i />
        </span>
      </button>
      <Link href="/profile/products/new" className="choice">
        {t("common.edit")}
      </Link>
      <button type="button" className="gh" onClick={() => setWarn(true)}>
        {t("common.delete")}
      </button>
      {warn ? (
        <div className="warn">
          <b>{t("prod.deleteTitle")}</b>
          {affected.length > 0 ? (
            <>
              <p>{t("prod.inUse")}</p>
              {affected.map((workout) => (
                <p key={workout.id} className="mu">
                  {workout.name}
                </p>
              ))}
              <p>{t("prod.replaceHelp")}</p>
              {others.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={replacement === item.id ? "choice sel" : "choice"}
                  onClick={() => setReplacement(item.id)}
                >
                  {item.name} · {line(item, t, locale)}
                </button>
              ))}
            </>
          ) : (
            <p>{t("prod.notUsed")}</p>
          )}
          <Preview />
          {error ? <ErrorText code={error} /> : null}
          <button
            type="button"
            className="bt"
            disabled={affected.length > 0 && !replacement}
            onClick={() => {
              void apiSend(`/products/${id}`, {
                method: "DELETE",
                token,
                body: replacement ? { replacementId: replacement } : {},
                parse: parseDeleted,
              })
                .then(() => router.push("/profile/products"))
                .catch((caught: unknown) => {
                  setError(caught instanceof ApiError ? caught.code : HttpErrorCode.InternalError);
                });
            }}
          >
            {t(affected.length > 0 ? "prod.replace" : "common.delete")}
          </button>
          <button type="button" className="gh" onClick={() => setWarn(false)}>
            {t("common.cancel")}
          </button>
        </div>
      ) : null}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rw" style={{ justifyContent: "space-between" }}>
      <span>{label}</span>
      <b className="m">{value}</b>
    </div>
  );
}

export function ProductNewScreen() {
  const { token, t } = useApp();
  const router = useRouter();
  const [error, setError] = useState<HttpErrorCode | null>(null);
  const [phase, setPhase] = useState<"scan" | "confirm" | "manual">("scan");
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("GEL");
  const [carbs, setCarbs] = useState("25");
  const [sodium, setSodium] = useState("40");
  const [caffeine, setCaffeine] = useState("0");
  const [serving, setServing] = useState("40");

  async function saveProduct() {
    if (!token || !name.trim()) {
      setError(HttpErrorCode.InvalidRequest);
      return;
    }
    const carbsG = Number(carbs);
    const sodiumMg = sodium === "" ? null : Number(sodium);
    const caffeineMg = caffeine === "" ? null : Number(caffeine);
    const servingG = serving === "" ? null : Number(serving);
    if (!Number.isFinite(carbsG) || carbsG < 0) {
      setError(HttpErrorCode.InvalidRequest);
      return;
    }
    setError(null);
    try {
      await apiSend("/products", {
        method: "POST",
        token,
        body: { type, name: name.trim(), carbsG, sodiumMg, caffeineMg, servingG },
        parse: parseProduct,
      });
      router.push("/profile/products");
    } catch (caught: unknown) {
      setError(caught instanceof ApiError ? caught.code : HttpErrorCode.InternalError);
    }
  }

  return (
    <Screen
      kicker={phase === "manual" ? t("prod.new") : t("prod.scan")}
      title={
        phase === "confirm"
          ? t("prod.right")
          : phase === "manual"
            ? t("prod.enter")
            : t("prod.scan")
      }
      back="/profile/products"
    >
      <Preview />
      <p className="mu">{t("prod.scanNote")}</p>
      {phase === "scan" ? (
        <>
          <ScanFrame />
          <p className="mu" style={{ textAlign: "center" }}>
            {t("prod.align")}
          </p>
          <button type="button" className="bt" onClick={() => setPhase("confirm")}>
            {t("common.continue")}
          </button>
          <button type="button" className="gh" onClick={() => setPhase("manual")}>
            {t("prod.manual")}
          </button>
        </>
      ) : null}
      {phase === "confirm" ? (
        <>
          <p className="ey">{t("prod.detected")}</p>
          <div className="cd">
            <Row label={t("acct.name")} value={name || "—"} />
            <Row label={t("prod.serving")} value={`${serving} g`} />
            <Row label={t("prod.carbs")} value={`${carbs} g`} />
            <Row label={t("prod.sodium")} value={`${sodium} mg`} />
            <Row label={t("prod.caffeine")} value={`${caffeine} mg`} />
          </div>
          {error ? <ErrorText code={error} /> : null}
          <button type="button" className="bt" onClick={() => void saveProduct()}>
            {t("common.confirm")}
          </button>
          <button type="button" className="gh" onClick={() => setPhase("manual")}>
            {t("common.edit")}
          </button>
        </>
      ) : null}
      {phase === "manual" ? (
        <>
          <p>{t("prod.unread")}</p>
          <label className="field">
            <span>{t("acct.name")}</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <div className="wrap">
            {TYPES.map((item) => (
              <button
                key={item}
                type="button"
                className={type === item ? "pill sel" : "pill"}
                onClick={() => setType(item)}
              >
                {t(`prod.${item}`)}
              </button>
            ))}
          </div>
          <label className="field">
            <span>{t("prod.carbs")}</span>
            <input value={carbs} onChange={(event) => setCarbs(event.target.value)} />
          </label>
          <label className="field">
            <span>{t("prod.sodium")}</span>
            <input value={sodium} onChange={(event) => setSodium(event.target.value)} />
          </label>
          <label className="field">
            <span>{t("prod.caffeine")}</span>
            <input value={caffeine} onChange={(event) => setCaffeine(event.target.value)} />
          </label>
          <label className="field">
            <span>{t("prod.serving")}</span>
            <input value={serving} onChange={(event) => setServing(event.target.value)} />
          </label>
          {error ? <ErrorText code={error} /> : null}
          <button type="button" className="bt" onClick={() => void saveProduct()}>
            {t("common.save")}
          </button>
        </>
      ) : null}
    </Screen>
  );
}

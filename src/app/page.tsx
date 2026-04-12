"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BalanceCard } from "@/components/BalanceCard";
import { CTAButton } from "@/components/CTAButton";
import { EarningsCard } from "@/components/EarningsCard";
import { RecommendationCard } from "@/components/RecommendationCard";
import { SleepingVisual } from "@/components/SleepingVisual";
import { fetchEarnVaults } from "@/lib/lifiEarn";
import { FALLBACK_VAULTS, MOCK_IDLE_BALANCE } from "@/lib/mockData";
import { rankRoutes } from "@/lib/ranking";
import { formatUsd } from "@/lib/format";
import type { RecommendedRoute } from "@/types/earn";

type FlowState = "home" | "recommendation" | "success";
type RouteState = "loading" | "ready" | "empty" | "fallback";

const ACTIVATION_STEPS = [
  "Preparing route",
  "Routing funds",
  "Heartbeat detected",
  "Funds revived",
];

function isFallbackRoute(slug: string) {
  return FALLBACK_VAULTS.some((vault) => vault.slug === slug);
}

export default function Home() {
  const [flow, setFlow] = useState<FlowState>("home");
  const [routeState, setRouteState] = useState<RouteState>("loading");
  const [routes, setRoutes] = useState<RecommendedRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const [isActivating, setIsActivating] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadRoutes() {
      try {
        const vaults = await fetchEarnVaults();
        const ranked = rankRoutes(vaults, MOCK_IDLE_BALANCE);

        if (cancelled) {
          return;
        }

        if (ranked.length === 0) {
          setRouteState("empty");
          setRoutes([]);
          return;
        }

        setRoutes(ranked);
        setRouteState(isFallbackRoute(ranked[0].slug) ? "fallback" : "ready");
      } catch {
        if (cancelled) {
          return;
        }

        const rankedFallback = rankRoutes(FALLBACK_VAULTS, MOCK_IDLE_BALANCE);
        setRoutes(rankedFallback);
        setRouteState("fallback");
      }
    }

    void loadRoutes();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isActivating) {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (progressIndex >= ACTIVATION_STEPS.length - 1) {
        setIsActivating(false);
        setProgressIndex(0);
        setFlow("success");
        return;
      }

      setProgressIndex((current) => current + 1);
    }, 850);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isActivating, progressIndex]);

  const activeRoute = routes[routeIndex] ?? null;

  function handleWakeUp() {
    setFlow("recommendation");
  }

  function handleChooseAnotherRoute() {
    if (routes.length < 2) {
      return;
    }

    setRouteIndex((current) => (current + 1) % routes.length);
  }

  function handleReviveFunds() {
    setIsActivating(true);
    setProgressIndex(0);
  }

  function handleWakeMoreFunds() {
    setRouteIndex(0);
    setFlow("home");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
      <div className="mobile-shell">
        <div className="mobile-shell__glow mobile-shell__glow--top" />
        <div className="mobile-shell__glow mobile-shell__glow--bottom" />

        <AnimatePresence mode="wait">
          {flow === "home" ? (
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 flex flex-1 flex-col"
              exit={{ opacity: 0, y: -18 }}
              initial={{ opacity: 0, y: 18 }}
              key="home"
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <header>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/34">
                  Premium stablecoin wake-up
                </p>
                <h1 className="mt-3 text-[2.55rem] leading-[0.96] font-semibold tracking-[-0.08em] text-white">
                  Zombie Money
                </h1>
                <p className="mt-3 max-w-xs text-[15px] leading-6 text-white/62">
                  Idle stablecoins don&apos;t have to stay idle.
                </p>
              </header>

              <div className="mt-6">
                <BalanceCard
                  amount={MOCK_IDLE_BALANCE}
                  helper="Detected as idle stablecoins in your wallet"
                  status="Light sleep"
                >
                  <SleepingVisual />
                </BalanceCard>
              </div>

              <div className="mt-auto pt-6">
                <CTAButton onClick={handleWakeUp}>Wake it up</CTAButton>
                <p className="mt-4 text-center text-sm leading-6 text-white/50">
                  No dashboards. No strategy maze. Just one simple way to put idle funds to work.
                </p>
                <p className="mt-5 text-center text-[11px] uppercase tracking-[0.18em] text-white/30">
                  {routeState === "loading"
                    ? "Scanning live LI.FI routes"
                    : routeState === "fallback"
                      ? "Using a calm fallback route"
                      : "Ready to revive"}
                </p>
              </div>
            </motion.section>
          ) : null}

          {flow === "recommendation" ? (
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 flex flex-1 flex-col"
              exit={{ opacity: 0, y: -18 }}
              initial={{ opacity: 0, y: 18 }}
              key="recommendation"
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <header>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/34">
                  Live recommendation
                </p>
                <h1 className="mt-3 text-[2.35rem] leading-[0.98] font-semibold tracking-[-0.08em] text-white">
                  Wake-up plan
                </h1>
                <p className="mt-3 max-w-sm text-[15px] leading-6 text-white/62">
                  We found a simple place for your sleeping funds.
                </p>
              </header>

              <div className="mt-6 flex flex-1 flex-col gap-4">
                {routeState === "loading" ? (
                  <section className="rounded-[2rem] border border-white/10 bg-white/6 p-5 text-white/72 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                      Finding a route
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                      Scanning LI.FI Earn vaults...
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-white/58">
                      Looking for stablecoin-friendly vaults with a clean one-tap story.
                    </p>
                  </section>
                ) : null}

                {routeState === "empty" ? (
                  <section className="rounded-[2rem] border border-white/10 bg-white/6 p-5 text-white/72 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/42">No match found</p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                      Nothing felt calm enough yet
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-white/58">
                      The live vault set didn&apos;t return a stablecoin route that matches tonight&apos;s
                      simple story, so the app stays honest instead of forcing a bad recommendation.
                    </p>
                  </section>
                ) : null}

                {activeRoute ? (
                  <>
                    <RecommendationCard
                      route={activeRoute}
                      source={routeState === "fallback" ? "fallback" : "live"}
                    />

                    <section className="rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/42">Why this fits</p>
                      <div className="mt-4 grid gap-3">
                        {activeRoute.whyFits.map((reason) => (
                          <div
                            className="rounded-[1.15rem] border border-white/6 bg-black/18 px-4 py-3 text-sm text-white/74"
                            key={reason}
                          >
                            {reason}
                          </div>
                        ))}
                      </div>
                    </section>

                    <EarningsCard estimates={activeRoute.estimates} mode="preview" />
                  </>
                ) : null}
              </div>

              <div className="mt-5 space-y-3">
                <CTAButton
                  disabled={!activeRoute || routeState === "loading" || routeState === "empty"}
                  onClick={handleReviveFunds}
                >
                  Revive funds
                </CTAButton>
                <CTAButton
                  className="text-white/74"
                  disabled={routes.length < 2}
                  onClick={handleChooseAnotherRoute}
                  variant="secondary"
                >
                  Choose another route
                </CTAButton>
              </div>

              <AnimatePresence>
                {isActivating ? (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-20 flex items-end bg-slate-950/70 backdrop-blur-md"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                  >
                    <motion.div
                      animate={{ y: 0 }}
                      className="w-full rounded-t-[2rem] border-t border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(8,11,20,0.98))] p-6"
                      initial={{ y: 40 }}
                    >
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                        Activation in progress
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white">
                        {ACTIVATION_STEPS[progressIndex]}
                      </h2>
                      <div className="mt-5 space-y-3">
                        {ACTIVATION_STEPS.map((step, index) => (
                          <div
                            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
                            key={step}
                          >
                            <div
                              className={`h-2.5 w-2.5 rounded-full ${
                                index <= progressIndex ? "bg-emerald-300 shadow-[0_0_18px_rgba(134,255,218,0.55)]" : "bg-white/18"
                              }`}
                            />
                            <span className="text-sm text-white/72">{step}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.section>
          ) : null}

          {flow === "success" && activeRoute ? (
            <motion.section
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 flex flex-1 flex-col"
              exit={{ opacity: 0, y: -18 }}
              initial={{ opacity: 0, y: 18 }}
              key="success"
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <header>
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/34">
                  Active position
                </p>
                <h1 className="mt-3 text-[2.35rem] leading-[0.98] font-semibold tracking-[-0.08em] text-white">
                  Your money is awake
                </h1>
                <p className="mt-3 max-w-sm text-[15px] leading-6 text-white/62">
                  It&apos;s now working instead of waiting.
                </p>
              </header>

              <div className="mt-6 flex flex-1 flex-col gap-4">
                <section className="rounded-[2rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                  <div className="mx-auto h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,228,140,0.88)_0%,rgba(118,255,212,0.48)_40%,rgba(118,255,212,0)_75%)] shadow-[0_0_40px_rgba(255,218,121,0.16)]" />
                  <p className="mt-5 text-center text-sm text-white/52">Amount activated</p>
                  <p className="mt-2 text-center text-[2.5rem] leading-none font-semibold tracking-[-0.06em] text-white">
                    {formatUsd(MOCK_IDLE_BALANCE)}
                  </p>
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {["Active", "Earning", "Tracked"].map((tag) => (
                      <div
                        className="rounded-[1.15rem] border border-emerald-300/14 bg-emerald-300/8 px-3 py-3 text-center text-[12px] uppercase tracking-[0.16em] text-emerald-100/86"
                        key={tag}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </section>

                <EarningsCard estimates={activeRoute.estimates} mode="active" />

                <section className="rounded-[2rem] border border-white/10 bg-white/6 p-5 text-sm leading-6 text-white/62 backdrop-blur-xl">
                  Most wallets just store money. Zombie Money gives it a heartbeat.
                </section>
              </div>

              <div className="mt-5 space-y-3">
                <CTAButton onClick={handleWakeMoreFunds}>Wake more funds</CTAButton>
                <CTAButton variant="secondary">View my position</CTAButton>
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}

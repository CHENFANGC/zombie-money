import { formatPercent } from "@/lib/format";
import type { RecommendedRoute } from "@/types/earn";

type RecommendationCardProps = {
  route: RecommendedRoute;
  source: "live" | "fallback";
};

export function RecommendationCard({ route, source }: RecommendationCardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/42">Best simple route</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{route.vaultName}</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-sm text-white/78">
          {formatPercent(route.apy)}
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-white/78">
        <div className="flex items-center justify-between rounded-2xl bg-black/18 px-4 py-3">
          <span className="text-white/50">Protocol</span>
          <span>{route.protocolLabel}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-black/18 px-4 py-3">
          <span className="text-white/50">Chain</span>
          <span>{route.chain}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-black/18 px-4 py-3">
          <span className="text-white/50">Asset</span>
          <span>{route.asset}</span>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-white/64">{route.summary}</p>

      <div className="mt-4 inline-flex rounded-full border border-white/8 bg-white/6 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/48">
        {source === "live" ? "Live LI.FI data" : "Fallback route"}
      </div>
    </section>
  );
}

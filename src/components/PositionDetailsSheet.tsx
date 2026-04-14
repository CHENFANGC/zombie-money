"use client";

import { formatPercent, formatUsd } from "@/lib/format";
import type { RecommendedRoute } from "@/types/earn";

type PositionDetailsSheetProps = {
  amount: number;
  open: boolean;
  onClose: () => void;
  route: RecommendedRoute;
};

export function PositionDetailsSheet({
  amount,
  open,
  onClose,
  route,
}: PositionDetailsSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-30 flex items-end bg-slate-950/72 backdrop-blur-md">
      <div className="w-full rounded-t-[2rem] border-t border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.98),rgba(8,11,20,0.98))] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Tracked position</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white">
              {route.vaultName}
            </h2>
          </div>
          <button
            className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/62 transition hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-white/78">
          <div className="flex items-center justify-between rounded-2xl bg-black/18 px-4 py-3">
            <span className="text-white/50">Activated</span>
            <span>{formatUsd(amount)}</span>
          </div>
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
          <div className="flex items-center justify-between rounded-2xl bg-black/18 px-4 py-3">
            <span className="text-white/50">APY</span>
            <span>{formatPercent(route.apy)}</span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {route.protocolUrl ? (
            <a
              className="inline-flex w-full items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,#9fffd8_0%,#77d7ff_45%,#fee38b_100%)] px-5 py-4 text-[15px] font-semibold tracking-[-0.02em] text-slate-950 shadow-[0_18px_40px_rgba(109,255,208,0.18)] transition hover:scale-[1.01]"
              href={route.protocolUrl}
              rel="noreferrer"
              target="_blank"
            >
              View protocol
            </a>
          ) : null}
          <button
            className="inline-flex w-full items-center justify-center rounded-[1.35rem] border border-white/10 bg-white/6 px-5 py-4 text-[15px] font-semibold tracking-[-0.02em] text-white/82 transition hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            Back to app
          </button>
        </div>
      </div>
    </div>
  );
}

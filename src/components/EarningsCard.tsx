import { formatUsd } from "@/lib/format";
import type { EarningsEstimates } from "@/types/earn";

type EarningsCardProps = {
  estimates: EarningsEstimates;
  mode: "preview" | "active";
};

const LABELS = {
  preview: ["Daily", "Weekly", "Monthly"],
  active: ["Today", "This week", "This month"],
} as const;

export function EarningsCard({ estimates, mode }: EarningsCardProps) {
  const labels = LABELS[mode];
  const values = [estimates.daily, estimates.weekly, estimates.monthly];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.22em] text-white/42">
        {mode === "preview" ? "If it wakes up" : "Heartbeat"}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {labels.map((label, index) => (
          <div
            className="rounded-[1.25rem] border border-white/6 bg-black/18 px-3 py-4"
            key={label}
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">{label}</p>
            <p className="mt-3 text-lg font-semibold tracking-[-0.04em] text-white">
              {formatUsd(values[index])}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

import { formatUsd } from "@/lib/format";

type BalanceCardProps = {
  amount: number;
  status: string;
  helper: string;
  children?: React.ReactNode;
};

export function BalanceCard({ amount, status, helper, children }: BalanceCardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
      <div className="inline-flex rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-emerald-100/90 uppercase">
        {status}
      </div>
      <div className="mt-4">
        <p className="text-sm text-white/58">Your money is sleeping</p>
        <p className="mt-2 text-[2.65rem] leading-none font-semibold tracking-[-0.06em] text-white">
          {formatUsd(amount)}
        </p>
        <p className="mt-3 max-w-xs text-sm leading-6 text-white/62">{helper}</p>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

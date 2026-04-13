"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSyncExternalStore } from "react";

type WalletConnectPillProps = {
  label?: string;
  size?: "pill" | "full";
};

export function WalletConnectPill({
  label = "Connect wallet",
  size = "pill",
}: WalletConnectPillProps) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const baseClassName =
    size === "full"
      ? "inline-flex w-full items-center justify-center rounded-[1.35rem] px-5 py-4 text-[15px] font-semibold tracking-[-0.02em] transition"
      : "rounded-full px-4 py-2 text-[11px] font-medium tracking-[0.18em] uppercase transition";
  const disconnectedClassName =
    size === "full"
      ? "bg-[linear-gradient(135deg,#9fffd8_0%,#77d7ff_45%,#fee38b_100%)] text-slate-950 shadow-[0_18px_40px_rgba(109,255,208,0.18)] hover:scale-[1.01]"
      : "border border-white/10 bg-white/8 text-white/78 hover:bg-white/12";
  const connectedClassName =
    size === "full"
      ? "border border-emerald-300/14 bg-emerald-300/10 text-white/84 hover:bg-emerald-300/14"
      : "border border-emerald-300/14 bg-emerald-300/10 text-white/84 hover:bg-emerald-300/14";

  if (!mounted) {
    return (
      <button
        className={`${baseClassName} border border-white/10 bg-white/8 text-white/52 ${
          size === "pill" ? "uppercase" : ""
        }`}
        disabled
        type="button"
      >
        {size === "full" ? "Loading wallet" : "Wallet"}
      </button>
    );
  }

  return (
    <ConnectButton.Custom>
      {({ account, chain, mounted: rainbowMounted, openAccountModal, openConnectModal, openChainModal }) => {
        const connected = rainbowMounted && account && chain;

        if (!connected) {
          return (
            <button
              className={`${baseClassName} ${disconnectedClassName} ${
                size === "pill" ? "uppercase" : ""
              }`}
              onClick={openConnectModal}
              type="button"
            >
              {label}
            </button>
          );
        }

        return (
          <button
            className={`${baseClassName} ${connectedClassName} ${
              size === "pill" ? "uppercase" : ""
            }`}
            onClick={chain.unsupported ? openChainModal : openAccountModal}
            type="button"
          >
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

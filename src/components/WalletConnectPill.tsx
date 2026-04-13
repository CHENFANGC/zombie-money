"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSyncExternalStore } from "react";

export function WalletConnectPill() {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <button
        className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-white/52 uppercase"
        disabled
        type="button"
      >
        Wallet
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
              className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-white/78 uppercase transition hover:bg-white/12"
              onClick={openConnectModal}
              type="button"
            >
              Connect wallet
            </button>
          );
        }

        return (
          <button
            className="rounded-full border border-emerald-300/14 bg-emerald-300/10 px-4 py-2 text-[11px] font-medium tracking-[0.18em] text-white/84 uppercase transition hover:bg-emerald-300/14"
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

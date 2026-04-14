"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useDisconnect } from "wagmi";

type WalletConnectPillProps = {
  label?: string;
  size?: "pill" | "full";
};

export function WalletConnectPill({
  label = "Connect wallet",
  size = "pill",
}: WalletConnectPillProps) {
  const { disconnect } = useDisconnect();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (!isMenuOpen) {
      return;
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isMenuOpen]);

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
    <div className={size === "pill" ? "relative" : "w-full"} ref={containerRef}>
      <ConnectButton.Custom>
      {({ account, chain, mounted: rainbowMounted, openConnectModal, openChainModal }) => {
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
          <>
            <button
              className={`${baseClassName} ${connectedClassName} ${
                size === "pill" ? "uppercase" : ""
              }`}
              onClick={chain.unsupported ? openChainModal : () => setIsMenuOpen((open) => !open)}
              type="button"
            >
              {account.displayName}
            </button>

            {size === "pill" && isMenuOpen ? (
              <div className="absolute right-0 z-30 mt-3 w-[min(84vw,20rem)] rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(24,31,48,0.98),rgba(11,14,25,0.98))] p-4 shadow-[0_24px_80px_rgba(2,7,18,0.58)] backdrop-blur-xl">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Connected wallet</p>
                <p className="mt-3 text-base font-semibold tracking-[-0.03em] text-white">
                  {account.displayName}
                </p>
                {"address" in account ? (
                  <p className="mt-1 text-xs text-white/46">{account.address}</p>
                ) : null}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    className="rounded-[1.1rem] border border-white/10 bg-white/6 px-3 py-3 text-sm text-white/78 transition hover:bg-white/10"
                    onClick={async () => {
                      if ("address" in account && navigator?.clipboard) {
                        await navigator.clipboard.writeText(account.address);
                      }

                      setIsMenuOpen(false);
                    }}
                    type="button"
                  >
                    Copy address
                  </button>
                  <button
                    className="rounded-[1.1rem] border border-emerald-300/14 bg-emerald-300/10 px-3 py-3 text-sm text-white/84 transition hover:bg-emerald-300/14"
                    onClick={() => {
                      disconnect();
                      setIsMenuOpen(false);
                    }}
                    type="button"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : null}
          </>
        );
      }}
      </ConnectButton.Custom>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { erc20Abi, createPublicClient, http, type Address } from "viem";
import { arbitrum, base, mainnet } from "viem/chains";
import { useAccount } from "wagmi";
import { aggregateUsdcBalances } from "@/lib/usdcBalance";
import type { SleepingUsdcSnapshot } from "@/types/wallet";

const clients = {
  [mainnet.id]: createPublicClient({ chain: mainnet, transport: http() }),
  [base.id]: createPublicClient({ chain: base, transport: http() }),
  [arbitrum.id]: createPublicClient({ chain: arbitrum, transport: http() }),
};

const DISCONNECTED_SNAPSHOT: SleepingUsdcSnapshot = {
  status: "disconnected",
  total: 0,
  balances: [],
  failedChains: [],
};

async function readUsdcBalance(input: {
  address: Address;
  chainId: number;
  tokenAddress: Address;
}) {
  const client = clients[input.chainId];

  return client.readContract({
    address: input.tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [input.address],
  });
}

export function useSleepingUsdcBalance() {
  const { address, isConnected } = useAccount();
  const [snapshot, setSnapshot] =
    useState<SleepingUsdcSnapshot>(DISCONNECTED_SNAPSHOT);

  const refresh = useCallback(async () => {
    if (!address) {
      setSnapshot(DISCONNECTED_SNAPSHOT);
      return;
    }

    setSnapshot((current) => ({
      ...current,
      status: "loading",
    }));

    try {
      const next = await aggregateUsdcBalances(address, readUsdcBalance);
      setSnapshot(next);
    } catch {
      setSnapshot({
        status: "error",
        total: 0,
        balances: [],
        failedChains: ["Ethereum", "Base", "Arbitrum"],
      });
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    ...snapshot,
    isConnected,
    hasReadyBalance: snapshot.status === "ready" && snapshot.total > 0,
    refresh,
  };
}

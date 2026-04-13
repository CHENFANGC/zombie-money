"use client";

import { useQuery } from "@tanstack/react-query";
import { erc20Abi, createPublicClient, http, type Address } from "viem";
import { arbitrum, base, mainnet } from "viem/chains";
import { useAccount } from "wagmi";
import { aggregateUsdcBalances } from "@/lib/usdcBalance";
import type { SleepingUsdcSnapshot } from "@/types/wallet";

function getClient(chainId: number) {
  switch (chainId) {
    case mainnet.id:
      return createPublicClient({ chain: mainnet, transport: http() });
    case base.id:
      return createPublicClient({ chain: base, transport: http() });
    case arbitrum.id:
      return createPublicClient({ chain: arbitrum, transport: http() });
    default:
      throw new Error(`Unsupported chain ${chainId}`);
  }
}

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
  const client = getClient(input.chainId);

  return client.readContract({
    address: input.tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [input.address],
  });
}

export function useSleepingUsdcBalance() {
  const { address, isConnected } = useAccount();
  const balanceQuery = useQuery({
    queryKey: ["sleeping-usdc", address],
    queryFn: async () => aggregateUsdcBalances(address!, readUsdcBalance),
    enabled: Boolean(address),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  if (!address || !isConnected) {
    return {
      ...DISCONNECTED_SNAPSHOT,
      isConnected: false,
      hasReadyBalance: false,
      refresh: async () => DISCONNECTED_SNAPSHOT,
    };
  }

  if (balanceQuery.isPending) {
    return {
      ...(balanceQuery.data ?? DISCONNECTED_SNAPSHOT),
      status: "loading" as const,
      isConnected,
      hasReadyBalance: false,
      refresh: balanceQuery.refetch,
    };
  }

  if (balanceQuery.isError || !balanceQuery.data) {
    return {
      status: "error" as const,
      total: 0,
      balances: [],
      failedChains: ["Ethereum", "Base", "Arbitrum"],
      isConnected,
      hasReadyBalance: false,
      refresh: balanceQuery.refetch,
    };
  }

  const snapshot: SleepingUsdcSnapshot = balanceQuery.data;

  return {
    ...snapshot,
    isConnected,
    hasReadyBalance: snapshot.status === "ready" && snapshot.total > 0,
    refresh: balanceQuery.refetch,
  };
}

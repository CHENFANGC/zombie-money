import { formatUnits, type Address } from "viem";
import { arbitrum, base, mainnet } from "viem/chains";
import type { ChainBalance, SleepingUsdcSnapshot } from "@/types/wallet";

export const SUPPORTED_USDC = [
  {
    chainId: mainnet.id,
    chainName: "Ethereum",
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address,
    decimals: 6,
  },
  {
    chainId: base.id,
    chainName: "Base",
    tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
    decimals: 6,
  },
  {
    chainId: arbitrum.id,
    chainName: "Arbitrum",
    tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" as Address,
    decimals: 6,
  },
] as const;

type ReadBalance = (input: {
  address: Address;
  chainId: number;
  tokenAddress: Address;
}) => Promise<bigint>;

function normalizeAmount(raw: bigint, decimals: number) {
  return Number(formatUnits(raw, decimals));
}

export async function aggregateUsdcBalances(
  address: Address,
  readBalance: ReadBalance,
): Promise<SleepingUsdcSnapshot> {
  const balances: ChainBalance[] = [];
  const failedChains: string[] = [];

  for (const token of SUPPORTED_USDC) {
    try {
      const raw = await readBalance({
        address,
        chainId: token.chainId,
        tokenAddress: token.tokenAddress,
      });

      balances.push({
        chainId: token.chainId,
        chainName: token.chainName,
        amount: normalizeAmount(raw, token.decimals),
      });
    } catch {
      failedChains.push(token.chainName);
    }
  }

  const total = Number(
    balances.reduce((sum, balance) => sum + balance.amount, 0).toFixed(2),
  );

  if (balances.length === 0) {
    return {
      status: "error",
      total: 0,
      balances: [],
      failedChains,
    };
  }

  if (total === 0) {
    return {
      status: "empty",
      total: 0,
      balances,
      failedChains,
    };
  }

  return {
    status: "ready",
    total,
    balances,
    failedChains,
  };
}

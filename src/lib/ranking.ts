import type { EarningsEstimates, EarnVault, RecommendedRoute } from "@/types/earn";

const TRUSTED_PROTOCOLS = new Set([
  "aave-v3",
  "compound-v3",
  "euler-v2",
  "morpho-v1",
  "sky-earn",
]);

const PREFERRED_CHAINS = new Set(["Base", "Arbitrum", "Ethereum"]);

export function buildEarningsEstimates(amount: number, apy: number): EarningsEstimates {
  const yearly = amount * (apy / 100);

  return {
    daily: Number((yearly / 365).toFixed(2)),
    weekly: Number((yearly / 52).toFixed(2)),
    monthly: Number((yearly / 12).toFixed(2)),
  };
}

function scoreVault(vault: EarnVault) {
  let score = 0;

  if (vault.asset === "USDC") score += 5;
  if (vault.isStablecoinLike) score += 4;
  if (vault.tags.includes("single")) score += 2;
  if (vault.hasInstantDeposit) score += 3;
  if (vault.isTransactional) score += 2;
  if (vault.isRedeemable) score += 1;
  if (TRUSTED_PROTOCOLS.has(vault.protocol)) score += 4;
  if (PREFERRED_CHAINS.has(vault.chain)) score += 2;
  if (vault.tvlUsd >= 1_000_000) score += 4;
  if (vault.tvlUsd >= 5_000_000) score += 1;
  if (vault.apy >= 3 && vault.apy <= 10) score += 4;
  if (vault.apy > 10 && vault.apy <= 20) score += 1;
  if (vault.apy > 20) score -= 8;
  if (vault.protocol === "unknown") score -= 4;

  return score;
}

export function rankRoutes(vaults: EarnVault[], amount: number): RecommendedRoute[] {
  const ranked = [...vaults]
    .filter((vault) => vault.isStablecoinLike && vault.asset.toUpperCase().includes("USD"))
    .map((vault) => ({ vault, score: scoreVault(vault) }))
    .sort((left, right) => right.score - left.score || right.vault.tvlUsd - left.vault.tvlUsd);

  return ranked.map(({ vault, score }) => ({
    ...vault,
    score,
    summary:
      vault.protocolLabel === "Morpho"
        ? "A clean USDC route on Base with a familiar protocol and a low-friction deposit story."
        : `A simple ${vault.asset} route on ${vault.chain} with a consumer-friendly deposit flow.`,
    whyFits: [
      "You already hold USDC",
      "No complex strategy setup",
      "Designed for a fast deposit-and-chill flow",
    ],
    estimates: buildEarningsEstimates(amount, vault.apy),
  }));
}

export function pickBestRoute(vaults: EarnVault[], amount: number): RecommendedRoute {
  const ranked = rankRoutes(vaults, amount);
  const winner = ranked[0];

  if (!winner) {
    throw new Error("No vaults available to rank");
  }

  return winner;
}

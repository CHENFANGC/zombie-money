import { describe, expect, it } from "vitest";
import { pickBestRoute } from "./ranking";

const vaults = [
  {
    vaultName: "Moonshot USDC",
    protocol: "unknown",
    protocolLabel: "Unknown",
    chain: "Ethereum",
    chainId: 1,
    asset: "USDC",
    apy: 380,
    baseApy: 380,
    rewardApy: 0,
    tvlUsd: 300000,
    isStablecoinLike: true,
    hasInstantDeposit: true,
    isTransactional: true,
    isRedeemable: true,
    summary: "",
    slug: "a",
    tags: ["stablecoin"],
  },
  {
    vaultName: "RE7USDC",
    protocol: "morpho-v1",
    protocolLabel: "Morpho",
    chain: "Base",
    chainId: 8453,
    asset: "USDC",
    apy: 5.7,
    baseApy: 5.7,
    rewardApy: 0,
    tvlUsd: 2000000,
    isStablecoinLike: true,
    hasInstantDeposit: true,
    isTransactional: true,
    isRedeemable: true,
    summary: "",
    slug: "b",
    tags: ["stablecoin", "single"],
  },
];

describe("pickBestRoute", () => {
  it("prefers believable stablecoin vaults over extreme APY outliers", () => {
    const best = pickBestRoute(vaults, 428.16);

    expect(best.slug).toBe("b");
    expect(best.estimates.monthly).toBeGreaterThan(1);
  });
});

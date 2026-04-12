import { describe, expect, it } from "vitest";
import { normalizeVault, parseVaultResponse } from "./lifiEarn";

describe("normalizeVault", () => {
  it("maps a LI.FI vault into the app shape", () => {
    const vault = normalizeVault({
      name: "RE7USDC",
      chainId: 8453,
      network: "Base",
      protocol: { name: "morpho-v1", url: "https://app.morpho.org" },
      analytics: { apy: { base: 5.2, total: 5.2 }, tvl: { usd: "2000000" } },
      underlyingTokens: [{ symbol: "USDC", address: "0x1", decimals: 6 }],
      depositPacks: [{ name: "morpho-zaps", stepsType: "instant" }],
      isTransactional: true,
      isRedeemable: true,
      tags: ["stablecoin", "single"],
      slug: "8453-test",
      address: "0xabc",
    });

    expect(vault.asset).toBe("USDC");
    expect(vault.chain).toBe("Base");
    expect(vault.apy).toBe(5.2);
    expect(vault.isStablecoinLike).toBe(true);
  });

  it("extracts vaults from the live API response envelope", () => {
    const parsed = parseVaultResponse({
      data: [
        {
          name: "USDC",
          chainId: 8453,
          network: "Base",
          protocol: { name: "yo-protocol" },
          analytics: { apy: { base: 4.6, total: 16.6 }, tvl: { usd: "1000000" } },
          underlyingTokens: [{ symbol: "USDC" }],
          depositPacks: [],
          tags: ["stablecoin"],
          slug: "x",
          address: "0x1",
          isTransactional: true,
          isRedeemable: false,
        },
      ],
    });

    expect(parsed).toHaveLength(1);
    expect(parsed[0].vaultName).toBe("USDC");
  });
});

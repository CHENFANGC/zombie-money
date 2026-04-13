import { describe, expect, it, vi } from "vitest";
import { aggregateUsdcBalances } from "./usdcBalance";

describe("aggregateUsdcBalances", () => {
  it("sums balances from all supported chains", async () => {
    const readBalance = vi
      .fn()
      .mockResolvedValueOnce(125_000_000n)
      .mockResolvedValueOnce(200_000_000n)
      .mockResolvedValueOnce(103_160_000n);

    const result = await aggregateUsdcBalances(
      "0x000000000000000000000000000000000000dEaD",
      readBalance,
    );

    expect(result.total).toBe(428.16);
    expect(result.status).toBe("ready");
    expect(result.failedChains).toEqual([]);
  });

  it("returns empty when every chain balance is zero", async () => {
    const readBalance = vi.fn().mockResolvedValue(0n);

    const result = await aggregateUsdcBalances(
      "0x000000000000000000000000000000000000dEaD",
      readBalance,
    );

    expect(result.total).toBe(0);
    expect(result.status).toBe("empty");
  });

  it("reports an error when all chain reads fail", async () => {
    const readBalance = vi.fn().mockRejectedValue(new Error("rpc down"));

    const result = await aggregateUsdcBalances(
      "0x000000000000000000000000000000000000dEaD",
      readBalance,
    );

    expect(result.status).toBe("error");
    expect(result.failedChains).toEqual(["Ethereum", "Base", "Arbitrum"]);
  });
});

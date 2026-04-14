import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { PositionDetailsSheet } from "./PositionDetailsSheet";

const route = {
  vaultName: "RE7USDC",
  slug: "8453-re7usdc",
  protocol: "morpho-v1",
  protocolLabel: "Morpho",
  protocolUrl: "https://app.morpho.org/base",
  chain: "Base",
  chainId: 8453,
  asset: "USDC",
  apy: 5.77,
  baseApy: 5.77,
  rewardApy: 0,
  tvlUsd: 2048964,
  summary: "A calm route",
  description: "Stablecoin vault on Base",
  tags: ["stablecoin", "single"],
  hasInstantDeposit: true,
  isStablecoinLike: true,
  isTransactional: true,
  isRedeemable: true,
  whyFits: [],
  estimates: {
    daily: 0.01,
    weekly: 0.08,
    monthly: 0.33,
  },
  score: 42,
};

test("renders tracked position details when opened", () => {
  render(
    <PositionDetailsSheet
      amount={17.99}
      onClose={() => undefined}
      open
      route={route}
    />,
  );

  expect(screen.getByText(/tracked position/i)).toBeInTheDocument();
  expect(screen.getByText(/morpho/i)).toBeInTheDocument();
  expect(screen.getByText(/\$17.99/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /view protocol/i })).toHaveAttribute(
    "href",
    route.protocolUrl,
  );
});

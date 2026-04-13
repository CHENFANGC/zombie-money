import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

vi.mock("@/lib/lifiEarn", () => ({
  fetchEarnVaults: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/useSleepingUsdcBalance", () => ({
  useSleepingUsdcBalance: vi.fn(() => ({
    status: "disconnected",
    total: 0,
    balances: [],
    failedChains: [],
    isConnected: false,
    hasReadyBalance: false,
    refresh: vi.fn(),
  })),
}));

vi.mock("@/components/WalletConnectPill", () => ({
  WalletConnectPill: () => <button type="button">Connect wallet</button>,
}));

import Home from "./page";

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>,
  );
}

test("shows connect messaging when the wallet is disconnected", () => {
  renderHome();

  expect(screen.getByText(/connect your wallet to detect sleeping usdc/i)).toBeInTheDocument();
});

test("moves to recommendation when a real balance is ready", async () => {
  const user = userEvent.setup();
  const { useSleepingUsdcBalance } = await import("@/lib/useSleepingUsdcBalance");

  vi.mocked(useSleepingUsdcBalance).mockReturnValue({
    status: "ready",
    total: 428.16,
    balances: [
      { chainId: 1, chainName: "Ethereum", amount: 125 },
      { chainId: 8453, chainName: "Base", amount: 200 },
      { chainId: 42161, chainName: "Arbitrum", amount: 103.16 },
    ],
    failedChains: [],
    isConnected: true,
    hasReadyBalance: true,
    refresh: vi.fn(),
  });

  renderHome();

  await user.click(screen.getByRole("button", { name: /wake it up/i }));

  expect(await screen.findByText(/wake-up plan/i)).toBeInTheDocument();
});

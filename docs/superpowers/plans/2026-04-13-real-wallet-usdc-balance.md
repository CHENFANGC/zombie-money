# Real Wallet + Real USDC Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect a real wallet and replace the mocked idle balance with the user's real USDC balance across Ethereum, Base, and Arbitrum.

**Architecture:** Add a small wallet provider layer with `wagmi`, `RainbowKit`, and `@tanstack/react-query`, then isolate the multi-chain USDC reads in a pure library module that can be tested without the UI. Finally, wire the result into the existing page state machine so the app stays narrative-first while handling disconnected, loading, empty, ready, and error states honestly.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind, Framer Motion, wagmi, RainbowKit, viem, Vitest, Testing Library

---

## File Map

- Create: `/Users/chenfang/Desktop/web3/zombie-money/src/components/AppProviders.tsx`
- Create: `/Users/chenfang/Desktop/web3/zombie-money/src/components/WalletConnectPill.tsx`
- Create: `/Users/chenfang/Desktop/web3/zombie-money/src/lib/usdcBalance.ts`
- Create: `/Users/chenfang/Desktop/web3/zombie-money/src/lib/usdcBalance.test.ts`
- Create: `/Users/chenfang/Desktop/web3/zombie-money/src/lib/useSleepingUsdcBalance.ts`
- Create: `/Users/chenfang/Desktop/web3/zombie-money/src/types/wallet.ts`
- Create: `/Users/chenfang/Desktop/web3/zombie-money/.env.example`
- Modify: `/Users/chenfang/Desktop/web3/zombie-money/package.json`
- Modify: `/Users/chenfang/Desktop/web3/zombie-money/src/app/layout.tsx`
- Modify: `/Users/chenfang/Desktop/web3/zombie-money/src/app/page.tsx`
- Modify: `/Users/chenfang/Desktop/web3/zombie-money/src/app/page.test.tsx`
- Modify: `/Users/chenfang/Desktop/web3/zombie-money/README.md`

### Task 1: Add wallet providers and app wiring

**Files:**
- Create: `/Users/chenfang/Desktop/web3/zombie-money/src/components/AppProviders.tsx`
- Create: `/Users/chenfang/Desktop/web3/zombie-money/.env.example`
- Modify: `/Users/chenfang/Desktop/web3/zombie-money/package.json`
- Modify: `/Users/chenfang/Desktop/web3/zombie-money/src/app/layout.tsx`

- [ ] **Step 1: Add the wallet dependencies**

```json
{
  "dependencies": {
    "@rainbow-me/rainbowkit": "^2.2.10",
    "@tanstack/react-query": "^5.90.5",
    "framer-motion": "^12.38.0",
    "next": "16.2.3",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "viem": "^2.38.2",
    "wagmi": "^2.18.1"
  }
}
```

Run: `npm install`
Expected: install completes without peer-dependency errors

- [ ] **Step 2: Add an env template for WalletConnect Cloud**

```dotenv
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

Write this to `/Users/chenfang/Desktop/web3/zombie-money/.env.example`.

- [ ] **Step 3: Create the app provider wrapper**

```tsx
"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { darkTheme, getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { http, WagmiProvider } from "wagmi";
import { arbitrum, base, mainnet } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-project-id";

const config = getDefaultConfig({
  appName: "Zombie Money",
  projectId,
  chains: [mainnet, base, arbitrum],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: true,
});

const theme = darkTheme({
  accentColor: "#6ff4d3",
  accentColorForeground: "#041017",
  borderRadius: "large",
  fontStack: "system",
  overlayBlur: "small",
});

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" theme={theme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

- [ ] **Step 4: Wrap the app tree in the new providers**

```tsx
import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";

// ...existing font + metadata setup...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${plexMono.variable} h-full bg-[var(--app-bg)] text-[var(--text-primary)] antialiased`}
    >
      <body className="min-h-full">
        <AppProviders>
          <div className="app-chrome">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify the app still builds**

Run: `npm run lint`
Expected: no ESLint errors

Run: `npm run build`
Expected: production build succeeds with the new providers in place

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json .env.example src/components/AppProviders.tsx src/app/layout.tsx
git commit -m "feat: add wallet providers"
```

### Task 2: Build and test multi-chain USDC balance aggregation

**Files:**
- Create: `/Users/chenfang/Desktop/web3/zombie-money/src/types/wallet.ts`
- Create: `/Users/chenfang/Desktop/web3/zombie-money/src/lib/usdcBalance.ts`
- Create: `/Users/chenfang/Desktop/web3/zombie-money/src/lib/usdcBalance.test.ts`

- [ ] **Step 1: Write the failing tests for balance aggregation**

```ts
import { describe, expect, it, vi } from "vitest";
import { aggregateUsdcBalances } from "./usdcBalance";

describe("aggregateUsdcBalances", () => {
  it("sums balances from all supported chains", async () => {
    const readBalance = vi
      .fn()
      .mockResolvedValueOnce(125_000_000n)
      .mockResolvedValueOnce(200_000_000n)
      .mockResolvedValueOnce(103_160_000n);

    const result = await aggregateUsdcBalances("0x000000000000000000000000000000000000dEaD", readBalance);

    expect(result.total).toBe(428.16);
    expect(result.status).toBe("ready");
    expect(result.failedChains).toEqual([]);
  });

  it("returns empty when every chain balance is zero", async () => {
    const readBalance = vi.fn().mockResolvedValue(0n);

    const result = await aggregateUsdcBalances("0x000000000000000000000000000000000000dEaD", readBalance);

    expect(result.total).toBe(0);
    expect(result.status).toBe("empty");
  });

  it("reports an error when all chain reads fail", async () => {
    const readBalance = vi.fn().mockRejectedValue(new Error("rpc down"));

    const result = await aggregateUsdcBalances("0x000000000000000000000000000000000000dEaD", readBalance);

    expect(result.status).toBe("error");
    expect(result.failedChains).toEqual(["Ethereum", "Base", "Arbitrum"]);
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npx vitest run src/lib/usdcBalance.test.ts`
Expected: FAIL because `./usdcBalance` does not exist yet

- [ ] **Step 3: Add the wallet types**

```ts
export type WalletBalanceStatus = "disconnected" | "loading" | "ready" | "empty" | "error";

export type ChainBalance = {
  chainId: number;
  chainName: string;
  amount: number;
};

export type SleepingUsdcSnapshot = {
  status: WalletBalanceStatus;
  total: number;
  balances: ChainBalance[];
  failedChains: string[];
};
```

- [ ] **Step 4: Implement the aggregation module**

```ts
import { formatUnits, type Address } from "viem";
import { arbitrum, base, mainnet } from "viem/chains";
import type { SleepingUsdcSnapshot } from "@/types/wallet";

const SUPPORTED_USDC = [
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

export async function aggregateUsdcBalances(
  address: Address,
  readBalance: ReadBalance,
): Promise<SleepingUsdcSnapshot> {
  const balances = [];
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
        amount: Number(formatUnits(raw, token.decimals)),
      });
    } catch {
      failedChains.push(token.chainName);
    }
  }

  const total = Number(
    balances.reduce((sum, balance) => sum + balance.amount, 0).toFixed(2),
  );

  if (balances.length === 0) {
    return { status: "error", total: 0, balances: [], failedChains };
  }

  if (total === 0) {
    return { status: "empty", total: 0, balances, failedChains };
  }

  return { status: "ready", total, balances, failedChains };
}
```

- [ ] **Step 5: Re-run the balance tests**

Run: `npx vitest run src/lib/usdcBalance.test.ts`
Expected: PASS with 3 tests passed

- [ ] **Step 6: Commit**

```bash
git add src/types/wallet.ts src/lib/usdcBalance.ts src/lib/usdcBalance.test.ts
git commit -m "feat: add real usdc balance aggregation"
```

### Task 3: Add the wallet-aware balance hook and wire the page flow

**Files:**
- Create: `/Users/chenfang/Desktop/web3/zombie-money/src/lib/useSleepingUsdcBalance.ts`
- Create: `/Users/chenfang/Desktop/web3/zombie-money/src/components/WalletConnectPill.tsx`
- Modify: `/Users/chenfang/Desktop/web3/zombie-money/src/app/page.tsx`
- Modify: `/Users/chenfang/Desktop/web3/zombie-money/src/app/page.test.tsx`

- [ ] **Step 1: Write the failing page-state tests**

```ts
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
    failedChains: [],
    isConnected: false,
    hasReadyBalance: false,
    refresh: vi.fn(),
  })),
}));

import Home from "./page";

test("shows connect messaging when the wallet is disconnected", async () => {
  render(<Home />);

  expect(screen.getByText(/connect your wallet to detect sleeping usdc/i)).toBeInTheDocument();
});

test("moves to recommendation when a real balance is ready", async () => {
  const user = userEvent.setup();
  const { useSleepingUsdcBalance } = await import("@/lib/useSleepingUsdcBalance");

  vi.mocked(useSleepingUsdcBalance).mockReturnValue({
    status: "ready",
    total: 428.16,
    failedChains: [],
    isConnected: true,
    hasReadyBalance: true,
    refresh: vi.fn(),
  });

  render(<Home />);
  await user.click(screen.getByRole("button", { name: /wake it up/i }));

  expect(await screen.findByText(/wake-up plan/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the page tests to confirm they fail**

Run: `npx vitest run src/app/page.test.tsx`
Expected: FAIL because `useSleepingUsdcBalance` and the new disconnected copy do not exist yet

- [ ] **Step 3: Add the balance hook**

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { erc20Abi, type Address, createPublicClient, http } from "viem";
import { useAccount } from "wagmi";
import { arbitrum, base, mainnet } from "viem/chains";
import { aggregateUsdcBalances } from "@/lib/usdcBalance";
import type { SleepingUsdcSnapshot, WalletBalanceStatus } from "@/types/wallet";

const clients = {
  [mainnet.id]: createPublicClient({ chain: mainnet, transport: http() }),
  [base.id]: createPublicClient({ chain: base, transport: http() }),
  [arbitrum.id]: createPublicClient({ chain: arbitrum, transport: http() }),
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
  const [snapshot, setSnapshot] = useState<SleepingUsdcSnapshot>({
    status: "disconnected",
    total: 0,
    balances: [],
    failedChains: [],
  });

  const refresh = useCallback(async () => {
    if (!address) {
      setSnapshot({
        status: "disconnected",
        total: 0,
        balances: [],
        failedChains: [],
      });
      return;
    }

    setSnapshot((current) => ({ ...current, status: "loading" as WalletBalanceStatus }));

    const next = await aggregateUsdcBalances(address, readUsdcBalance);
    setSnapshot(next);
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
```

- [ ] **Step 4: Add a compact wallet connection pill**

```tsx
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletConnectPill() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, mounted, openAccountModal, openConnectModal, openChainModal }) => {
        const connected = mounted && account && chain;

        if (!connected) {
          return (
            <button
              className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-medium tracking-[0.18em] text-white/78 uppercase"
              onClick={openConnectModal}
              type="button"
            >
              Connect wallet
            </button>
          );
        }

        return (
          <button
            className="rounded-full border border-emerald-300/18 bg-emerald-300/10 px-4 py-2 text-xs font-medium tracking-[0.18em] text-white/84 uppercase"
            onClick={chain.unsupported ? openChainModal : openAccountModal}
            type="button"
          >
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
```

- [ ] **Step 5: Wire the page to the real balance states**

```tsx
import { useEffect, useState } from "react";
import { WalletConnectPill } from "@/components/WalletConnectPill";
import { useSleepingUsdcBalance } from "@/lib/useSleepingUsdcBalance";

// inside Home()
const balance = useSleepingUsdcBalance();
const detectedAmount = balance.status === "ready" ? balance.total : 0;

useEffect(() => {
  async function loadRoutes() {
    const vaults = await fetchEarnVaults();
    const ranked = rankRoutes(vaults, detectedAmount);

    if (ranked.length === 0) {
      setRoutes([]);
      setRouteState("empty");
      return;
    }

    setRoutes(ranked);
    setRouteIndex(0);
    setRouteState(isFallbackRoute(ranked[0].slug) ? "fallback" : "ready");
  }

  if (balance.status !== "ready") {
    setRoutes([]);
    setRouteState(balance.status === "error" ? "empty" : "loading");
    return;
  }

  void loadRoutes();
}, [balance.status, detectedAmount]);

function handleWakeUp() {
  if (!balance.hasReadyBalance) return;
  setFlow("recommendation");
}

// home screen header
<div className="flex items-start justify-between gap-4">
  <div>
    <p className="text-[11px] uppercase tracking-[0.24em] text-white/34">
      Premium stablecoin wake-up
    </p>
    <h1 className="mt-3 text-[2.55rem] leading-[0.96] font-semibold tracking-[-0.08em] text-white">
      Zombie Money
    </h1>
  </div>
  <WalletConnectPill />
</div>

<BalanceCard
  amount={detectedAmount}
  helper={
    balance.status === "disconnected"
      ? "Connect your wallet to detect sleeping USDC"
      : balance.status === "loading"
        ? "Scanning Ethereum, Base, and Arbitrum for USDC"
        : balance.status === "empty"
          ? "No sleeping USDC detected yet"
          : balance.status === "error"
            ? "We couldn't read your wallet balance yet"
            : "Detected as idle USDC across your wallet"
  }
  status={
    balance.status === "ready"
      ? "Light sleep"
      : balance.status === "loading"
        ? "Scanning"
        : balance.status === "empty"
          ? "Wide awake"
          : balance.status === "error"
            ? "Unreadable"
            : "Disconnected"
  }
>
  <SleepingVisual />
</BalanceCard>
```

- [ ] **Step 6: Re-run the page tests and the full suite**

Run: `npx vitest run src/app/page.test.tsx`
Expected: PASS

Run: `npm test`
Expected: all tests pass

- [ ] **Step 7: Commit**

```bash
git add src/lib/useSleepingUsdcBalance.ts src/components/WalletConnectPill.tsx src/app/page.tsx src/app/page.test.tsx
git commit -m "feat: wire real wallet balance into app flow"
```

### Task 4: Update docs and final verification

**Files:**
- Modify: `/Users/chenfang/Desktop/web3/zombie-money/README.md`

- [ ] **Step 1: Add wallet setup notes to the README**

````md
## Wallet Setup

To enable wallet connections, create a local `.env.local` file:

```bash
cp .env.example .env.local
```

Then set:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

Browser-injected wallets can still be used for the demo, but a real WalletConnect Cloud project ID is recommended for reliable production-style connections.
````

- [ ] **Step 2: Run the final verification commands**

Run: `npm run lint`
Expected: PASS

Run: `npm test`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add wallet setup notes"
```

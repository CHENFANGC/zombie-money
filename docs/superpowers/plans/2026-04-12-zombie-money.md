# Zombie Money Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, mobile-first hackathon MVP that turns idle stablecoins into a simple emotional three-screen experience backed by real LI.FI Earn recommendation data.

**Architecture:** Use a single Next.js App Router page with local state for the three-step flow, a small LI.FI Earn client for live vault data plus a normalization/ranking layer, and focused presentational components for the narrative cards and motion. Keep wallet and activation behavior mocked, but ground the recommendation in real vault data with stable fallback data if the API fails.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Framer Motion, Vitest, Testing Library

---

### Task 1: Scaffold the project and baseline tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Create: `.gitignore`

- [ ] **Step 1: Scaffold Next.js app**

Run: `cd /Users/chenfang/Desktop/web3/zombie-money && npx create-next-app@latest . --ts --tailwind --eslint --app --use-npm --import-alias "@/*" --yes`
Expected: project files created successfully in the repo root

- [ ] **Step 2: Add test tooling**

Run: `cd /Users/chenfang/Desktop/web3/zombie-money && npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`
Expected: dev dependencies installed

- [ ] **Step 3: Add Vitest config and setup**

Code to add:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

```ts
// vitest.setup.ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Verify the project builds before feature work**

Run: `cd /Users/chenfang/Desktop/web3/zombie-money && npm run build`
Expected: production build succeeds

### Task 2: Build and test the LI.FI Earn normalization layer

**Files:**
- Create: `types/earn.ts`
- Create: `lib/lifiEarn.ts`
- Create: `lib/mockData.ts`
- Test: `lib/lifiEarn.test.ts`

- [ ] **Step 1: Write the failing normalization tests**

```ts
import { describe, expect, it } from 'vitest'
import { normalizeVault, parseVaultResponse } from './lifiEarn'

describe('normalizeVault', () => {
  it('maps a LI.FI vault into the app shape', () => {
    const vault = normalizeVault({
      name: 'RE7USDC',
      chainId: 8453,
      network: 'Base',
      protocol: { name: 'morpho-v1', url: 'https://app.morpho.org' },
      analytics: { apy: { base: 5.2, total: 5.2 }, tvl: { usd: '2000000' } },
      underlyingTokens: [{ symbol: 'USDC', address: '0x1', decimals: 6 }],
      depositPacks: [{ name: 'morpho-zaps', stepsType: 'instant' }],
      isTransactional: true,
      isRedeemable: true,
      tags: ['stablecoin', 'single'],
      slug: '8453-test',
      address: '0xabc',
    })

    expect(vault.asset).toBe('USDC')
    expect(vault.chain).toBe('Base')
    expect(vault.apy).toBe(5.2)
    expect(vault.isStablecoinLike).toBe(true)
  })

  it('extracts vaults from the live API response envelope', () => {
    const parsed = parseVaultResponse({
      data: [{ name: 'USDC', chainId: 8453, network: 'Base', protocol: { name: 'yo-protocol' }, analytics: { apy: { base: 4.6, total: 16.6 }, tvl: { usd: '1000000' } }, underlyingTokens: [{ symbol: 'USDC' }], depositPacks: [], tags: ['stablecoin'], slug: 'x', address: '0x1', isTransactional: true, isRedeemable: false }],
    })

    expect(parsed).toHaveLength(1)
    expect(parsed[0].vaultName).toBe('USDC')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/chenfang/Desktop/web3/zombie-money && npx vitest run lib/lifiEarn.test.ts`
Expected: FAIL because `lifiEarn` helpers do not exist yet

- [ ] **Step 3: Write the minimal LI.FI Earn client**

Implement:
- `normalizeVault(raw)` to map LI.FI vaults into a stable app shape
- `parseVaultResponse(payload)` to extract `payload.data`
- `fetchEarnVaults()` to call `https://earn.li.fi/v1/earn/vaults?asset=USDC&sortBy=apy&limit=40`
- fallback export from `mockData.ts` with 2-3 curated vaults

- [ ] **Step 4: Re-run tests**

Run: `cd /Users/chenfang/Desktop/web3/zombie-money && npx vitest run lib/lifiEarn.test.ts`
Expected: PASS

### Task 3: Build and test ranking guardrails

**Files:**
- Create: `lib/ranking.ts`
- Test: `lib/ranking.test.ts`

- [ ] **Step 1: Write the failing ranking tests**

```ts
import { describe, expect, it } from 'vitest'
import { pickBestRoute } from './ranking'

const vaults = [
  { vaultName: 'Moonshot USDC', protocol: 'unknown', chain: 'Ethereum', asset: 'USDC', apy: 380, tvlUsd: 300000, isStablecoinLike: true, hasInstantDeposit: true, protocolLabel: 'Unknown', summary: '', slug: 'a' },
  { vaultName: 'RE7USDC', protocol: 'morpho-v1', chain: 'Base', asset: 'USDC', apy: 5.7, tvlUsd: 2000000, isStablecoinLike: true, hasInstantDeposit: true, protocolLabel: 'Morpho', summary: '', slug: 'b' },
]

describe('pickBestRoute', () => {
  it('prefers believable stablecoin vaults over extreme APY outliers', () => {
    const best = pickBestRoute(vaults)
    expect(best.slug).toBe('b')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/chenfang/Desktop/web3/zombie-money && npx vitest run lib/ranking.test.ts`
Expected: FAIL because ranking is not implemented

- [ ] **Step 3: Implement minimal ranking**

Implement scoring rules that:
- reward USDC, stablecoin tags, Base, Morpho/Aave/Compound/Sky/Euler, instant deposits, healthy TVL
- penalize APY above a realism threshold such as `apy > 20`
- produce a single recommendation summary plus `daily`, `weekly`, `monthly` earnings estimates for `$428.16`

- [ ] **Step 4: Re-run tests**

Run: `cd /Users/chenfang/Desktop/web3/zombie-money && npx vitest run lib/ranking.test.ts`
Expected: PASS

### Task 4: Build the mobile UI and state flow

**Files:**
- Create: `components/CTAButton.tsx`
- Create: `components/BalanceCard.tsx`
- Create: `components/SleepingVisual.tsx`
- Create: `components/RecommendationCard.tsx`
- Create: `components/EarningsCard.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Write the failing UI flow test**

```ts
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'

test('moves from sleeping to recommendation state', async () => {
  const user = userEvent.setup()
  render(<Home />)
  await user.click(screen.getByRole('button', { name: /wake it up/i }))
  expect(await screen.findByText(/wake-up plan/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the UI test to verify it fails**

Run: `cd /Users/chenfang/Desktop/web3/zombie-money && npx vitest run app/page.test.tsx`
Expected: FAIL because the page and buttons are not implemented yet

- [ ] **Step 3: Implement the UI**

Build:
- a centered mobile container
- screen 1 with title, subtitle, balance card, breathing orb, helper copy
- screen 2 with one ranked recommendation and “Why this fits”
- screen 3 with success copy, active tags, and earning cards
- activation progress state with 3-4 short messages
- Framer Motion transitions between states

- [ ] **Step 4: Re-run the UI test**

Run: `cd /Users/chenfang/Desktop/web3/zombie-money && npx vitest run app/page.test.tsx`
Expected: PASS

### Task 5: Add submission assets and final product copy

**Files:**
- Modify: `README.md`
- Create: `docs/project-description.md`
- Create: `docs/x-post-draft.md`
- Create: `docs/demo-script.md`
- Create: `docs/submission-checklist.md`

- [ ] **Step 1: Write the project-facing docs**

Include:
- product story
- stack and setup
- LI.FI Earn usage
- chosen hackathon track: `DeFi UX Challenge`
- honest note that deposit execution is demo-staged while recommendation data is live

- [ ] **Step 2: Add submission assets**

Write:
- short submission description
- X post draft with app + repo placeholders
- 60-second demo script
- submission day checklist with the April 15, 2026 UTC+8 tweet window

### Task 6: Verify, commit, and publish

**Files:**
- Modify: project files as needed from verification fixes

- [ ] **Step 1: Run all verification commands**

Run:
- `cd /Users/chenfang/Desktop/web3/zombie-money && npm run lint`
- `cd /Users/chenfang/Desktop/web3/zombie-money && npx vitest run`
- `cd /Users/chenfang/Desktop/web3/zombie-money && npm run build`

Expected: all commands exit successfully

- [ ] **Step 2: Commit the project**

Run:
```bash
cd /Users/chenfang/Desktop/web3/zombie-money
git add .
git commit -m "feat: build zombie money hackathon MVP"
```

- [ ] **Step 3: Create and push the GitHub repo**

Run:
```bash
cd /Users/chenfang/Desktop/web3/zombie-money
gh repo create zombie-money --public --source=. --remote=origin --push
```

Expected: remote repo created under the authenticated GitHub account and current branch pushed

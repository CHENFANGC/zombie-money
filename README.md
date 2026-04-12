# Zombie Money

Zombie Money is a mobile-first DeFi UX prototype for the LI.FI DeFi Mullet Hackathon.

Live app: [https://chenfangc.github.io/zombie-money/](https://chenfangc.github.io/zombie-money/)
Repo: [https://github.com/CHENFANGC/zombie-money](https://github.com/CHENFANGC/zombie-money)

Instead of opening with APY tables, vault lists, or bridge jargon, it starts with a simpler truth:

**Your money is sleeping. Wake it up.**

The product is designed for the `DeFi UX Challenge` track and turns idle stablecoins into a three-screen emotional story:

1. Sleeping money
2. Wake-up plan
3. Awake money

## Why this project exists

Most DeFi yield products explain the infrastructure first and the feeling second.

Zombie Money flips that:

- It treats idle stablecoins as “sleeping money”
- It surfaces one calm recommendation instead of a dashboard
- It uses real LI.FI Earn vault data where it matters
- It keeps execution demo-friendly and believable for a hackathon sprint

## What is real vs mocked

Real:

- LI.FI Earn data from `https://earn.li.fi/v1/earn/vaults`
- Vault normalization and ranking logic
- Stablecoin-focused recommendation selection

Mocked:

- Wallet balance detection
- Deposit execution
- Activated position persistence

The app is honest about that tradeoff: it is a polished UX prototype grounded by live Earn data, not a fake “fully live” dashboard.

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Vitest + Testing Library

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run lint
npm run test
npm run build
```

## Project structure

```text
src/
  app/
    layout.tsx
    page.tsx
  components/
    BalanceCard.tsx
    CTAButton.tsx
    EarningsCard.tsx
    RecommendationCard.tsx
    SleepingVisual.tsx
  lib/
    format.ts
    lifiEarn.ts
    mockData.ts
    ranking.ts
  types/
    earn.ts
docs/
  project-description.md
  x-post-draft.md
  demo-script.md
  submission-checklist.md
```

## LI.FI Earn integration notes

- Earn data source: `https://earn.li.fi/v1/earn/vaults`
- No authentication required for the Earn Data API
- The app normalizes the live response and ranks vaults with consumer-trust guardrails
- Extreme APY outliers are penalized to avoid obviously unbelievable recommendations in the demo
- If the API is unavailable, the app falls back to curated stablecoin routes so the story still works

## Hackathon positioning

Chosen track: `DeFi UX Challenge`

Why it fits:

- Mobile-first
- DeFi explained through feeling instead of jargon
- One-tap narrative flow
- Strong demo clarity for judges in under 60 seconds

## Submission assets

See:

- [Project description](./docs/project-description.md)
- [X post draft](./docs/x-post-draft.md)
- [60-second demo script](./docs/demo-script.md)
- [Submission checklist](./docs/submission-checklist.md)

# Zombie Money Real Wallet + Real USDC Balance Design

Date: 2026-04-13
Project: Zombie Money
Scope: Replace the mocked idle balance with a real connected-wallet USDC balance while preserving the existing 3-screen narrative flow.

## Goal

Zombie Money should keep its current consumer-product story while becoming more credible in a demo:

- connect a real wallet
- detect real USDC on supported chains
- use that real balance as the "sleeping money" amount
- keep LI.FI Earn recommendation data live
- keep deposit execution mocked for now

This upgrade is intentionally narrow. It does not turn the app into a wallet dashboard, multi-asset portfolio tracker, or real transaction executor.

## Product Outcome

The app still tells the same story:

1. Home: your money is sleeping
2. Recommendation: here is one simple wake-up plan
3. Success: your money is awake

The difference is that the displayed idle amount is no longer hard-coded. It comes from the connected wallet's USDC balance across Ethereum, Base, and Arbitrum.

## Supported Wallet Behavior

### Unconnected

- The app shows the premium home screen.
- The balance card explains that a wallet connection is needed to detect sleeping USDC.
- The primary action becomes a wallet-connect action.

### Connecting

- The balance card shows a gentle loading state.
- Copy stays consumer-friendly and non-technical.

### Connected with USDC balance

- The app sums USDC across the supported chains.
- That sum becomes the idle balance shown on screen 1.
- Recommendation ranking and earnings estimates use the real summed balance.

### Connected with zero USDC

- The app enters an honest empty state.
- Copy explains that no sleeping USDC was detected yet.
- The app does not fake a recommendation amount.

### Connected but balance read failed

- The app shows a readable error state.
- It does not silently fall back to the mock balance.
- LI.FI Earn route discovery may still load, but the product should not pretend the user has detected idle funds when the wallet read failed.

## Technical Approach

### Wallet connection

- Use `wagmi` for wallet state and chain-aware clients.
- Use `RainbowKit` for a polished wallet-connection experience.
- Keep the wallet UI minimal and mobile-first.

### Balance reads

- Use `viem` to call `balanceOf(address)` on USDC contracts.
- Read balances from:
  - Ethereum mainnet
  - Base
  - Arbitrum
- Normalize token decimals and sum the balances into one USD-like display amount.

### Recommendation flow

- Keep the existing LI.FI Earn API integration as the source of truth for vault discovery.
- Replace `MOCK_IDLE_BALANCE` in ranking and earnings calculations with the real detected balance.
- Keep fallback vault data for recommendation reliability if the Earn API is unavailable.

## State Model

The balance layer will use these states:

- `disconnected`
- `loading`
- `ready`
- `empty`
- `error`

These states drive the copy and CTA behavior on the home screen. Recommendation and success views should only use a real detected amount when state is `ready`.

## UI Changes

### Home screen

- Add a small wallet action in a way that does not dominate the interface.
- Preserve the breathing visual and the emotional framing.
- Replace hard-coded helper copy with state-aware messaging.

### Recommendation screen

- Keep the current card structure and animation.
- Use the real detected amount in projected daily, weekly, and monthly earnings.
- If balance state is not `ready`, prevent the user from entering a misleading recommendation flow.

### Success screen

- Keep the mocked revive sequence.
- Use the real detected amount in the activated summary.

## Error Handling

- If wallet is not connected, do not attempt balance reads.
- If one chain read fails, continue reading the other chains and surface a partial-read warning only if the final result is unreliable.
- If all reads fail, show a clean error state with a retry path.
- If the LI.FI Earn API fails, continue using the existing fallback vault data.

## Testing

Add focused tests for:

- balance aggregation from multiple chains
- zero-balance handling
- wallet-read error handling
- recommendation calculations using the real detected amount instead of the mock amount

Manual verification should cover:

- disconnected wallet
- wallet connected with positive USDC
- wallet connected with zero USDC
- recommendation flow using a real detected amount

## Non-Goals

This scope does not include:

- real deposit execution with Composer
- multi-token stablecoin aggregation beyond USDC
- historical portfolio tracking
- bridging or route customization
- turning the app into a protocol comparison UI

## Implementation Notes

- The current mock fallback balance can remain in the codebase only for tests or isolated story/demo helpers, not as a silent production fallback for connected wallets.
- The branch for implementation should be `dev`, per request.
- The existing product tone must stay premium, calm, and emotionally distinct.

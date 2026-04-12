export type RawVault = {
  name?: string;
  slug?: string;
  tags?: string[];
  address?: string;
  chainId?: number;
  network?: string;
  protocol?: {
    url?: string;
    name?: string;
  };
  analytics?: {
    apy?: {
      base?: number;
      total?: number;
      reward?: number;
    };
    tvl?: {
      usd?: string | number;
    };
    apy1d?: number;
    apy7d?: number;
    apy30d?: number;
  };
  description?: string;
  depositPacks?: Array<{
    name?: string;
    stepsType?: string;
  }>;
  isRedeemable?: boolean;
  isTransactional?: boolean;
  underlyingTokens?: Array<{
    symbol?: string;
    address?: string;
    decimals?: number;
  }>;
};

export type EarnVault = {
  vaultName: string;
  slug: string;
  protocol: string;
  protocolLabel: string;
  protocolUrl?: string;
  chain: string;
  chainId: number;
  asset: string;
  apy: number;
  baseApy: number;
  rewardApy: number;
  tvlUsd: number;
  summary: string;
  description?: string;
  tags: string[];
  hasInstantDeposit: boolean;
  isStablecoinLike: boolean;
  isTransactional: boolean;
  isRedeemable: boolean;
};

export type EarnResponse = {
  data?: RawVault[];
};

export type EarningsEstimates = {
  daily: number;
  weekly: number;
  monthly: number;
};

export type RecommendedRoute = EarnVault & {
  whyFits: string[];
  estimates: EarningsEstimates;
  score: number;
};

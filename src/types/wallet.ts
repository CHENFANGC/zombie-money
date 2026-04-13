export type WalletBalanceStatus =
  | "disconnected"
  | "loading"
  | "ready"
  | "empty"
  | "error";

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

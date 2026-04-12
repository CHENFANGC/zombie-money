import { FALLBACK_VAULTS } from "@/lib/mockData";
import type { EarnResponse, EarnVault, RawVault } from "@/types/earn";

const EARN_ENDPOINT =
  "https://earn.li.fi/v1/earn/vaults?asset=USDC&sortBy=apy&limit=40";

const PROTOCOL_LABELS: Record<string, string> = {
  "aave-v3": "Aave",
  "compound-v3": "Compound",
  "euler-v2": "Euler",
  "morpho-v1": "Morpho",
  "sky-earn": "Sky",
  "yo-protocol": "YO",
};

const cleanProtocolLabel = (protocol?: string) => {
  if (!protocol) return "Vault";
  return PROTOCOL_LABELS[protocol] ?? protocol.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export function normalizeVault(raw: RawVault): EarnVault {
  const asset = raw.underlyingTokens?.[0]?.symbol ?? raw.name ?? "USDC";
  const tags = raw.tags ?? [];
  const totalApy = raw.analytics?.apy?.total ?? raw.analytics?.apy?.base ?? 0;
  const baseApy = raw.analytics?.apy?.base ?? totalApy;
  const rewardApy = raw.analytics?.apy?.reward ?? Math.max(totalApy - baseApy, 0);
  const protocol = raw.protocol?.name ?? "unknown";
  const protocolLabel = cleanProtocolLabel(protocol);
  const chain = raw.network ?? "Unknown chain";
  const tvlUsd = Number(raw.analytics?.tvl?.usd ?? 0);
  const hasInstantDeposit = (raw.depositPacks ?? []).some(
    (pack) => pack.stepsType === "instant",
  );
  const isStablecoinLike =
    asset.toUpperCase().includes("USD") ||
    tags.includes("stablecoin") ||
    (raw.description ?? "").toLowerCase().includes("stable");

  return {
    vaultName: raw.name ?? asset,
    slug: raw.slug ?? `${raw.chainId ?? 0}-${raw.address ?? "unknown"}`,
    protocol,
    protocolLabel,
    protocolUrl: raw.protocol?.url,
    chain,
    chainId: raw.chainId ?? 0,
    asset,
    apy: Number(totalApy.toFixed(2)),
    baseApy: Number(baseApy.toFixed(2)),
    rewardApy: Number(rewardApy.toFixed(2)),
    tvlUsd,
    summary: `${protocolLabel} on ${chain} for ${asset} with ${hasInstantDeposit ? "instant deposit support" : "a simple vault flow"}.`,
    description: raw.description,
    tags,
    hasInstantDeposit,
    isStablecoinLike,
    isTransactional: raw.isTransactional ?? false,
    isRedeemable: raw.isRedeemable ?? false,
  };
}

export function parseVaultResponse(payload: EarnResponse): EarnVault[] {
  return (payload.data ?? []).map(normalizeVault);
}

export async function fetchEarnVaults(): Promise<EarnVault[]> {
  try {
    const response = await fetch(EARN_ENDPOINT, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Earn API failed with status ${response.status}`);
    }

    const payload = (await response.json()) as EarnResponse;
    const normalized = parseVaultResponse(payload);

    if (normalized.length === 0) {
      return FALLBACK_VAULTS;
    }

    return normalized;
  } catch {
    return FALLBACK_VAULTS;
  }
}

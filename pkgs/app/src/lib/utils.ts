import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 8): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

/**
 * Safely extracts a total bigint balance from primitive values, Maps,
 * `{ balance, cap }` objects, or null-prototype token dictionaries.
 */
export function extractRawBalance(raw: unknown): bigint {
  if (raw === null || raw === undefined) return 0n;
  if (typeof raw === "bigint") return raw;
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? BigInt(Math.trunc(raw)) : 0n;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return 0n;
    try {
      return BigInt(trimmed);
    } catch {
      const num = Number(trimmed);
      return Number.isFinite(num) ? BigInt(Math.trunc(num)) : 0n;
    }
  }

  if (raw instanceof Map) {
    let total = 0n;
    for (const val of raw.values()) {
      total += extractRawBalance(val);
    }
    return total;
  }

  if (Array.isArray(raw)) {
    return raw.reduce<bigint>((acc, item) => acc + extractRawBalance(item), 0n);
  }

  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;

    // Handle `{ balance, cap }` returned by getDustBalance()
    if ("balance" in obj && obj.balance !== undefined) {
      return extractRawBalance(obj.balance);
    }
    if ("available" in obj && obj.available !== undefined) {
      return extractRawBalance(obj.available);
    }
    if ("balances" in obj && obj.balances !== undefined) {
      return extractRawBalance(obj.balances);
    }

    // Handle Record<TokenType, bigint> returned by getShieldedBalances / getUnshieldedBalances
    let total = 0n;
    for (const key of Object.keys(obj)) {
      if (key === "cap" || key === "maxCap") continue;
      total += extractRawBalance(obj[key]);
    }
    return total;
  }

  return 0n;
}

export function formatBalance(raw: unknown, decimals = 6): string {
  const amount = extractRawBalance(raw);
  const divisor = 10n ** BigInt(decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;

  if (fraction === 0n) {
    return whole.toLocaleString("en-US");
  }

  const fractionStr = fraction
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "")
    .slice(0, 4);

  return `${whole.toLocaleString("en-US")}.${fractionStr}`;
}
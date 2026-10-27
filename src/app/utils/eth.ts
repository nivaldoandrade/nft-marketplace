const DECIMALS = 18;
const WEI_PER_ETH = 10n ** BigInt(DECIMALS);
const ETH_PATTERN = /^\d+(\.\d+)?$/;

export function isEthValue(value: string): boolean {
  return ETH_PATTERN.test(value);
}

export function toWei(value: string): bigint {
  if (!isEthValue(value)) {
    throw new Error(`Invalid ETH value: ${value}`);
  }

  const [integer, fraction = ''] = value.split('.');
  const paddedFraction = fraction.slice(0, DECIMALS).padEnd(DECIMALS, '0');

  return BigInt(integer) * WEI_PER_ETH + BigInt(paddedFraction);
}

export function compareEth(a: string, b: string): number {
  const diff = toWei(a) - toWei(b);

  return diff === 0n ? 0 : diff > 0n ? 1 : -1;
}

export function formatEth(value: string, minDecimals = 2): string {
  const [integer, fraction = ''] = value.split('.');

  return `${integer}.${fraction.padEnd(minDecimals, '0')}`;
}

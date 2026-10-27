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

export function fromWei(wei: bigint): string {
  const integer = wei / WEI_PER_ETH;
  const fraction = (wei % WEI_PER_ETH).toString().padStart(DECIMALS, '0').replace(/0+$/, '');

  return fraction ? `${integer}.${fraction}` : integer.toString();
}

export function addEth(...values: string[]): string {
  return fromWei(values.reduce((total, value) => total + toWei(value), 0n));
}

export function subtractEth(value: string, subtrahend: string): string {
  const result = toWei(value) - toWei(subtrahend);

  return fromWei(result > 0n ? result : 0n);
}

export function multiplyEth(value: string, quantity: number): string {
  return fromWei(toWei(value) * BigInt(quantity));
}

export function percentOfEth(value: string, percent: number): string {
  return fromWei((toWei(value) * BigInt(Math.round(percent * 100))) / 10_000n);
}

export function compareEth(a: string, b: string): number {
  const diff = toWei(a) - toWei(b);

  return diff === 0n ? 0 : diff > 0n ? 1 : -1;
}

export function formatEth(value: string, minDecimals = 2): string {
  const [integer, fraction = ''] = value.split('.');

  return `${integer}.${fraction.padEnd(minDecimals, '0')}`;
}

import { formatEth } from '@/app/utils/eth';

export function formatPrice(value: string) {
  return `${formatEth(value)} ETH`;
}

export function formatPriceRange(min: number, max: number) {
  const format = (value: number) =>
    value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return `${format(min)} - ${format(max)} ETH`;
}

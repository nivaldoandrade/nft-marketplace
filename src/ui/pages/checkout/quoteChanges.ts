import type { Quote } from '@/app/types/Quote';
import { compareEth } from '@/app/utils/eth';
import { formatPrice } from '@/ui/utils/formatPrice';

// what changed between the values the collector saw and the ones about to be charged
export function describeQuoteChanges(previous: Quote, current: Quote) {
  const changes: string[] = [];

  current.items.forEach((item) => {
    const before = previous.items.find(({ itemId }) => itemId === item.itemId);

    if (item.available === 0) {
      changes.push(`${item.name} esgotou.`);
    } else if (item.available < item.quantity) {
      changes.push(`Restam apenas ${item.available} unidade(s) de ${item.name}.`);
    }

    if (before && compareEth(before.unitPrice, item.unitPrice) !== 0) {
      changes.push(
        `O preço de ${item.name} mudou de ${formatPrice(before.unitPrice)} para ${formatPrice(item.unitPrice)}.`,
      );
    }
  });

  previous.items.forEach((item) => {
    if (!current.items.some(({ itemId }) => itemId === item.itemId)) {
      changes.push(`${item.name} saiu do carrinho.`);
    }
  });

  if (previous.coupon?.code !== current.coupon?.code) {
    changes.push(
      current.coupon
        ? `Cupom ${current.coupon.code} aplicado.`
        : `O cupom ${previous.coupon?.code} não é mais válido.`,
    );
  }

  // without purchasable items the fee and total drop to zero, which is not a change worth listing
  const hasPurchasableItems = current.items.some((item) => item.available > 0);

  if (
    hasPurchasableItems &&
    previous.network === current.network &&
    compareEth(previous.networkFee, current.networkFee)
  ) {
    changes.push(`A taxa de rede mudou para ${formatPrice(current.networkFee)}.`);
  }

  if (hasPurchasableItems && changes.length && compareEth(previous.total, current.total) !== 0) {
    changes.push(`Novo total: ${formatPrice(current.total)}.`);
  }

  return changes;
}

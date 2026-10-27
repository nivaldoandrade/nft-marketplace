import { Link } from '@tanstack/react-router';

import type { CartItem } from '@/app/types/Cart';
import type { QuoteIssue } from '@/app/types/Quote';
import { QuantityStepper } from '@/ui/components/QuantityStepper';
import { getItemIssueMessage } from '@/ui/pages/cart/components/itemIssueMessage';
import { getItemMaxQuantity } from '@/ui/pages/cart/useCartPage';
import { formatPrice } from '@/ui/utils/formatPrice';
import { editionLabels } from '@/ui/utils/labels';

type CartItemCardProps = {
  item: CartItem;
  issue: QuoteIssue | undefined;
  onChangeQuantity: (item: CartItem, quantity: number) => void;
  onRemove: (item: CartItem) => void;
};

export function CartItemCard({ item, issue, onChangeQuantity, onRemove }: CartItemCardProps) {
  const issueMessage = getItemIssueMessage(issue);

  return (
    <li className="flex flex-col gap-1">
      <div className="relative flex h-[100px] gap-[9px] rounded-[14px] bg-card shadow-[0_6px_20px_rgba(10,6,4,0.45)]">
        <img
          src={item.image}
          alt=""
          width={100}
          height={100}
          className="h-[100px] w-20 shrink-0 rounded-[14px] object-cover min-[360px]:w-[100px]"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-between pt-[13px] pr-4 pb-[15px]">
          <div className="flex flex-col gap-1.5">
            <Link
              to="/nft/$nftId"
              params={{ nftId: item.nftId }}
              className="truncate text-[15px] leading-4 font-bold"
            >
              {item.name}
            </Link>
            <span className="truncate text-sm leading-4 text-muted-foreground">
              Edição: {editionLabels[item.editionType]}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-lg leading-4 font-bold whitespace-nowrap text-accent">
              {formatPrice(item.lineTotal)}
            </span>
            <QuantityStepper
              size="outline"
              label={`Quantidade de ${item.name}`}
              quantity={item.quantity}
              maxQuantity={getItemMaxQuantity(item)}
              onIncrease={() => onChangeQuantity(item, item.quantity + 1)}
              onDecrease={() => onChangeQuantity(item, item.quantity - 1)}
              onRemove={() => onRemove(item)}
              removeLabel={`Remover ${item.name} do carrinho`}
              className="-my-1 shrink-0 min-[400px]:absolute min-[400px]:top-[38px] min-[400px]:right-4 min-[400px]:my-0"
            />
          </div>
        </div>
      </div>
      {issueMessage && <p className="px-1 text-[13px] leading-4 text-coral">{issueMessage}</p>}
    </li>
  );
}

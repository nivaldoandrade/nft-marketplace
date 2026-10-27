import { Link } from '@tanstack/react-router';

import type { CartItem } from '@/app/types/Cart';
import type { QuoteIssue } from '@/app/types/Quote';
import { TrashIcon } from '@/ui/components/Icons';
import { QuantityStepper } from '@/ui/components/QuantityStepper';
import { getItemIssueMessage } from '@/ui/pages/cart/components/itemIssueMessage';
import { getItemMaxQuantity } from '@/ui/pages/cart/useCartPage';
import { formatPrice } from '@/ui/utils/formatPrice';
import { editionLabels } from '@/ui/utils/labels';

type CartTableProps = {
  items: CartItem[];
  itemIssues: Map<string, QuoteIssue>;
  onChangeQuantity: (item: CartItem, quantity: number) => void;
  onRemove: (item: CartItem) => void;
};

const rowClassName = 'col-span-full grid grid-cols-subgrid items-center';

export function CartTable({ items, itemIssues, onChangeQuantity, onRemove }: CartTableProps) {
  return (
    <div
      role="table"
      aria-label="Itens do carrinho"
      className="hidden grid-cols-[minmax(0,250px)_minmax(75px,max-content)_minmax(77px,max-content)_minmax(87px,max-content)_48px] justify-between gap-x-4 gap-y-3 md:grid"
    >
      <div
        role="row"
        className={`${rowClassName} border-b border-primary/30 pb-[11px] text-base leading-4 font-bold`}
      >
        <span role="columnheader">NFTs</span>
        <span role="columnheader">Preço</span>
        <span role="columnheader">Quantidade</span>
        <span role="columnheader">Total</span>
        <span role="columnheader" className="sr-only">
          Remover
        </span>
      </div>

      <div role="rowgroup" className="col-span-full grid grid-cols-subgrid gap-y-3">
        {items.map((item) => {
          const issueMessage = getItemIssueMessage(itemIssues.get(item.id));

          return (
            <div key={item.id} className="col-span-full grid grid-cols-subgrid gap-y-1">
              <div role="row" className={`${rowClassName} h-[70px] bg-card`}>
                <div role="cell" className="flex min-w-0 items-center gap-4">
                  <img
                    src={item.image}
                    alt=""
                    width={70}
                    height={70}
                    className="size-[70px] shrink-0 rounded-md object-cover"
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <Link
                      to="/nft/$nftId"
                      params={{ nftId: item.nftId }}
                      className="mb-0.5 truncate text-base leading-4 font-bold hover:text-accent"
                    >
                      {item.name}
                    </Link>
                    <span className="truncate text-sm leading-4 text-subtle">
                      ID do token: {item.tokenId}
                    </span>
                    <span className="truncate text-sm leading-4 text-subtle">
                      Edição: {editionLabels[item.editionType]}
                    </span>
                  </div>
                </div>
                <span role="cell" className="text-base leading-4 font-bold text-muted-foreground">
                  {formatPrice(item.unitPrice)}
                </span>
                <div role="cell">
                  <QuantityStepper
                    size="sm"
                    valueClassName="min-w-[2ch]"
                    label={`Quantidade de ${item.name}`}
                    quantity={item.quantity}
                    maxQuantity={getItemMaxQuantity(item)}
                    onIncrease={() => onChangeQuantity(item, item.quantity + 1)}
                    onDecrease={() => onChangeQuantity(item, item.quantity - 1)}
                  />
                </div>
                <span role="cell" className="text-base leading-4 font-bold text-accent">
                  {formatPrice(item.lineTotal)}
                </span>
                <div role="cell">
                  <button
                    type="button"
                    onClick={() => onRemove(item)}
                    aria-label={`Remover ${item.name} do carrinho`}
                    className="flex size-6 items-center justify-center text-subtle transition-colors hover:text-coral"
                  >
                    <TrashIcon className="size-6" />
                  </button>
                </div>
              </div>
              {issueMessage && (
                <p className="col-span-full text-[13px] leading-4 text-coral">{issueMessage}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import type { QuoteItem } from '@/app/types/Quote';
import { formatPrice } from '@/ui/utils/formatPrice';

type OrderItemsProps = {
  items: QuoteItem[];
};

export function OrderItems({ items }: OrderItemsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between border-b border-primary/30 pb-[11px] text-base leading-4">
        <span className="font-bold">NFTs</span>
        <span className="font-medium">Subtotal</span>
      </div>
      <ul aria-label="NFTs do pedido" className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.itemId} className="flex h-[70px] items-center gap-2 bg-card pr-4 pl-1">
            <img
              src={item.image}
              alt=""
              width={70}
              height={70}
              className="size-[66px] shrink-0 rounded-lg object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate text-base leading-4 font-bold">{item.name}</span>
              <span className="truncate text-sm leading-4 text-subtle">
                ID do token: {item.tokenId}
              </span>
            </div>
            <span className="shrink-0 text-sm leading-4 text-muted-foreground">
              <span className="sr-only">Quantidade: </span>(x {item.quantity})
            </span>
            <span className="w-[98px] shrink-0 text-right text-lg leading-4 font-bold whitespace-nowrap text-accent">
              {formatPrice(item.lineTotal)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

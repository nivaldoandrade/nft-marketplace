import { getRouteApi } from '@tanstack/react-router';

import { useOrder } from '@/app/hooks/queries/orders/useOrder';
import { toast } from '@/app/libs/toast';
import type { Network } from '@/app/types/Nft';
import { useValueChange } from '@/ui/hooks/useValueChange';

const route = getRouteApi('/pedidos/$orderId');

export const explorerNames: Record<Network, string> = {
  ethereum: 'Etherscan',
  polygon: 'Polygonscan',
  solana: 'Solscan',
};

export function useOrderConfirmation() {
  const { orderId } = route.useParams();
  const { order, isPending, isError, isNotFound, refetch } = useOrder(orderId);

  useValueChange(order?.status, (previous, current) => {
    if (previous === 'pending' && current === 'confirmed') {
      toast.success('Pagamento confirmado.');
    }

    if (previous === 'pending' && current === 'declined') {
      toast.error('Pagamento recusado. Seus itens continuam no carrinho.');
    }
  });

  function handleOpenExplorer() {
    if (order) {
      toast.info(
        `Transação simulada: ela não existe no ${explorerNames[order.network]}. Em produção, este botão abriria o comprovante na rede.`,
      );
    }
  }

  return { order, isPending, isError, isNotFound, refetch, handleOpenExplorer };
}

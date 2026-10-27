import { useState } from 'react';

import { useGetNftById } from '@/app/hooks/queries/nfts/useGetNftById';
import type { EditionType, NftEdition } from '@/app/types/Nft';
import { useFavoriteAction } from '@/ui/hooks/useFavoriteAction';

export const DETAILS_TAB = 'details';
export const REVIEWS_TAB = 'reviews';

export function useNftDetails(nftId: string) {
  const { nft, isPending, isError, isNotFound, refetch } = useGetNftById(nftId);
  const { isFavorite, handleToggleFavorite } = useFavoriteAction(nft);

  const [selectedType, setSelectedType] = useState<EditionType | null>(null);
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(DETAILS_TAB);

  const editions = nft?.editions ?? [];
  const selectedEdition =
    editions.find((edition) => edition.type === selectedType && edition.available > 0) ??
    editions.find((edition) => edition.available > 0);

  const maxQuantity = selectedEdition
    ? Math.min(selectedEdition.available, selectedEdition.maxPerOrder)
    : 0;
  const quantity = Math.min(Math.max(requestedQuantity, 1), Math.max(maxQuantity, 1));
  const isSoldOut = !selectedEdition;

  const quantityLimitMessage = getQuantityLimitMessage(quantity, maxQuantity, selectedEdition);

  function handleSelectEdition(type: EditionType) {
    setSelectedType(type);
  }

  function handleIncrease() {
    setRequestedQuantity(Math.min(quantity + 1, maxQuantity));
  }

  function handleDecrease() {
    setRequestedQuantity(Math.max(quantity - 1, 1));
  }

  function handleShowReviews() {
    setActiveTab(REVIEWS_TAB);
    document.getElementById('nft-tabs')?.scrollIntoView({ block: 'start' });
  }

  return {
    nft,
    isPending,
    isError,
    isNotFound,
    refetch,
    editions,
    selectedEdition,
    quantity,
    maxQuantity,
    isSoldOut,
    quantityLimitMessage,
    activeTab,
    setActiveTab,
    handleSelectEdition,
    handleIncrease,
    handleDecrease,
    handleShowReviews,
    isFavorite,
    handleToggleFavorite,
  };
}

function getQuantityLimitMessage(
  quantity: number,
  maxQuantity: number,
  edition: NftEdition | undefined,
) {
  if (!edition || quantity < maxQuantity) {
    return null;
  }

  if (edition.available < edition.maxPerOrder) {
    return edition.available === 1
      ? 'Apenas 1 unidade disponível nesta edição.'
      : `Apenas ${edition.available} unidades disponíveis nesta edição.`;
  }

  return `Limite de ${edition.maxPerOrder} unidades por pedido.`;
}

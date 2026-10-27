import { getRouteApi, Link } from '@tanstack/react-router';

import { Container } from '@/ui/components/Container';
import { MobileBuyBar } from '@/ui/pages/nftDetails/components/MobileBuyBar';
import { NftDetailsFeedback } from '@/ui/pages/nftDetails/components/NftDetailsFeedback';
import { NftDetailsSkeleton } from '@/ui/pages/nftDetails/components/NftDetailsSkeleton';
import { NftGallery } from '@/ui/pages/nftDetails/components/NftGallery';
import { NftInfo } from '@/ui/pages/nftDetails/components/NftInfo';
import { NftTabs } from '@/ui/pages/nftDetails/components/NftTabs';
import { PurchaseActions } from '@/ui/pages/nftDetails/components/PurchaseActions';
import { RelatedNfts } from '@/ui/pages/nftDetails/components/RelatedNfts';
import { useNftDetails } from '@/ui/pages/nftDetails/useNftDetails';
import { CATALOG_SECTION_ID } from '@/ui/utils/sections';

const route = getRouteApi('/nft/$nftId');

export function NftDetails() {
  const { nftId } = route.useParams();

  return <NftDetailsContent key={nftId} nftId={nftId} />;
}

function NftDetailsContent({ nftId }: { nftId: string }) {
  const {
    nft,
    isPending,
    isError,
    isNotFound,
    refetch,
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
  } = useNftDetails(nftId);

  return (
    <Container className="md:pt-8">
      <nav aria-label="Trilha de navegação" className="hidden md:block">
        <ol className="flex gap-1.5 text-[15px] leading-4 font-bold">
          <li>
            <Link to="/" className="hover:text-accent">
              Início
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/" hash={CATALOG_SECTION_ID} className="hover:text-accent">
              Mercado
            </Link>
          </li>
        </ol>
      </nav>

      {isNotFound ? (
        <NftDetailsFeedback variant="not-found" />
      ) : isError ? (
        <NftDetailsFeedback variant="error" onRetry={() => refetch()} />
      ) : isPending || !nft ? (
        <div className="md:mt-3">
          <NftDetailsSkeleton />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:mt-3 md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-[minmax(0,573fr)_minmax(0,595fr)]">
            <NftGallery name={nft.name} collectionName={nft.collection.name} images={nft.gallery} />
            <NftInfo
              nft={nft}
              selectedEdition={selectedEdition?.type}
              onSelectEdition={handleSelectEdition}
              onShowReviews={handleShowReviews}
            >
              <PurchaseActions
                quantity={quantity}
                maxQuantity={maxQuantity}
                isSoldOut={isSoldOut}
                quantityLimitMessage={quantityLimitMessage}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
              />
            </NftInfo>
          </div>

          <div className="mt-10 flex flex-col gap-16 md:mt-24 md:gap-24">
            <NftTabs nft={nft} activeTab={activeTab} onTabChange={setActiveTab} />
            <RelatedNfts nftId={nft.id} />
          </div>

          <MobileBuyBar
            price={nft.price}
            quantity={quantity}
            maxQuantity={maxQuantity}
            isSoldOut={isSoldOut}
            quantityLimitMessage={quantityLimitMessage}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
          />
        </>
      )}
    </Container>
  );
}

import type { Nft } from '@/app/types/Nft';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/components/ui/tabs';
import { ReviewsList } from '@/ui/pages/nftDetails/components/ReviewsList';
import { DETAILS_TAB, REVIEWS_TAB } from '@/ui/pages/nftDetails/useNftDetails';
import { networkLabels } from '@/ui/utils/labels';

type NftTabsProps = {
  nft: Nft;
  activeTab: string;
  onTabChange: (tab: string) => void;
};

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function NftTabs({ nft, activeTab, onTabChange }: NftTabsProps) {
  const details = [
    {
      term: 'Rede:',
      description: `Cunhado na ${networkLabels[nft.network]} com procedência imutável e metadados armazenados no IPFS.`,
    },
    {
      term: 'Contrato:',
      description: `${shortenAddress(nft.contractAddress)} • Contrato inteligente ERC-721 verificado.`,
    },
    {
      term: 'Direitos autorais:',
      description: `Direitos autorais do criador: ${nft.royaltyPercent}% nas vendas secundárias, pagos automaticamente pelos mercados compatíveis.`,
    },
  ];

  return (
    <Tabs
      id="nft-tabs"
      value={activeTab}
      onValueChange={onTabChange}
      className="scroll-mt-6 md:scroll-mt-24"
    >
      <TabsList aria-label="Informações do NFT">
        <TabsTrigger value={DETAILS_TAB}>Detalhes do NFT</TabsTrigger>
        <TabsTrigger value={REVIEWS_TAB}>
          Avaliações de colecionadores ({nft.reviewsCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value={DETAILS_TAB} className="pt-3">
        <div className="flex flex-col gap-6 text-sm leading-6 text-muted-foreground">
          {nft.details.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <dl className="mt-3 flex flex-col gap-3 text-sm leading-6">
          {details.map((item) => (
            <div key={item.term}>
              <dt className="font-bold">{item.term}</dt>
              <dd className="text-muted-foreground">{item.description}</dd>
            </div>
          ))}
        </dl>
      </TabsContent>

      <TabsContent value={REVIEWS_TAB} className="pt-4">
        <ReviewsList nftId={nft.id} enabled={activeTab === REVIEWS_TAB} />
      </TabsContent>
    </Tabs>
  );
}

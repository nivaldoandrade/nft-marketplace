import type { NftEdition } from '@/app/types/Nft';
import type { ValueOf } from '@/app/utils/ValueOf';

export const RealtimeEventType = {
  NFT_UPDATED: 'nft.updated',
} as const;

export type RealtimeEventType = ValueOf<typeof RealtimeEventType>;

export type RealtimeEvent<TType extends RealtimeEventType, TResource extends string, TData> = {
  eventId: string;
  type: TType;
  resource: { type: TResource; id: string };
  version: number;
  occurredAt: string;
  data: TData;
};

export type NftUpdatedData = {
  price: string;
  compareAtPrice: string | null;
  editions: NftEdition[];
};

export type NftUpdatedEvent = RealtimeEvent<'nft.updated', 'nft', NftUpdatedData>;

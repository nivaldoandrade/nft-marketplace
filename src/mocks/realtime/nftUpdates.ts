import { EditionType } from '@/app/types/Nft';
import { type NftUpdatedEvent, RealtimeEventType } from '@/app/types/Realtime';
import { compareEth } from '@/app/utils/eth';
import { db, nextId, persist } from '@/mocks/db';
import type { NftRecord } from '@/mocks/db/types';
import { broadcast, onConnectionCountChange } from '@/mocks/realtime/server';
import { getScenarioConfig } from '@/mocks/scenarios';

export type NftChanges = {
  price?: string;
  editions?: Partial<Record<EditionType, number>>;
};

const AUTO_UPDATE_MS = 30_000;
const DUPLICATE_DELAY_MS = 400;
const STALE_DELAY_MS = 800;

const lastEvents = new Map<string, NftUpdatedEvent>();

function toEvent(nft: NftRecord): NftUpdatedEvent {
  return {
    eventId: nextId('evt'),
    type: RealtimeEventType.NFT_UPDATED,
    resource: { type: 'nft', id: nft.id },
    version: nft.version,
    occurredAt: new Date().toISOString(),
    data: {
      price: nft.price,
      compareAtPrice: nft.compareAtPrice,
      editions: nft.editions.map((edition) => ({ ...edition })),
    },
  };
}

function publish(event: NftUpdatedEvent) {
  const previous = lastEvents.get(event.resource.id);
  lastEvents.set(event.resource.id, event);

  broadcast(event.type, event);

  if (getScenarioConfig().realtimeDuplicates) {
    setTimeout(() => broadcast(event.type, event), DUPLICATE_DELAY_MS);

    if (previous) {
      setTimeout(() => broadcast(previous.type, previous), STALE_DELAY_MS);
    }
  }
}

export function updateNft(nftId: string, changes: NftChanges) {
  const nft = db.nfts[nftId];

  if (!nft) {
    return null;
  }

  if (changes.price) {
    nft.price = changes.price;

    if (nft.compareAtPrice && compareEth(nft.price, nft.compareAtPrice) >= 0) {
      nft.compareAtPrice = null;
    }
  }

  Object.entries(changes.editions ?? {}).forEach(([type, available]) => {
    const edition = nft.editions.find((item) => item.type === type);

    if (edition && available !== undefined) {
      edition.available = Math.max(0, available);
    }
  });

  nft.version += 1;
  persist();

  const event = toEvent(nft);
  publish(event);

  return event;
}

function pickNft() {
  const inCarts = Object.values(db.carts).flatMap((cart) => cart.items.map((item) => item.nftId));
  const ids = inCarts.length > 0 && Math.random() < 0.7 ? inCarts : Object.keys(db.nfts);

  return db.nfts[ids[Math.floor(Math.random() * ids.length)]];
}

function randomChanges(nft: NftRecord): NftChanges {
  const limited = nft.editions.filter((edition) => edition.type !== EditionType.OPEN);

  if (Math.random() < 0.7 || limited.length === 0) {
    const percent = (3 + Math.random() * 9) * (Math.random() < 0.5 ? -1 : 1);
    const price = Math.max(0.05, Number(nft.price) * (1 + percent / 100));

    return { price: price.toFixed(2) };
  }

  const edition = limited[Math.floor(Math.random() * limited.length)];
  const available =
    edition.available > 0
      ? edition.available - Math.ceil(Math.random() * 2)
      : edition.available + 3;

  return { editions: { [edition.type]: available } };
}

let timer: ReturnType<typeof setInterval> | null = null;

// random updates only run while a client is connected, so idle tabs do not change the catalog
onConnectionCountChange((count) => {
  if (count > 0 && !timer && getScenarioConfig().realtimeAuto) {
    timer = setInterval(() => {
      const nft = pickNft();

      if (nft) {
        updateNft(nft.id, randomChanges(nft));
      }
    }, AUTO_UPDATE_MS);
  }

  if (count === 0 && timer) {
    clearInterval(timer);
    timer = null;
  }
});

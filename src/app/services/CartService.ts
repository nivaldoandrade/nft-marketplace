import { Service } from '@/app/services/Service';
import type { Cart } from '@/app/types/Cart';
import type { EditionType, Network } from '@/app/types/Nft';
import type { Quote } from '@/app/types/Quote';

export class CartService extends Service {
  static async get(signal?: AbortSignal): Promise<Cart> {
    const { data } = await this.client.get<Cart>('cart', { signal });

    return data;
  }

  static async addItem(params: CartService.AddItemParams): Promise<Cart> {
    const { data } = await this.client.post<Cart>('cart/items', params);

    return data;
  }

  static async updateItem({ itemId, quantity }: CartService.UpdateItemParams): Promise<Cart> {
    const { data } = await this.client.patch<Cart>(`cart/items/${encodeURIComponent(itemId)}`, {
      quantity,
    });

    return data;
  }

  static async removeItem(itemId: string): Promise<Cart> {
    const { data } = await this.client.delete<Cart>(`cart/items/${encodeURIComponent(itemId)}`);

    return data;
  }

  static async applyCoupon(code: string): Promise<Cart> {
    const { data } = await this.client.put<Cart>('cart/coupon', { code });

    return data;
  }

  static async removeCoupon(): Promise<Cart> {
    const { data } = await this.client.delete<Cart>('cart/coupon');

    return data;
  }

  static async merge(guestCartId: string): Promise<Cart> {
    const { data } = await this.client.post<Cart>('cart/merge', { guestCartId });

    return data;
  }

  static async getQuote(network: Network, signal?: AbortSignal): Promise<Quote> {
    const { data } = await this.client.get<Quote>('cart/quote', { params: { network }, signal });

    return data;
  }
}

export namespace CartService {
  export type AddItemParams = {
    nftId: string;
    editionType: EditionType;
    quantity: number;
  };

  export type UpdateItemParams = {
    itemId: string;
    quantity: number;
  };
}

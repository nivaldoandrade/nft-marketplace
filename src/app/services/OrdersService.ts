import { Service } from '@/app/services/Service';
import type { Network } from '@/app/types/Nft';
import type { Order, OrderCollector, OrderStatus } from '@/app/types/Order';

export class OrdersService extends Service {
  static async create({ idempotencyKey, ...body }: OrdersService.CreateParams): Promise<Order> {
    const { data } = await this.client.post<Order>('orders', body, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });

    return data;
  }

  static async get(orderId: string, signal?: AbortSignal): Promise<Order> {
    const { data } = await this.client.get<Order>(`orders/${encodeURIComponent(orderId)}`, {
      signal,
    });

    return data;
  }

  static async list(
    params: OrdersService.ListParams,
    signal?: AbortSignal,
  ): Promise<OrdersService.ListResponse> {
    const { data } = await this.client.get<OrdersService.ListResponse>('orders', {
      params,
      signal,
    });

    return data;
  }
}

export namespace OrdersService {
  export type CreateParams = {
    idempotencyKey: string;
    quoteId: string;
    walletId: string;
    network: Network;
    collector: OrderCollector;
  };

  export type ListParams = {
    status?: OrderStatus;
  };

  export type ListResponse = {
    items: Order[];
  };
}

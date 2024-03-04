import { OrderSide, OrderStatus_LT } from 'binance-api-node';

import { AutoMap } from '@automapper/classes';
import { CLIENT_ORDER_TYPE } from '../entities/enum-type';

export class OrderBaseDTO {
  @AutoMap()
  id: string;

  @AutoMap()
  pair: string;

  @AutoMap()
  userId: number;

  @AutoMap()
  botId: number;

  @AutoMap()
  exchangeId: number;

  @AutoMap()
  clientOrderType: CLIENT_ORDER_TYPE;
  // for buy order: 0 to max_no_of_safety_order
  // for sell order: 1000 + the correspondent buy order
  @AutoMap()
  sequence: number;

  @AutoMap()
  deviation: number;

  // BUY or SELL
  @AutoMap()
  side: OrderSide;

  @AutoMap()
  price: number;

  @AutoMap()
  filledPrice: number;

  @AutoMap()
  averagePrice: number;

  @AutoMap()
  exitPrice: number;

  @AutoMap()
  binanceOrderId: string;

  @AutoMap()
  quantity: number;

  @AutoMap()
  filledQuantity: number;

  @AutoMap()
  volume: number;

  @AutoMap()
  totalQuantity: number;

  @AutoMap()
  status: 'CREATED' | 'PLACING' | OrderStatus_LT;

  @AutoMap()
  retryCount: number;

  @AutoMap()
  placedCount: number;
}

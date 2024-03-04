import { Column, Entity, PrimaryColumn } from 'typeorm';
import {
  FuturesOrderType_LT,
  OrderSide_LT,
  OrderStatus_LT,
  PositionSide_LT,
  TimeInForce,
  TimeInForce_LT,
} from 'binance-api-node';

import { AutoMap } from '@automapper/classes';
import { ORDER_SOURCE_TYPE } from './enum-type';

@Entity({ name: 'order_watcher' })
export class OrderWatcherEntity {
  @AutoMap()
  @PrimaryColumn()
  orderId: string;

  @AutoMap()
  @Column({ name: 'start_order_type', length: 64, default: 'MARKET' })
  symbol: string;

  @AutoMap()
  @Column({ length: 64 })
  status: OrderStatus_LT;

  @AutoMap()
  @Column({ length: 255 })
  clientOrderId: string;

  @AutoMap()
  @Column({ length: 255 })
  price: string;

  @AutoMap()
  @Column({ length: 255 })
  avgPrice: string;

  @AutoMap()
  @Column({ length: 255 })
  origQty: string;

  @AutoMap()
  @Column({ length: 255 })
  executedQty: string;

  @AutoMap()
  @Column({ length: 255 })
  cumQuote: string;

  @AutoMap()
  @Column({
    length: 64,
    default: TimeInForce.GTC,
  })
  timeInForce: TimeInForce_LT;

  @AutoMap()
  @Column({
    length: 64,
  })
  type: FuturesOrderType_LT;

  @AutoMap()
  @Column()
  reduceOnly: boolean;

  @AutoMap()
  @Column()
  closePosition: boolean;

  @AutoMap()
  @Column()
  side: OrderSide_LT;

  @AutoMap()
  @Column()
  positionSide: PositionSide_LT;

  @AutoMap()
  @Column()
  stopPrice: string;

  @AutoMap()
  @Column()
  workingType: string;

  @AutoMap()
  @Column()
  priceProtect: boolean;

  @AutoMap()
  @Column()
  origType: FuturesOrderType_LT;

  @AutoMap()
  @Column()
  priceMatch: string;

  @AutoMap()
  @Column()
  selfTradePreventionMode: string;

  @AutoMap()
  @Column()
  goodTillDate: string;

  @AutoMap()
  @Column()
  time: Date;

  @AutoMap()
  @Column()
  updateTime: Date;

  @AutoMap()
  @Column({
    name: 'internal_order_source_type',
    type: 'enum',
    enum: ORDER_SOURCE_TYPE,
    default: ORDER_SOURCE_TYPE.THREE_COMMAS,
  })
  internalOrderSourceType: ORDER_SOURCE_TYPE;

  @AutoMap()
  @Column({ name: 'internal_user_id', type: 'int', nullable: false })
  internalUserId: number;

  @AutoMap()
  @Column({
    name: 'internal_exchange_watcher_id',
    type: 'int',
    nullable: false,
  })
  internalExchangeWatcherId: number;

  @AutoMap()
  @Column({ name: 'internal_ref_bot_id', type: 'int', nullable: false })
  internalRefBotId: number;

  //   @AutoMap()
  //   @Column({
  //     name: 'internal_min_order_size',
  //     type: 'decimal',
  //     precision: 20,
  //     scale: 10,
  //     nullable: true,
  //   })
  //   internalMinOrderSize: number;

  //   @AutoMap()
  //   @Column({
  //     name: 'internal_max_order_size',
  //     type: 'decimal',
  //     precision: 20,
  //     scale: 10,
  //     nullable: true,
  //   })
  //   internalMaxOrderSize: number;

  @AutoMap()
  @Column({
    name: 'internal_deal_profit_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  internalDealProfitPercentage: number;

  @AutoMap()
  @Column({
    name: 'internal_deal_average_deviation',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  internalDealAverageDeviation: number;

  @AutoMap()
  @Column({
    name: 'internal_deal_total_volume',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  internalDealTotalVolume: number;

  @AutoMap()
  @Column({
    name: 'calc_deal_average_price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  calcDealAveragePrice: number;

  @AutoMap()
  @Column({
    name: 'calc_deal_take_profit_price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  calcDealProfitPrice: number;

  @AutoMap()
  @Column({
    name: 'calc_deal_total_qty',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  calcDealTotalQty: number;
}

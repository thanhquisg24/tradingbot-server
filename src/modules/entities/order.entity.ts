import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderSide, OrderStatus_LT } from 'binance-api-node';

import { AutoMap } from '@automapper/classes';
import { DealEntity } from './deal.entity';

export interface BuyOrder {
  side: OrderSide;
  pair: string;
  sequence: number;
  deviation: number;
  volume: number;
  price: number;
  averagePrice: number;
  quantity: number;
  totalQuantity: number;
  totalVolume: number;
  exitPrice: number;
}
export function createOrderEntity(buyOrder: BuyOrder, deal: DealEntity) {
  const order = new OrderEntity();
  order.pair = buyOrder.pair;
  order.clientOrderType =
    buyOrder.sequence > 0 ? CLIENT_ORDER_TYPE.SAFETY : CLIENT_ORDER_TYPE.BASE;
  order.sequence = buyOrder.sequence;
  order.volume = buyOrder.volume;
  order.deviation = buyOrder.deviation;
  order.side = buyOrder.side;
  order.price = buyOrder.price;
  order.quantity = buyOrder.quantity;
  order.totalQuantity = buyOrder.totalQuantity;
  order.averagePrice = buyOrder.averagePrice;
  order.exitPrice = buyOrder.exitPrice;
  order.status = 'CREATED';
  order.deal = deal;

  order.botId = deal.botId;
  order.exchangeId = deal.exchangeId;
  order.userId = deal.userId;
  order.placedCount = 0;
  return order;
}

export enum CLIENT_ORDER_TYPE {
  BASE = 'BASE',
  SAFETY = 'SAFETY',
  REDUCE_BEGIN = 'REDUCE_BIGIN',
  REDUCE_END = 'REDUCE_END',
  COVER_CUT_QTY = 'COVER_CUT_QTY',
  COVER_ADD_QTY = 'COVER_ADD_QTY',
  TAKE_PROFIT = 'TAKE_PROFIT',
  TRAILING_TP = 'TRAILING_TP',
  STOP_LOSS = 'STOP_LOSS',
  CLOSE_AT_MARKET = 'CLOSE_AT_MARKET',
}

@Entity()
export class OrderEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @AutoMap()
  @Column({ length: 16 })
  pair: string;

  @AutoMap()
  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number;

  @AutoMap()
  @Column({ name: 'bot_id', type: 'int', nullable: true })
  botId: number;

  @AutoMap()
  @Column({ name: 'exchange_id', type: 'int', nullable: true })
  exchangeId: number;

  @AutoMap()
  @Column({
    name: 'client_order_type',
    type: 'enum',
    enum: CLIENT_ORDER_TYPE,
    default: CLIENT_ORDER_TYPE.BASE,
  })
  clientOrderType: CLIENT_ORDER_TYPE;
  // for buy order: 0 to max_no_of_safety_order
  // for sell order: 1000 + the correspondent buy order
  @AutoMap()
  @Column({ type: 'int' })
  sequence: number;

  @AutoMap()
  @Column({
    name: 'deviation',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  deviation: number;

  // BUY or SELL
  @AutoMap()
  @Column({ length: 4 })
  side: OrderSide;

  @AutoMap()
  @Column({
    name: 'price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  price: number;

  @AutoMap()
  @Column({
    name: 'filled_price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  filledPrice: number;

  @AutoMap()
  @Column({
    name: 'average_price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  averagePrice: number;

  @AutoMap()
  @Column({
    name: 'exit_price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  exitPrice: number;

  @AutoMap()
  @Column({ name: 'binance_order_id', length: 255, nullable: true })
  binanceOrderId: string;

  @AutoMap()
  @Column({
    name: 'quantity',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  quantity: number;

  @AutoMap()
  @Column({
    name: 'filled_quantity',
    type: 'decimal',
    precision: 20,
    scale: 10,
    default: 0,
    nullable: true,
  })
  filledQuantity: number;

  @AutoMap()
  @Column({
    name: 'volume',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  volume: number;

  @AutoMap()
  @Column({
    name: 'total_quantity',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  totalQuantity: number;

  @AutoMap()
  @Column({ length: 64 })
  status: 'CREATED' | 'PLACING' | OrderStatus_LT;

  @AutoMap()
  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @AutoMap()
  @Column({ name: 'placed_count', type: 'int', default: 0 })
  placedCount: number;

  @ManyToOne(() => DealEntity)
  @JoinColumn({ name: 'deal_id', referencedColumnName: 'id' })
  deal: DealEntity;
}

import { OrderSide, OrderStatus_LT } from 'binance-api-node';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
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
  return order;
}

export enum CLIENT_ORDER_TYPE {
  BASE = 'BASE',
  SAFETY = 'SAFETY',
  REDUCE = 'REDUCE',
  TAKE_PROFIT = 'TAKE_PROFIT',
  STOP_LOSS = 'STOP_LOSS',
  CLOSE_AT_MARKET = 'CLOSE_AT_MARKET',
}

@Entity()
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 16 })
  pair: string;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number;

  @Column({ name: 'bot_id', type: 'int', nullable: true })
  botId: number;

  @Column({ name: 'exchange_id', type: 'int', nullable: true })
  exchangeId: number;

  @Column({
    name: 'client_order_type',
    type: 'enum',
    enum: CLIENT_ORDER_TYPE,
    default: CLIENT_ORDER_TYPE.BASE,
  })
  clientOrderType: CLIENT_ORDER_TYPE;
  // for buy order: 0 to max_no_of_safety_order
  // for sell order: 1000 + the correspondent buy order
  @Column({ type: 'int' })
  sequence: number;

  @Column({
    name: 'deviation',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  deviation: number;

  // BUY or SELL
  @Column({ length: 4 })
  side: OrderSide;

  @Column({
    name: 'price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  price: number;

  @Column({
    name: 'filled_price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  filledPrice: number;

  @Column({
    name: 'average_price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  averagePrice: number;

  @Column({
    name: 'exit_price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  exitPrice: number;

  @Column({ name: 'binance_order_id', length: 255, nullable: true })
  binanceOrderId: string;

  @Column({
    name: 'quantity',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  quantity: number;

  @Column({
    name: 'volume',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  volume: number;

  @Column({
    name: 'total_quantity',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  totalQuantity: number;

  @Column({ length: 64 })
  status: 'CREATED' | 'PLACING' | OrderStatus_LT;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @Column({ name: 'place_count', type: 'int', default: 0 })
  placeCount: number;

  @ManyToOne(() => DealEntity)
  @JoinColumn({ name: 'deal_id', referencedColumnName: 'id' })
  deal: DealEntity;
}

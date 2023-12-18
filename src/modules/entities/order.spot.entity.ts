import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AutoMap } from '@automapper/classes';
import { DealSpotEntity } from './deal.spot.entity';
import { OrderSide } from 'ccxt/js/src/base/types';
import { OrderType_LT } from 'binance-api-node';

export enum CLIENT_ORDER_SPOT_TYPE {
  BASE = 'BASE',
  TAKE_PROFIT = 'TAKE_PROFIT',
  STOP_LOSS = 'STOP_LOSS',
  CLOSE_AT_MARKET = 'CLOSE_AT_MARKET',
}

@Entity({ name: 'order_spot' })
export class OrderSpotEntity {
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
    name: 'client_order_spot_type',
    type: 'enum',
    enum: CLIENT_ORDER_SPOT_TYPE,
    default: CLIENT_ORDER_SPOT_TYPE.BASE,
  })
  clientOrderType: CLIENT_ORDER_SPOT_TYPE;
  @AutoMap()
  @Column({ type: 'int' })
  sequence: number;

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
  @Column({ name: 'exchange_order_type', length: 255, nullable: true })
  exchangeOrderType: OrderType_LT;

  @AutoMap()
  @Column({ length: 64, nullable: true })
  status: 'created' | 'open' | 'closed' | 'canceled' | 'expired' | 'rejected';

  @AutoMap()
  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @AutoMap()
  @Column({ name: 'placed_count', type: 'int', default: 0 })
  placedCount: number;

  @ManyToOne(() => DealSpotEntity)
  @JoinColumn({ name: 'deal_id', referencedColumnName: 'id' })
  deal: DealSpotEntity;
}

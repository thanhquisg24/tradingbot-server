import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DEAL_START_TYPE, STRATEGY_DIRECTION } from './bot.entity';
import { FuturesOrderType_LT, OrderType } from 'binance-api-node';

import { OrderEntity } from './order.entity';

export enum DEAL_STATUS {
  'CREATED' = 'CREATED',
  'ACTIVE' = 'ACTIVE',
  'CLOSED' = 'CLOSED',
  'CANCELED' = 'CANCELED',
}
export enum CLIENT_DEAL_TYPE {
  'DCA' = 'DCA',
  'REDUCE' = 'REDUCE',
}

@Entity()
export class DealEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number;

  @Column({ name: 'bot_id', type: 'int', nullable: true })
  botId: number;

  @Column({ name: 'exchange_id', type: 'int', nullable: true })
  exchangeId: number;

  @Column({
    name: 'client_deal_type',
    type: 'enum',
    enum: CLIENT_DEAL_TYPE,
    default: CLIENT_DEAL_TYPE.DCA,
  })
  clientDealType: CLIENT_DEAL_TYPE;

  @OneToMany(() => OrderEntity, (order) => order.deal, { eager: true })
  orders: OrderEntity[];

  @Column({
    name: 'status',
    type: 'enum',
    enum: DEAL_STATUS,
    default: DEAL_STATUS.CREATED,
  })
  status: DEAL_STATUS;

  @CreateDateColumn({ name: 'start_at', type: 'timestamptz' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamptz', nullable: true })
  endAt: Date;

  @Column({
    name: 'profit',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  profit: number;

  @Column({ length: 16 })
  pair: string;

  @Column({ name: 'preference_reduce_deal_id', type: 'int', nullable: true })
  refReduceDealId: number;

  @Column({
    name: 'current_avg_price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
    default: 0,
  })
  curAvgPrice: number;

  @Column({
    name: 'current_quantity',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
    default: 0,
  })
  curQuantity: number;

  @Column({ name: 'current_reduce_count', type: 'int', default: 0 })
  curReduceCount: number;

  @Column({ name: 'max_reduce_count', type: 'int', default: 0 })
  maxReduceCount: number;

  @Column({
    name: 'base_order_size',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  baseOrderSize: number;

  @Column({
    name: 'safety_order_size',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  safetyOrderSize: number;

  @Column({
    name: 'direction',
    type: 'enum',
    enum: STRATEGY_DIRECTION,
    default: STRATEGY_DIRECTION.LONG,
  })
  strategyDirection: STRATEGY_DIRECTION;

  // LIMIT or MARKET
  @Column({ name: 'start_order_type', length: 64 })
  startOrderType: FuturesOrderType_LT;

  // ASAP
  @Column({
    name: 'deal_start_condition',
    type: 'enum',
    enum: DEAL_START_TYPE,
    default: DEAL_START_TYPE.ASAP,
  })
  dealStartCondition: DEAL_START_TYPE;

  @Column({
    name: 'target_profit_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 1,
  })
  targetProfitPercentage: number;

  @Column({
    name: 'use_stop_loss',
    type: 'boolean',
    default: false,
  })
  useStopLoss: boolean;

  @Column({
    name: 'target_stoploss_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  targetStopLossPercentage: number;

  @Column({ name: 'current_safety_trades_count', type: 'int', default: 0 })
  curSafetyTradesCount: number;

  @Column({ name: 'max_safety_trades_count', type: 'int', default: 0 })
  maxSafetyTradesCount: number;

  @Column({ name: 'max_active_safety_trades_count', type: 'int', default: 0 })
  maxActiveSafetyTradesCount: number;

  @Column({
    name: 'reduce_deviation_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 1,
  })
  reduceDeviationPercentage: number;

  @Column({
    name: 'price_deviation_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 1,
  })
  priceDeviationPercentage: number;

  @Column({
    name: 'safety_order_volume_scale',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 1,
  })
  safetyOrderVolumeScale: number;

  @Column({
    name: 'safety_order_step_scale',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 1,
  })
  safetyOrderStepScale: number;
}

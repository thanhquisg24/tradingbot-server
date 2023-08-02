import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DEAL_START_TYPE, STRATEGY_DIRECTION } from './bot.entity';

import { AutoMap } from '@automapper/classes';
import { FuturesOrderType_LT } from 'binance-api-node';
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
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

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
    name: 'client_deal_type',
    type: 'enum',
    enum: CLIENT_DEAL_TYPE,
    default: CLIENT_DEAL_TYPE.DCA,
  })
  clientDealType: CLIENT_DEAL_TYPE;

  @AutoMap(() => [OrderEntity])
  @OneToMany(() => OrderEntity, (order) => order.deal, { eager: true })
  orders: OrderEntity[];

  @AutoMap()
  @Column({
    name: 'status',
    type: 'enum',
    enum: DEAL_STATUS,
    default: DEAL_STATUS.CREATED,
  })
  status: DEAL_STATUS;

  @AutoMap()
  @CreateDateColumn({ name: 'start_at', type: 'timestamptz' })
  startAt: Date;

  @AutoMap()
  @Column({ name: 'end_at', type: 'timestamptz', nullable: true })
  endAt: Date;

  @AutoMap()
  @Column({
    name: 'profit',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  profit: number;

  @AutoMap()
  @Column({ length: 16 })
  pair: string;

  @AutoMap()
  @Column({ name: 'preference_reduce_deal_id', type: 'int', nullable: true })
  refReduceDealId: number;

  @AutoMap()
  @Column({
    name: 'current_avg_price',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
    default: 0,
  })
  curAvgPrice: number;

  @AutoMap()
  @Column({
    name: 'current_quantity',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
    default: 0,
  })
  curQuantity: number;

  @AutoMap()
  @Column({ name: 'current_reduce_count', type: 'int', default: 0 })
  curReduceCount: number;

  @AutoMap()
  @Column({ name: 'max_reduce_count', type: 'int', default: 0 })
  maxReduceCount: number;

  @AutoMap()
  @Column({
    name: 'base_order_size',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  baseOrderSize: number;

  @AutoMap()
  @Column({
    name: 'safety_order_size',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  safetyOrderSize: number;

  @AutoMap()
  @Column({
    name: 'direction',
    type: 'enum',
    enum: STRATEGY_DIRECTION,
    default: STRATEGY_DIRECTION.LONG,
  })
  strategyDirection: STRATEGY_DIRECTION;

  // LIMIT or MARKET
  @AutoMap()
  @Column({ name: 'start_order_type', length: 64 })
  startOrderType: FuturesOrderType_LT;

  // ASAP
  @AutoMap()
  @Column({
    name: 'deal_start_condition',
    type: 'enum',
    enum: DEAL_START_TYPE,
    default: DEAL_START_TYPE.ASAP,
  })
  dealStartCondition: DEAL_START_TYPE;

  @AutoMap()
  @Column({
    name: 'target_profit_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 1,
  })
  targetProfitPercentage: number;

  @AutoMap()
  @Column({
    name: 'use_stop_loss',
    type: 'boolean',
    default: false,
  })
  useStopLoss: boolean;

  @AutoMap()
  @Column({
    name: 'target_stoploss_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  targetStopLossPercentage: number;

  @AutoMap()
  @Column({ name: 'current_safety_trades_count', type: 'int', default: 0 })
  curSafetyTradesCount: number;

  @AutoMap()
  @Column({ name: 'max_safety_trades_count', type: 'int', default: 0 })
  maxSafetyTradesCount: number;

  @AutoMap()
  @Column({ name: 'max_active_safety_trades_count', type: 'int', default: 0 })
  maxActiveSafetyTradesCount: number;

  @AutoMap()
  @Column({
    name: 'reduce_deviation_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 1,
  })
  reduceDeviationPercentage: number;

  @AutoMap()
  @Column({
    name: 'price_deviation_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 1,
  })
  priceDeviationPercentage: number;

  @AutoMap()
  @Column({
    name: 'safety_order_volume_scale',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 1,
  })
  safetyOrderVolumeScale: number;

  @AutoMap()
  @Column({
    name: 'safety_order_step_scale',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 1,
  })
  safetyOrderStepScale: number;
}

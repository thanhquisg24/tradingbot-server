import { OrderType } from 'binance-api-node';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';
import { DEAL_START_TYPE, STRATEGY_DIRECTION } from './bot.entity';

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

  @Column({
    name: 'base_order_size',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  baseOrderSize: string;

  @Column({
    name: 'safety_order_size',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  safetyOrderSize: string;

  @Column({
    name: 'direction',
    type: 'enum',
    enum: STRATEGY_DIRECTION,
    default: STRATEGY_DIRECTION.LONG,
  })
  strategyDirection: STRATEGY_DIRECTION;

  // LIMIT or MARKET
  @Column({ name: 'start_order_type', length: 16 })
  startOrderType: OrderType;

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
  })
  targetProfitPercentage: number;

  @Column({
    name: 'target_stoploss_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  targetStopLossPercentage: number;

  @Column({ name: 'max_safety_trades_count', type: 'int' })
  maxSafetyTradesCount: number;

  @Column({ name: 'max_active_safety_trades_count', type: 'int' })
  maxActiveSafetyTradesCount: number;

  @Column({
    name: 'price_deviation_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  priceDeviationPercentage: number;

  @Column({
    name: 'safety_order_volume_scale',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  safetyOrderVolumeScale: number;

  @Column({
    name: 'safety_order_step_scale',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  safetyOrderStepScale: number;
}

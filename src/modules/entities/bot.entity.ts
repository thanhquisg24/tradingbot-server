import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { COMMON_STATUS } from 'src/common/constants';
import { ExchangeEntity } from './exchange.entity';
import { PairEntity } from './pair.entity';

export enum BOT_TRADING_TYPE {
  DCA = 'DCA',
  REDUCE = 'REDUCE',
}
export enum STRATEGY_DIRECTION {
  LONG = 'LONG',
  SHORT = 'SHORT',
}
export enum DEAL_START_TYPE {
  ASAP = 'ASAP',
  TRADINGVIEW = 'tradingview',
}

@Entity({ name: 'bot_trading' })
export class BotTradingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', length: 255, nullable: false })
  name: string;

  @Column({
    name: 'bot_type',
    type: 'enum',
    enum: BOT_TRADING_TYPE,
    default: BOT_TRADING_TYPE.DCA,
  })
  botType: BOT_TRADING_TYPE;

  @Column({
    name: 'direction',
    type: 'enum',
    enum: STRATEGY_DIRECTION,
    default: STRATEGY_DIRECTION.LONG,
  })
  strategyDirection: STRATEGY_DIRECTION;

  @Column({ name: 'user_id', type: 'int', nullable: false })
  userId: number;

  @Column({
    type: 'enum',
    enum: COMMON_STATUS,
    default: COMMON_STATUS.DISABLED,
  })
  status: COMMON_STATUS;

  @ManyToOne(() => ExchangeEntity)
  @JoinColumn({ name: 'exchange_id', referencedColumnName: 'id' })
  exchange: ExchangeEntity;

  @ManyToMany(() => PairEntity)
  @JoinTable()
  pairs: PairEntity[];

  // LIMIT or MARKET
  @Column({ name: 'start_order_type', length: 16, default: 'MARKET' })
  startOrderType: 'LIMIT' | 'MARKET';

  @Column({ name: 'leverage', type: 'int', nullable: false, default: 8 })
  leverage: number;

  // ASAP
  @Column({
    name: 'deal_start_condition',
    type: 'enum',
    enum: DEAL_START_TYPE,
    default: DEAL_START_TYPE.ASAP,
  })
  dealStartCondition: DEAL_START_TYPE;

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

  @Column({
    name: 'use_stop_loss',
    type: 'boolean',
    default: false,
  })
  useStopLoss: boolean;

  @Column({ name: 'max_active_deal', type: 'int' })
  maxActiveDeal: number;

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

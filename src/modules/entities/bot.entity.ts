import {
  BOT_TRADING_TYPE,
  DEAL_START_TYPE,
  MARGIN_MODE,
  STRATEGY_DIRECTION,
} from './enum-type';
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

import { AutoMap } from '@automapper/classes';
import { COMMON_STATUS } from 'src/common/constants';
import { ExchangeEntity } from './exchange.entity';
import { PairEntity } from './pair.entity';

@Entity({ name: 'bot_trading' })
export class BotTradingEntity {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @Column({ name: 'name', length: 255, nullable: false })
  name: string;

  @AutoMap()
  @Column({
    name: 'bot_type',
    type: 'enum',
    enum: BOT_TRADING_TYPE,
    default: BOT_TRADING_TYPE.DCA,
  })
  botType: BOT_TRADING_TYPE;

  @AutoMap()
  @Column({
    name: 'margin_mode',
    type: 'enum',
    enum: MARGIN_MODE,
    default: MARGIN_MODE.CROSS,
  })
  marginMode: MARGIN_MODE;

  @AutoMap()
  @Column({
    name: 'direction',
    type: 'enum',
    enum: STRATEGY_DIRECTION,
    default: STRATEGY_DIRECTION.LONG,
  })
  strategyDirection: STRATEGY_DIRECTION;

  @AutoMap()
  @Column({ name: 'user_id', type: 'int', nullable: false })
  userId: number;

  @AutoMap()
  @Column({
    type: 'enum',
    enum: COMMON_STATUS,
    default: COMMON_STATUS.DISABLED,
  })
  status: COMMON_STATUS;

  @AutoMap(() => ExchangeEntity)
  @ManyToOne(() => ExchangeEntity)
  @JoinColumn({ name: 'exchange_id', referencedColumnName: 'id' })
  exchange: ExchangeEntity;

  @AutoMap(() => [PairEntity])
  @ManyToMany(() => PairEntity)
  @JoinTable()
  pairs: PairEntity[];

  // LIMIT or MARKET
  @AutoMap()
  @Column({ name: 'start_order_type', length: 64, default: 'MARKET' })
  startOrderType: 'LIMIT' | 'MARKET';

  @AutoMap()
  @Column({ name: 'leverage', type: 'int', nullable: false, default: 8 })
  leverage: number;

  @AutoMap()
  @Column({ name: 'max_deal_same_pair', type: 'int', default: 1 })
  maxDealSamePairCount: number;

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
    name: 'target_profit_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  targetProfitPercentage: number;

  @AutoMap()
  @Column({
    name: 'use_trailing_take_profit',
    type: 'boolean',
    default: false,
  })
  useTrailingTP: boolean;

  @AutoMap()
  @Column({
    name: 'call_back_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0.2,
  })
  //min 0.1 max 10 , 1 for 1%
  callBackRate: number;

  @AutoMap()
  @Column({
    name: 'target_stoploss_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  targetStopLossPercentage: number;

  @AutoMap()
  @Column({
    name: 'use_stop_loss',
    type: 'boolean',
    default: false,
  })
  useStopLoss: boolean;

  @AutoMap()
  @Column({ name: 'max_active_deal', type: 'int' })
  maxActiveDeal: number;

  @AutoMap()
  @Column({ name: 'max_safety_trades_count', type: 'int' })
  maxSafetyTradesCount: number;

  @AutoMap()
  @Column({ name: 'max_active_safety_trades_count', type: 'int' })
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
  })
  priceDeviationPercentage: number;

  @AutoMap()
  @Column({
    name: 'safety_order_volume_scale',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  safetyOrderVolumeScale: number;

  @AutoMap()
  @Column({
    name: 'safety_order_step_scale',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  safetyOrderStepScale: number;

  @AutoMap()
  @Column({
    name: 'min_funding_rate_start',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0.5,
  })
  minFundingRateStart: number;

  @AutoMap()
  @Column({ name: 'max_reduce_count', type: 'int', default: 0 })
  maxReduceCount: number;

  @AutoMap()
  @Column({ name: 'ref_bot_id', type: 'int', nullable: true })
  refBotId: number;

  @AutoMap()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

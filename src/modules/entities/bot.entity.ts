import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { COMMON_STATUS } from 'src/common/constants';
import { ExchangeEntity } from './exchange.entity';

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
    default: COMMON_STATUS.ACTIVE,
  })
  status: COMMON_STATUS;

  @ManyToOne(() => ExchangeEntity)
  @JoinColumn({ name: 'exchange_id', referencedColumnName: 'id' })
  exchange: ExchangeEntity;

  // ASAP
  @Column({
    name: 'deal_start_condition',
    type: 'enum',
    enum: DEAL_START_TYPE,
    default: DEAL_START_TYPE.ASAP,
  })
  dealStartCondition: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  targetProfitPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  targetStopLossPercentage: number;

  @Column({ type: 'int' })
  maxSafetyTradesCount: number;

  @Column({ type: 'int' })
  maxActiveSafetyTradesCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  priceDeviationPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  safetyOrderVolumeScale: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  safetyOrderStepScale: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

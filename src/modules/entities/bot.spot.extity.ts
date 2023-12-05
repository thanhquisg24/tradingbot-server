import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AutoMap } from '@automapper/classes';
import { COMMON_STATUS } from 'src/common/constants';
import { DEAL_START_TYPE } from './bot.entity';
import { ExchangeEntity } from './exchange.entity';

export enum BOT_SPOT_TYPE {
  GRID = 'GRID',
  INVEST = 'INVENST',
  TRADE = 'TRADE',
}

@Entity({ name: 'bot_spot' })
export class BotSpotEntity {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @Column({ name: 'name', length: 255, nullable: false })
  name: string;

  @AutoMap()
  @Column({
    name: 'bot_spot_type',
    type: 'enum',
    enum: BOT_SPOT_TYPE,
    default: BOT_SPOT_TYPE.INVEST,
  })
  botType: BOT_SPOT_TYPE;

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
    nullable: true,
  })
  targetProfitPercentage: number;

  @AutoMap()
  @Column({
    name: 'target_stoploss_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
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
  @Column({ name: 'max_active_deal', type: 'int', nullable: true })
  maxActiveDeal: number;

  @AutoMap()
  @Column({ name: 'max_safety_trades_count', type: 'int', nullable: true })
  maxSafetyTradesCount: number;

  @AutoMap()
  @Column({
    name: 'price_deviation_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  priceDeviationPercentage: number;

  @AutoMap()
  @Column({
    name: 'safety_order_volume_scale',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  safetyOrderVolumeScale: number;

  @AutoMap()
  @Column({
    name: 'safety_order_step_scale',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  safetyOrderStepScale: number;

  @AutoMap()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

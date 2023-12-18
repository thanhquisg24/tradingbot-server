import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderSide, OrderType } from 'ccxt/js/src/base/types';

import { AutoMap } from '@automapper/classes';
import { BOT_SPOT_TYPE } from './bot.spot.extity';
import { DEAL_START_TYPE } from './bot.entity';
import { DEAL_STATUS } from './deal.entity';
import { OrderSpotEntity } from './order.spot.entity';

@Entity({ name: 'deal_spot' })
export class DealSpotEntity {
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
    name: 'client_deal_spot_type',
    type: 'enum',
    enum: BOT_SPOT_TYPE,
    default: BOT_SPOT_TYPE.INVEST,
  })
  clientDealSpotType: BOT_SPOT_TYPE;

  @AutoMap(() => [OrderSpotEntity])
  @OneToMany(() => OrderSpotEntity, (order) => order.deal, { eager: true })
  orders: OrderSpotEntity[];

  @AutoMap()
  @Column({
    name: 'status',
    type: 'enum',
    enum: DEAL_STATUS,
    default: DEAL_STATUS.CREATED,
  })
  status: DEAL_STATUS;

  @AutoMap()
  @CreateDateColumn({ name: 'start_at', type: 'timestamptz', nullable: true })
  startAt: Date;

  @AutoMap()
  @Column({ name: 'end_at', type: 'timestamptz', nullable: true })
  endAt: Date;

  @AutoMap()
  @Column({ name: 'day_step_multiple', type: 'int', nullable: true })
  dayStepMultiple: number;

  @AutoMap()
  @Column({ name: 'total_filled_order', type: 'int', nullable: true })
  totalFilledOrder: number;

  @AutoMap()
  @Column({ name: 'total_order', type: 'int', nullable: true })
  totalOrder: number;

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
    name: 'side',
    length: 255,
    default: 'buy',
  })
  side: OrderSide;

  // LIMIT or MARKET
  @AutoMap()
  @Column({ name: 'start_order_type', length: 64 })
  startOrderType: OrderType;

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

}

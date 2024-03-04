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
import { ExchangeEntity } from './exchange.entity';
import { WATCHER_TYPE } from './enum-type';

@Entity({ name: 'exchange_watcher' })
export class ExchangeWatcherEntity {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @Column({ name: 'name', length: 255, nullable: false })
  name: string;

  @AutoMap()
  @Column({
    name: 'watcher_type',
    type: 'enum',
    enum: WATCHER_TYPE,
    default: WATCHER_TYPE.LAST_SO,
  })
  watcherType: WATCHER_TYPE;

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

  @AutoMap()
  @Column({
    name: 'min_order_size',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  minOrderSize: number;

  @AutoMap()
  @Column({
    name: 'max_order_size',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  maxOrderSize: number;

  @AutoMap()
  @Column({
    name: 'deal_profit_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  dealProfitPercentage: number;

  @AutoMap()
  @Column({
    name: 'deal_average_deviation',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  dealAverageDeviation: number;

  @AutoMap()
  @Column({
    name: 'deal_total_volume',
    type: 'decimal',
    precision: 20,
    scale: 10,
    nullable: true,
  })
  dealTotalVolume: number;

  @AutoMap()
  @Column({ name: 'ref_long_bot_id', type: 'int', nullable: true })
  refLongBotId: number;

  @AutoMap()
  @Column({ name: 'ref_short_bot_id', type: 'int', nullable: true })
  refShortBotId: number;

  @AutoMap()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

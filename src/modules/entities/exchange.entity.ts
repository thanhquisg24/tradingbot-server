import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AutoMap } from '@automapper/classes';
import { BotTradingEntity } from './bot.entity';
import { COMMON_STATUS } from 'src/common/constants';
import { ExchangeWatcherEntity } from './exchange-watcher.entity';
import { ExchangesEnum } from './enum-type';
import { UserEntity } from './user.entity';

@Entity({ name: 'exchange' })
export class ExchangeEntity {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @Column({
    type: 'enum',
    enum: ExchangesEnum,
    default: ExchangesEnum.PAPER,
  })
  name: ExchangesEnum;

  @AutoMap()
  @Column({ name: 'label', length: 255, nullable: false })
  label: string;

  @AutoMap()
  @Column({ name: 'api_key', length: 255, nullable: false })
  apiKey: string;

  @AutoMap()
  @Column({ name: 'api_secret', length: 255, nullable: false })
  apiSecret: string;

  @AutoMap()
  @Column({
    name: 'is_testnet',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  isTestNet: boolean;

  @AutoMap()
  @Column({
    type: 'enum',
    enum: COMMON_STATUS,
    default: COMMON_STATUS.ACTIVE,
  })
  status: COMMON_STATUS;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @OneToMany(() => BotTradingEntity, (ex) => ex.exchange, { eager: false })
  bots: BotTradingEntity[];

  @OneToMany(() => ExchangeWatcherEntity, (ex) => ex.exchange, { eager: false })
  watchers: ExchangeWatcherEntity[];

  @AutoMap()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { COMMON_STATUS } from 'src/common/constants';
import { UserEntity } from './user.entity';
import { BotTradingEntity } from './bot.entity';

export enum ExchangesEnum {
  BINANCEUSDM = 'binanceusdm',
  BINANCE = 'binance',
  PAPER = 'paper',
}
@Entity({ name: 'exchange' })
export class ExchangeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ExchangesEnum,
    default: ExchangesEnum.PAPER,
  })
  name: ExchangesEnum;

  @Column({ name: 'label', length: 255, nullable: false })
  label: string;

  @Column({ name: 'api_key', length: 255, nullable: false })
  apiKey: string;

  @Column({ name: 'api_secret', length: 255, nullable: false })
  apiSecret: string;

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

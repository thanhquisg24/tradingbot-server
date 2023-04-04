import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { COMMON_STATUS } from 'src/common/constants';
import { ExchangesEnum } from './exchange.entity';

@Entity({ name: 'pair' })
export class PairEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'from_exchange',
    type: 'enum',
    enum: ExchangesEnum,
    default: ExchangesEnum.PAPER,
  })
  fromExchange: ExchangesEnum;

  @Column({ name: 'common_pair', length: 255, nullable: false })
  commonPair: string;

  @Column({ name: 'exchange_pair', length: 255, nullable: false })
  exchangePair: string;

  @Column({
    type: 'enum',
    enum: COMMON_STATUS,
    default: COMMON_STATUS.ACTIVE,
  })
  status: COMMON_STATUS;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

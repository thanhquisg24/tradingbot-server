import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AutoMap } from '@automapper/classes';
import { COMMON_STATUS } from 'src/common/constants';
import { ExchangesEnum } from './enum-type';

@Entity({ name: 'pair' })
export class PairEntity {
  constructor(
    _fromExchange: ExchangesEnum,
    _commonPair: string,
    _exchangePair: string,
  ) {
    this.fromExchange = _fromExchange;
    this.commonPair = _commonPair;
    this.exchangePair = _exchangePair;
  }

  @AutoMap()
  @PrimaryGeneratedColumn()
  id: number;

  @AutoMap()
  @Column({
    name: 'from_exchange',
    type: 'enum',
    enum: ExchangesEnum,
    default: ExchangesEnum.PAPER,
  })
  fromExchange: ExchangesEnum;

  @AutoMap()
  @Column({ name: 'common_pair', length: 255, nullable: false })
  commonPair: string;

  @AutoMap()
  @Column({ name: 'exchange_pair', length: 255, nullable: false })
  exchangePair: string;

  @AutoMap()
  @Column({
    type: 'enum',
    enum: COMMON_STATUS,
    default: COMMON_STATUS.ACTIVE,
  })
  status: COMMON_STATUS;

  @AutoMap()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

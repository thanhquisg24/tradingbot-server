import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { STATUS } from 'src/common/constants';

@Entity({ name: 'vesting_history' })
export class VesingHistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'txId', length: 255, nullable: false })
  txId: string;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ name: 'amount', type: 'bigint', nullable: false, default: 0 })
  amount: number;

  @Column({ name: 'from_address', length: 255, nullable: false })
  fromAddress: string;

  @Column({ name: 'to_address', length: 255, nullable: false })
  toAddress: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ length: 255, nullable: false, default: STATUS.PENDING })
  status: STATUS;
}

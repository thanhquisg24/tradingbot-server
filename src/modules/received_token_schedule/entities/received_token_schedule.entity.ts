import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { STATUS } from 'src/common/constants';

@Entity({ name: 'received_token_schedule' })
export class ReceivedTokenScheduleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ name: 'amount', type: 'bigint', nullable: false, default: 0 })
  amount: number;

  @Column({ length: 255, nullable: false, default: STATUS.PENDING })
  status: STATUS;

  @CreateDateColumn({ name: 'received_at', type: 'timestamptz' })
  receivedDate: Date;
}

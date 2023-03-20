import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ROLE } from 'src/common/constants';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false, unique: true })
  email: string;

  @Column({ length: 255, nullable: false })
  password: string;

  @Column({ name: 'price', type: 'real', nullable: false, default: 0 })
  price: number;

  @Column({ name: 'total_amount', type: 'bigint', nullable: false, default: 0 })
  totalAmount: number;

  @Column({ name: 'locked', type: 'bigint', nullable: false, default: 0 })
  locked: number;

  @Column({ name: 'avaiable', type: 'bigint', nullable: false, default: 0 })
  avaiable: number;

  @Column({ name: 'claimed', type: 'bigint', nullable: false, default: 0 })
  claimed: number;

  @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ name: 'vesting_logic', length: 255, nullable: true })
  vestingLogic: string;

  @Column({ name: 'refreshtoken', length: 255, nullable: true })
  refreshtoken: string;

  @Column({ name: 'refreshtokenexpires', length: 255, nullable: true })
  refreshtokenexpires: string;

  @Column({
    name: 'roles',
    type: 'text',
    array: true,
    nullable: true,
    default: [ROLE.USER],
  })
  roles: ROLE[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

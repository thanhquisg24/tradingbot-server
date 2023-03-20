import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'vesting_address' })
export class VestingAddressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @Column({ name: 'balance', type: 'bigint', nullable: false })
  balance: number;

  @Column({ name: 'address', length: 255, nullable: false })
  address: string;

  @Column({ name: 'private_key', length: 255, nullable: false })
  private_key: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

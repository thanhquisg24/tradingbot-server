import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'token' })
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'token_address', length: 255, nullable: false, unique: true })
  tokenAddress: string;

  @Column({ name: 'token_symbol', length: 255, nullable: true })
  tokenSymbol: string;

  @Column({ name: 'token_scan_url', length: 255, nullable: true })
  tokenScanUrl: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

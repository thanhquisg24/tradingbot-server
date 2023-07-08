import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ROLE, USER_STATUS } from 'src/common/constants';
import { ExchangeEntity } from './exchange.entity';
import { Exclude } from '@nestjs/class-transformer';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, nullable: false, unique: true })
  email: string;

  @Column({ length: 255, nullable: false })
  @Exclude()
  password: string;

  @Column({ name: 'telegram_chat_id', length: 255, nullable: true })
  telegramChatId: string;

  @Column({ name: 'refreshtoken', length: 255, nullable: true })
  refreshtoken: string;

  @Column({ name: 'refreshtokenexpires', length: 255, nullable: true })
  refreshtokenexpires: string;

  @Column({
    type: 'enum',
    enum: USER_STATUS,
    default: USER_STATUS.ACTIVE,
  })
  status: USER_STATUS;

  @Column({
    name: 'roles',
    type: 'text',
    array: true,
    nullable: true,
    default: [ROLE.USER],
  })
  roles: ROLE[];

  @OneToMany(() => ExchangeEntity, (ex) => ex.user, { eager: false })
  exchanges: ExchangeEntity[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AutoMap } from '@automapper/classes';
import { EVENT_STATUS } from 'src/common/constants';
import { REDUCE_EV_TYPES } from 'src/common/event/reduce_events';

@Entity({ name: 'protection_event' })
export class ProtectionEventEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @AutoMap()
  @Column({
    name: 'event_type',
    type: 'enum',
    enum: REDUCE_EV_TYPES,
    default: REDUCE_EV_TYPES.PREPARE_ROUND,
  })
  eventType: REDUCE_EV_TYPES;

  @AutoMap()
  @Column({ name: 'payload', type: 'text' })
  payload: string;

  @AutoMap()
  @Column({ name: 'from_bot_id', type: 'int', nullable: true })
  fromBotId: number | null;

  @AutoMap()
  @Column({ name: 'to_bot_id', type: 'int', nullable: true })
  toBotId: number | null;

  @AutoMap()
  @Column({ name: 'from_deal_id', type: 'int', nullable: true })
  fromDealId: number | null;

  @AutoMap()
  @Column({ name: 'to_deal_id', type: 'int', nullable: true })
  toDealId: number | null;

  @AutoMap()
  @Column({ name: 'current_round', type: 'int', nullable: false, default: 1 })
  currentRound: number;

  @AutoMap()
  @Column({
    type: 'enum',
    enum: EVENT_STATUS,
    default: EVENT_STATUS.SEND,
  })
  status: EVENT_STATUS;

  @AutoMap()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

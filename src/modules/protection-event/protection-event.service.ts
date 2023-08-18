import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProtectionEventEntity } from '../entities/protection-event.entity';
import { EVENT_STATUS } from 'src/common/constants';
import { BotEventData } from 'src/common/event/reduce_events';

@Injectable()
export class ProtectionEventService {
  constructor(
    @InjectRepository(ProtectionEventEntity)
    private readonly repo: Repository<ProtectionEventEntity>,
  ) {}

  async createEvent(event: ProtectionEventEntity) {
    await this.repo.create(event);
  }
  async updateEventStatus(event_id: string, eventStatus: EVENT_STATUS) {
    await this.repo.update(event_id, { status: eventStatus });
  }

  async createEventFromRaw(eventRaw: BotEventData) {
    const newEntity = new ProtectionEventEntity();
    newEntity.id = eventRaw.eventId;
    newEntity.eventType = eventRaw.type;
    newEntity.fromBotId = eventRaw.payload.fromBotId;
    newEntity.toBotId = eventRaw.payload.toBotId;
    newEntity.fromDealId = eventRaw.payload.fromDealId;
    newEntity.toDealId = eventRaw.payload.toDealId;
    newEntity.payload = JSON.stringify(eventRaw.payload);
    newEntity.status = EVENT_STATUS.SEND;
    newEntity.currentRound = eventRaw.round_count;
    await this.createEvent(newEntity);
  }

  async findEventByBotAndDeal(bot_id: number, deal_id: number) {
    this.repo.find({
      where: {
        fromBotId: bot_id,
        fromDealId: deal_id,
      },
      order: { createdAt: 'ASC' },
    });
  }
  async findSendEventByBotAndDeal(bot_id: number, deal_id: number) {
    return this.repo.find({
      where: {
        fromBotId: bot_id,
        fromDealId: deal_id,
        status: EVENT_STATUS.SEND,
      },
      order: { createdAt: 'ASC' },
    });
  }
}

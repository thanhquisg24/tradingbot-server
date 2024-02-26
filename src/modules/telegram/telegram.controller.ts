import { Body, Controller, Get, Post } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { TelegramService } from './telegram.service';
import { UserMsgDTO } from './dto/user-msg-dto';
import { ConfigService } from '@nestjs/config';

@Controller('api/v1/telegram')
@ApiTags('Telegram APIs')
export class TelegramController {
  passPhrase: string = '';

  constructor(private readonly telegramService: TelegramService) {}

  @Get('/')
  hello() {
    return 'hello TelegramController';
  }

  @Post('/send-msg-to-user')
  sendMsgToUser(@Body() dto: UserMsgDTO) {
    this.telegramService.sendMessageToUser(dto.userId, dto.message);
    return 'ok';
  }
}

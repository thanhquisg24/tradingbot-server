import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class TelegramService {
  passPhrase: string = '';
  serverUrl: string = '';

  constructor(
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    this.passPhrase = this.configService.get<string>('PASSPHRASE_EMIT');
    this.serverUrl = this.configService.get<string>('TELEGRAM_SERVER_URL');
  }

  sendMessageToUser = (userId: string, message: string): void => {
    axios
      .post(this.serverUrl + '/send-msg-to-user', {
        userId,
        message,
        passPhrase: this.passPhrase,
      })
      .then()
      .catch((err) => {
        console.log('🚀 ~ TelegramService ~ err:', err);
        this.logger.error(
          `Can't not send Msg Via telegram Bot:${err.message} ,UserChatId:${userId} , MessagePayload:${message}`,
          TelegramService.name,
        );
      });
  };
}

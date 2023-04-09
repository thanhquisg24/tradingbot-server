import { Logger } from '@nestjs/common';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class BotTrading {
  id: string;
  private logger: Logger;
  private isRunning: boolean;
  constructor(id: string) {
    this.id = id;
    this.logger = new Logger('Bot #' + id);
  }
  executed() {
    let count = 0;
    this.isRunning = true;
    while (this.isRunning) {
      sleep(1000).then(() => {
        count++;
        this.logger.log('Bot #' + this.id + 'is running count: ' + count);
      });
    }
  }
  stop() {
    console.log('Bot #' + this.id + 'is Stoped');
    this.isRunning = false;
  }
}

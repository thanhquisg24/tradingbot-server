import { Logger } from '@nestjs/common';

// const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class BotTrading {
  id: string;
  private logger: Logger;
  private isRunning: boolean;
  private count: number;
  constructor(id: string) {
    this.id = id;
    this.isRunning = false;
    this.logger = new Logger('Bot #' + id);
    this.count = 0;
  }
  start() {
    this.isRunning = true;
    this.logger.log('Bot #' + this.id + 'is running');
  }
  stop() {
    console.log('Bot #' + this.id + 'is Stoped');
    this.isRunning = false;
  }

  watchPosition() {
    if (this.isRunning) {
      this.logger.log('Bot #' + this.id + 'is watching position ' + this.count);
      this.count = this.count + 1;
    }
  }
}

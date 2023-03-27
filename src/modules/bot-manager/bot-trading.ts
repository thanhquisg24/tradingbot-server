export class BotTrading {
  id: string;
  constructor(id: string) {
    this.id = id;
  }
  executed() {
    console.log('Bot #' + this.id + 'is running');
  }
  stop() {
    console.log('Bot #' + this.id + 'is Stoped');
  }
}

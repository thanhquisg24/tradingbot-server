import { Controller, Get, Inject, LoggerService } from '@nestjs/common';
import { AppService } from './app.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('App default')
@Controller('api/v1/app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @Get()
  getHello(): string {
    // this.logger.log('Calling getHello()', AppController.name);
    // this.logger.error('Calling getHello()', AppController.name);
    // this.logger.debug('Calling getHello()', AppController.name);
    // this.logger.verbose('Calling getHello()', AppController.name);
    // this.logger.warn('Calling getHello()', AppController.name);
    return this.appService.getHello();
  }
}

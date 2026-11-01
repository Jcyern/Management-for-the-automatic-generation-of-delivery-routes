import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './Auth/public.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
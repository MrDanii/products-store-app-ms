import { Controller } from '@nestjs/common';
import { SeedService } from './seed.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @MessagePattern('seed.execute.secret')
  executeSeed() {
    return this.seedService.executeSeed()
  }
}

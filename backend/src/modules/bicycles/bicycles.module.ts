import { Module } from '@nestjs/common';
import { BicyclesService } from './bicycles.service';
import { BicyclesController } from './bicycles.controller';

@Module({
  providers: [BicyclesService],
  controllers: [BicyclesController]
})
export class BicyclesModule {}

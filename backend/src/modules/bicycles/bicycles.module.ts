import { Module } from '@nestjs/common';
import { BicyclesService } from './bicycles.service';
import { BicyclesController } from './bicycles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BicycleSchema } from 'src/entities';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Bicycle', schema: BicycleSchema }]),
  ],
  providers: [BicyclesService],
  controllers: [BicyclesController],
})
export class BicyclesModule {}

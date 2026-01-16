import { Module } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { InspectionsController } from './inspections.controller';
import { ConfigService } from '@nestjs/config';
import { BicyclesService } from '../bicycles/bicycles.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Bicycle,
  BicycleSchema,
  InspectionReport,
  InspectionReportSchema,
} from 'src/entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InspectionReport.name, schema: InspectionReportSchema },
      { name: Bicycle.name, schema: BicycleSchema },
    ]),
  ],
  providers: [InspectionsService, ConfigService, BicyclesService],
  controllers: [InspectionsController],
})
export class InspectionsModule {}

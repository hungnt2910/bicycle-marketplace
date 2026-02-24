import { Module } from '@nestjs/common';
import { BicyclesService } from './bicycles.service';
import { BicyclesController } from './bicycles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BicycleSchema, User } from 'src/entities';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Bicycle', schema: BicycleSchema }]),
    CloudinaryModule,
    UsersModule,
    MongooseModule.forFeature([{ name: User.name, schema: User }]),
  ],
  providers: [BicyclesService],
  controllers: [BicyclesController],
})
export class BicyclesModule {}

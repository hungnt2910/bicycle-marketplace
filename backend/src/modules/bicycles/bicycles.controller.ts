import { BicyclesService } from './bicycles.service';
import { Controller, Body, Post } from '@nestjs/common';
import { CreateBicyclesDto } from './dto/create-bicycles.dto';
import { Bicycle } from 'src/entities';

@Controller('bicycles')
export class BicyclesController {
  constructor(private readonly BicyclesService: BicyclesService) {}

  @Post('create-bicycle')
  async createBicycle(@Body() bicycle: CreateBicyclesDto): Promise<Bicycle> {
    return this.BicyclesService.createBicycle(bicycle);
  }
}

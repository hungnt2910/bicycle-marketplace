import { BicyclesService } from './bicycles.service';
import { Controller, Body, Post } from '@nestjs/common';
import { CreateBicyclesDto } from './dto/create-bicycles.dto';
import { Bicycle } from 'src/entities';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('bicycles')
export class BicyclesController {
  constructor(private readonly BicyclesService: BicyclesService) {}

  @Post('create-bicycle')
  @ApiOperation({ summary: 'Create a new bicycle listing' })
  @ApiResponse({ status: 201, description: 'Bicycle successfully created' })
  @ApiResponse({ status: 400, description: 'Bicycle failed to create' })
  async createBicycle(@Body() bicycle: CreateBicyclesDto) {
    const result = await this.BicyclesService.createBicycle(bicycle);
    return {
      message: 'Bicycle created successfully',
      data: result,
    };
  }
}

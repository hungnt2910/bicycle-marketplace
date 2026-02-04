import { BicyclesService } from './bicycles.service';
import {
  Controller,
  Body,
  Post,
  Headers,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { CreateBicyclesDto } from './dto/create-bicycles.dto';
import { Bicycle } from 'src/entities';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateBicycleDto } from './dto/update-bicyce.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('bicycles')
export class BicyclesController {
  constructor(private readonly BicyclesService: BicyclesService) {}
  @Public()
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

  @Public()
  @Post('search-bicycles')
  @ApiOperation({ summary: 'Search bicycles by keyword' })
  @ApiResponse({ status: 200, description: 'Bicycles successfully retrieved' })
  @ApiResponse({ status: 409, description: 'Bicycles not exist' })
  async searchBicycles(@Body() keyword: string) {
    const result = await this.BicyclesService.searchBicyclesBykeyword(keyword);
    return {
      message: 'Bicycles retrieved successfully',
      data: result,
    };
  }

  @Public()
  @Post('filter-bicycles')
  @ApiOperation({ summary: 'Filter bicycles based on criteria' })
  @ApiResponse({ status: 200, description: 'Bicycles successfully filtered' })
  @ApiResponse({
    status: 409,
    description: 'No bicycles match the filter criteria',
  })
  async filterBicycles(@Headers() filter: any) {
    const result = await this.BicyclesService.fillerBicycles(filter);
    return {
      message: 'Bicycles filtered successfully',
      data: result,
    };
  }

  @Public()
  @Post('get-all-bicycles')
  @ApiOperation({ summary: 'Get all bicycle listings' })
  @ApiResponse({ status: 200, description: 'Bicycles successfully retrieved' })
  @ApiResponse({ status: 409, description: 'No bicycles found' })
  async getAllBicycles() {
    const result = await this.BicyclesService.findAllBicycles();
    return {
      message: 'Bicycles retrieved successfully',
      data: result,
    };
  }

  @Public()
  @Post('get-bicycle-by-id')
  @ApiOperation({ summary: 'Get bicycle by ID' })
  @ApiResponse({ status: 200, description: 'Bicycle successfully retrieved' })
  @ApiResponse({ status: 409, description: 'Bicycle not found' })
  async getBicycleById(@Body('id') id: string) {
    const result = await this.BicyclesService.findBicycleById(id);
    return {
      message: 'Bicycle retrieved successfully',
      data: result,
    };
  }

  @Public()
  @Patch('update-bicycle/:id')
  @ApiOperation({ summary: 'Update bicycle details' })
  @ApiResponse({ status: 200, description: 'Bicycle successfully updated' })
  @ApiResponse({ status: 409, description: 'Bicycle update failed' })
  async updateBicycle(
    @Param('id') id: string,
    @Body() bicycle: UpdateBicycleDto,
  ) {
    const result = await this.BicyclesService.updateBicycle(id, bicycle);
    return {
      message: 'Bicycle updated successfully',
      data: result,
    };
  }

  @Public()
  @Delete('delete-bicycle/:id')
  @ApiOperation({ summary: 'Delete a bicycle listing' })
  @ApiResponse({ status: 200, description: 'Bicycle successfully deleted' })
  @ApiResponse({ status: 409, description: 'Bicycle deletion failed' })
  async deleteBicycle(@Param('id') id: string) {
    const result = await this.BicyclesService.deleteBicycle(id);
    return {
      message: 'Bicycle deleted successfully',
      data: result,
    };
  }
}

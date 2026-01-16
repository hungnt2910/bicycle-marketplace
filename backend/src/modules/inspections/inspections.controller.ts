import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { InspectionsService } from './inspections.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Inspections')
@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  /**
   * Request inspection for a bicycle
   */
  @Post('request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request an inspection for a bicycle' })
  @ApiResponse({ status: 201, description: 'Inspection requested successfully' })
  @ApiResponse({ status: 400, description: 'Bicycle not found' })
  async requestInspection(
    @Body()
    body: {
      bicycleId: string;
      inspectionType: 'onsite' | 'online';
    },
    @GetUser() user: User,
  ) {
    const inspection = await this.inspectionsService.requestInspection(
      body.bicycleId,
      body.inspectionType,
    );

    return {
      message: 'Inspection requested successfully',
      data: inspection,
    };
  }

  /**
   * Inspector completes inspection
   */
  @Post(':inspectionId/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete an inspection (Inspector only)' })
  @ApiResponse({ status: 200, description: 'Inspection completed successfully' })
  @ApiResponse({ status: 400, description: 'Inspection or Bicycle not found' })
  async completeInspection(
    @Param('inspectionId') inspectionId: string,
    @Body() inspectionData: any,
    @GetUser() user: User,
  ) {
    const inspection = await this.inspectionsService.completeInspection(
      inspectionId,
      user._id.toString(),
      inspectionData,
    );

    return {
      message: 'Inspection completed successfully',
      data: inspection,
    };
  }

  /**
   * Get latest inspection report of a bicycle
   */
  @Get('bicycle/:bicycleId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get latest inspection report for a bicycle' })
  @ApiResponse({ status: 200, description: 'Inspection report retrieved successfully' })
  @ApiResponse({ status: 400, description: 'No inspection report found' })
  async getInspectionReport(
    @Param('bicycleId') bicycleId: string,
  ) {
    const report = await this.inspectionsService.getInspectionReport(bicycleId);

    return {
      message: 'Inspection report retrieved successfully',
      data: report,
    };
  }
}

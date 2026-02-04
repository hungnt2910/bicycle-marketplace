import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InspectionsService } from './inspections.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User, UserRole } from '../../entities/user.entity';
import { RequestInspectionDto } from './dto/request-inspection.dto';
import { CompleteInspectionDto } from './dto/complete-inspection.dto';
import { InspectionVerdict } from 'src/entities';


@ApiTags('Inspections')
@Controller('inspections')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  /**
   * Request inspection for a bicycle (Seller)
   */
  @Post('request')
  @Roles(UserRole.SELLER)
  @ApiOperation({ summary: 'Request inspection for a bicycle (seller only)' })
  @ApiResponse({ status: 201, description: 'Inspection requested successfully' })
  @ApiResponse({ status: 400, description: 'Bicycle not found or already inspected' })
  async requestInspection(
    @GetUser() user: User,
    @Body() requestInspectionDto: RequestInspectionDto,
  ) {
    const inspection = await this.inspectionsService.requestInspection(
      requestInspectionDto.bicycleId,
      requestInspectionDto.inspectionType,
      user._id.toString(),
    );

    return {
      message: 'Inspection requested successfully. An inspector will be assigned soon.',
      data: inspection,
    };
  }

  /**
   * Get pending inspections (Inspector)
   */
  @Get('pending')
  @Roles(UserRole.INSPECTOR)
  @ApiOperation({ summary: 'Get pending inspections (inspector only)' })
  @ApiResponse({ status: 200, description: 'Pending inspections retrieved' })
  async getPendingInspections() {
    const inspections = await this.inspectionsService.getPendingInspections();

    return {
      message: 'Pending inspections retrieved successfully',
      data: inspections,
    };
  }

  /**
   * Get my inspections (Inspector)
   */
  @Get('my-inspections')
  @Roles(UserRole.INSPECTOR)
  @ApiOperation({ summary: 'Get my completed inspections (inspector only)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Inspections retrieved' })
  async getMyInspections(
    @GetUser() inspector: User,
    // @Query('status') status?: string,
  ) {
    const inspections = await this.inspectionsService.getInspectorInspections(
      inspector._id.toString(),
      // status,
    );

    return {
      message: 'Your inspections retrieved successfully',
      data: inspections,
    };
  }

  /**
   * Get inspection by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get inspection report details' })
  @ApiResponse({ status: 200, description: 'Inspection report found' })
  @ApiResponse({ status: 404, description: 'Inspection not found' })
  async getInspection(@Param('id') id: string) {
    const inspection = await this.inspectionsService.getInspectionById(id);

    return {
      message: 'Inspection report retrieved successfully',
      data: inspection,
    };
  }

  /**
   * Get inspection by bicycle ID
   */
  @Get('bicycle/:bicycleId')
  @ApiOperation({ summary: 'Get inspection report for a bicycle' })
  @ApiResponse({ status: 200, description: 'Inspection report found' })
  @ApiResponse({ status: 404, description: 'No inspection report found' })
  async getInspectionByBicycle(@Param('bicycleId') bicycleId: string) {
    const inspection = await this.inspectionsService.getInspectionReport(bicycleId);

    return {
      message: 'Inspection report retrieved successfully',
      data: inspection,
    };
  }

  /**
   * Complete inspection (Inspector)
   */
  @Patch(':id/complete')
  @Roles(UserRole.INSPECTOR)
  @ApiOperation({ summary: 'Complete inspection with report (inspector only)' })
  @ApiResponse({ status: 200, description: 'Inspection completed successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async completeInspection(
    @Param('id') id: string,
    @GetUser() inspector: User,
    @Body() completeInspectionDto: CompleteInspectionDto,
  ) {
    const inspection = await this.inspectionsService.completeInspection(
      id,
      inspector._id.toString(),
      completeInspectionDto,
    );

    return {
      message: 'Inspection completed successfully. Bicycle status updated.',
      data: inspection,
    };
  }

  /**
   * Get all inspections (Admin)
   */
  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all inspections (admin only)' })
  @ApiQuery({ name: 'verdict', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Inspections retrieved' })
  async getAllInspections(
    @Query('verdict') verdict?: InspectionVerdict,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20, 
  ) {
    const result = await this.inspectionsService.getAllInspections(
      verdict,
      page,
      limit,
    );

    return {
      message: 'Inspections retrieved successfully',
      data: result.inspections,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    };
  }

  /**
   * Get inspection statistics (Admin)
   */
  // @Get('admin/statistics')
  // @Roles(UserRole.ADMIN)
  // @ApiOperation({ summary: 'Get inspection statistics (admin only)' })
  // @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  // async getStatistics() {
  //   const stats = await this.inspectionsService.getStatistics();

  //   return {
  //     message: 'Inspection statistics retrieved successfully',
  //     data: stats,
  //   };
  // }
}
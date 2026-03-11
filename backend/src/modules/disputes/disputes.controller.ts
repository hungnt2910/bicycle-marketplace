import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User, UserRole } from '../../entities/user.entity';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { AddEvidenceDto } from './dto/add-evidence.dto';

@ApiTags('Disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  /**
   * Create a new dispute (Buyer)
   */
  @Post()
  @Roles(UserRole.BUYER)
  @ApiOperation({ summary: 'Create a new dispute (buyer only)' })
  @ApiResponse({ status: 201, description: 'Dispute created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid transaction or already disputed',
  })
  async createDispute(
    @GetUser() user: User,
    @Body() createDisputeDto: CreateDisputeDto,
  ) {
    const dispute = await this.disputesService.createDispute(
      user._id.toString(),
      createDisputeDto,
    );

    return {
      message: 'Dispute created successfully. An admin will review your case.',
      data: dispute,
    };
  }

  /**
   * Get all my disputes
   */
  @Get('my-disputes')
  @ApiOperation({ summary: 'Get all my disputes' })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Disputes retrieved successfully' })
  async getMyDisputes(@GetUser() user: User, @Query('status') status?: string) {
    const disputes = await this.disputesService.getMyDisputes(
      user._id.toString(),
      status,
    );

    return {
      message: 'Disputes retrieved successfully',
      data: disputes,
    };
  }

  /**
   * Get dispute by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get dispute details' })
  @ApiResponse({ status: 200, description: 'Dispute found' })
  @ApiResponse({ status: 404, description: 'Dispute not found' })
  async getDispute(
    @Param('id') id: string,
    // @GetUser() user: User,
  ) {
    const dispute = await this.disputesService.getDisputeById(
      id,
      //   user._id.toString(),
    );

    return {
      message: 'Dispute retrieved successfully',
      data: dispute,
    };
  }

  /**
   * Add evidence to dispute (Buyer or Seller)
   */
//   @Patch(':id/evidence')
//   @Roles(UserRole.BUYER, UserRole.SELLER)
//   @ApiOperation({ summary: 'Add additional evidence to dispute' })
//   @ApiResponse({ status: 200, description: 'Evidence added successfully' })
//   async addEvidence(
//     @Param('id') id: string,
//     @GetUser() user: User,
//     @Body() addEvidenceDto: AddEvidenceDto,
//   ) {
//     const dispute = await this.disputesService.addEvidence(
//       id,
//       user._id.toString(),
//       addEvidenceDto,
//     );

//     return {
//       message: 'Evidence added successfully',
//       data: dispute,
//     };
//   }

  /**
   * Inspector adds comparison evidence
   */
  @Patch(':id/inspector-evidence')
  @Roles(UserRole.INSPECTOR)
  @ApiOperation({ summary: 'Add inspector comparison evidence' })
  @ApiResponse({ status: 200, description: 'Inspector evidence added' })
  async addInspectorEvidence(
    @Param('id') id: string,
    @GetUser() inspector: User,
    @Body('comparisonNotes') comparisonNotes: string,
  ) {
    const dispute = await this.disputesService.addInspectorEvidence(
      id,
      inspector._id.toString(),
      comparisonNotes,
    );

    return {
      message: 'Inspector evidence added successfully',
      data: dispute,
    };
  }

  /**
   * Admin assigns dispute to themselves
   */
  @Patch(':id/assign')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign dispute to admin (admin only)' })
  @ApiResponse({ status: 200, description: 'Dispute assigned' })
  async assignDispute(@Param('id') id: string, @GetUser() admin: User) {
    const dispute = await this.disputesService.assignDispute(
      id,
      admin._id.toString(),
    );

    return {
      message: 'Dispute assigned to you',
      data: dispute,
    };
  }

  /**
   * Admin resolves dispute
   */
  @Post(':id/resolve')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve dispute (admin only)' })
  @ApiResponse({ status: 200, description: 'Dispute resolved successfully' })
  async resolveDispute(
    @Param('id') id: string,
    @GetUser() admin: User,
    @Body() resolveDisputeDto: ResolveDisputeDto,
  ) {
    const dispute = await this.disputesService.resolveDispute(
      id,
      admin._id.toString(),
      resolveDisputeDto,
    );

    return {
      message: 'Dispute resolved successfully',
      data: dispute,
    };
  }

  /**
   * Get all disputes (Admin)
   */
  @Get('admin/all')
  @Roles(UserRole.ADMIN, UserRole.INSPECTOR)
  @ApiOperation({ summary: 'Get all disputes (admin, inspector)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Disputes retrieved' })
  async getAllDisputes(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.disputesService.getAllDisputes(
      status,
      page,
      limit,
    );

    return {
      message: 'Disputes retrieved successfully',
      data: result.disputes,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    };
  }
}

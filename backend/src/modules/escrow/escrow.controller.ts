import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EscrowService } from './escrow.service';
import { TransactionsService } from '../transactions/transactions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User, UserRole } from '../../entities/user.entity';

@ApiTags('Escrow (Admin)')
@Controller('escrow')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class EscrowController {
  constructor(
    private readonly escrowService: EscrowService,
    private readonly transactionsService: TransactionsService,
  ) {}

  /**
   * Manually release funds (emergency admin action)
   */
  @Post(':transactionId/release')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually release escrow funds (admin emergency action)' })
  @ApiResponse({ status: 200, description: 'Funds released successfully' })
  async manualRelease(
    @Param('transactionId') transactionId: string,
    @GetUser() admin: User,
    @Body('reason') reason: string,
  ) {
    await this.escrowService.releaseFunds(transactionId);

    return {
      message: 'Funds manually released by admin',
      data: {
        transactionId,
        releasedBy: admin.email,
        reason,
        timestamp: new Date(),
      },
    };
  }

  /**
   * Manually refund (emergency admin action)
   */
  @Post(':transactionId/refund')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually refund escrow funds (admin emergency action)' })
  @ApiResponse({ status: 200, description: 'Funds refunded successfully' })
  async manualRefund(
    @Param('transactionId') transactionId: string,
    @GetUser() admin: User,
    @Body('reason') reason: string,
  ) {
    await this.escrowService.refundFunds(transactionId);

    return {
      message: 'Funds manually refunded by admin',
      data: {
        transactionId,
        refundedBy: admin.email,
        reason,
        timestamp: new Date(),
      },
    };
  }

  /**
   * Get all transactions in escrow
   */
  @Get('held')
  @ApiOperation({ summary: 'Get all transactions held in escrow' })
  @ApiResponse({ status: 200, description: 'Escrow transactions retrieved' })
  async getHeldTransactions() {
    const transactions = await this.transactionsService.getHeldInEscrow();

    return {
      message: 'Escrow transactions retrieved successfully',
      data: transactions,
    };
  }

  /**
   * Get escrow statistics
   */
  @Get('statistics')
  @ApiOperation({ summary: 'Get escrow statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getEscrowStatistics() {
    const stats = await this.transactionsService.getEscrowStatistics();

    return {
      message: 'Escrow statistics retrieved successfully',
      data: stats,
    };
  }
}
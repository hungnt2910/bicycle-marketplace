import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { WalletService, EscrowRole } from './wallet.service';
import { WalletTransactionType } from '../../entities/wallet-transaction.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

class RequestWithdrawalDto {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

class CreateWalletDto {
  userId?: string;
}

@ApiTags('Wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // ---------------------------------------------------------------------------
  // Wallet overview
  // ---------------------------------------------------------------------------

  @Get()
  @ApiOperation({ summary: 'Get current user wallet details' })
  @ApiResponse({ status: 200, description: 'Returns wallet document' })
  async getWallet(@Request() req) {
    return this.walletService.getWallet(req.user.id);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get wallet summary including recent transactions and 30-day stats',
  })
  async getWalletSummary(@Request() req) {
    return this.walletService.getWalletSummary(req.user.id);
  }

  @Get('totals')
  @ApiOperation({
    summary: 'Get wallet balance and total funds currently held in escrow',
    description:
      'Pass `role=buyer` to see funds you paid that are still held, or `role=seller` to see funds owed to you that are still held. Escrow is sourced directly from the Transaction collection (status: HELD_IN_ESCROW).',
  })
  @ApiQuery({
    name: 'role',
    enum: ['buyer', 'seller'],
    required: true,
    description: 'Whether to calculate escrow as a buyer or seller',
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet and escrow totals',
    schema: {
      example: {
        walletBalance: 5000000,
        pendingBalance: 1000000,
        availableBalance: 4000000,
        escrowHeld: 1000000,
        role: 'buyer',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid role — must be buyer or seller' })
  async getEscrowAndWalletTotals(
    @Request() req,
    @Query('role') role: string,
  ) {
    if (role !== 'buyer' && role !== 'seller') {
      throw new BadRequestException('role must be either "buyer" or "seller"');
    }
    return this.walletService.getEscrowAndWalletTotals(req.user.id, role as EscrowRole);
  }

  // ---------------------------------------------------------------------------
  // Transaction history
  // ---------------------------------------------------------------------------

  @Get('transactions')
  @ApiOperation({ summary: 'Get paginated transaction history' })
  @ApiQuery({ name: 'type', enum: WalletTransactionType, required: false })
  @ApiQuery({ name: 'startDate', type: String, required: false, example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', type: String, required: false, example: '2024-12-31' })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 20 })
  async getTransactionHistory(
    @Request() req,
    @Query('type') type?: WalletTransactionType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.walletService.getTransactionHistory(req.user.id, {
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  // ---------------------------------------------------------------------------
  // Withdrawals
  // ---------------------------------------------------------------------------

  @Post('withdraw')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Request a withdrawal to a bank account',
    description: 'Minimum withdrawal amount is 100,000 VND.',
  })
  @ApiResponse({ status: 201, description: 'Withdrawal request created' })
  @ApiResponse({ status: 400, description: 'Insufficient balance or below minimum amount' })
  async requestWithdrawal(
    @Request() req,
    @Body() body: RequestWithdrawalDto,
  ) {
    const { amount, ...bankDetails } = body;
    return this.walletService.requestWithdrawal(req.user.id, amount, bankDetails);
  }
}
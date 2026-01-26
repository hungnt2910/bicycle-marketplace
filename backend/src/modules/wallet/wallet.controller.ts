// src/modules/wallet/wallet.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../../entities/user.entity';
import { WalletTransactionType } from '../../entities/wallet-transaction.entity';

@ApiTags('Wallet')
@Controller('wallet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Get my wallet balance and summary
   */
  @Get()
  @ApiOperation({ summary: 'Get wallet balance and summary' })
  @ApiResponse({ status: 200, description: 'Wallet retrieved successfully' })
  async getMyWallet(@GetUser() user: User) {
    const summary = await this.walletService.getWalletSummary(
      user._id.toString(),
    );

    return {
      message: 'Wallet retrieved successfully',
      data: summary,
    };
  }

  /**
   * Get transaction history
   */
  @Get('transactions')
  @ApiOperation({ summary: 'Get wallet transaction history' })
  @ApiQuery({ name: 'type', required: false, enum: WalletTransactionType })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved' })
  async getTransactionHistory(
    @GetUser() user: User,
    @Query('type') type?: WalletTransactionType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.walletService.getTransactionHistory(
      user._id.toString(),
      { type, page, limit },
    );

    return {
      message: 'Transaction history retrieved successfully',
      data: result.transactions,
      pagination: {
        page: result.page,
        limit: limit || 20,
        total: result.total,
        pages: result.pages,
      },
    };
  }

  /**
   * Request withdrawal
   */
  @Post('withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request withdrawal to bank account' })
  @ApiResponse({ status: 200, description: 'Withdrawal requested successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient balance' })
  async requestWithdrawal(
    @GetUser() user: User,
    @Body('amount') amount: number,
    @Body('bankDetails') bankDetails: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    },
  ) {
    const withdrawal = await this.walletService.requestWithdrawal(
      user._id.toString(),
      amount,
      bankDetails,
    );

    return {
      message: 'Withdrawal requested successfully. Processing may take 1-3 business days.',
      data: withdrawal,
    };
  }
}
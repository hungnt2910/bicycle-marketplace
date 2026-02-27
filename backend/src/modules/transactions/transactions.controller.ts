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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User, UserRole } from '../../entities/user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { ConfirmDeliveryDto } from './dto/confirm-delivery.dto';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Create a new transaction (Buyer places order)
   */
  @Post()
  @Roles(UserRole.BUYER, UserRole.SELLER, UserRole.INSPECTOR)
  @ApiOperation({ summary: 'Create a new transaction (place order)' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bicycle not available or not inspected' })
  async createTransaction(
    @GetUser() user: User,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const transaction = await this.transactionsService.createTransaction(
      user._id.toString(),
      createTransactionDto,
    );

    return {
      message: 'Transaction created successfully. Please proceed to payment.',
      data: transaction,
    };
  }

  /**
   * Get all my transactions (as buyer or seller)
   */
  @Get('my-transactions')
  @ApiOperation({ summary: 'Get all my transactions' })
  @ApiQuery({ name: 'role', enum: ['buyer', 'seller'], required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getMyTransactions(
    @GetUser() user: User,
    @Query('role') role?: 'buyer' | 'seller',
    @Query('status') status?: string,
  ) {
    const transactions = await this.transactionsService.getMyTransactions(
      user._id.toString(),
      role,
      status,
    );

    return {
      message: 'Transactions retrieved successfully',
      data: transactions,
    };
  }

  /**
   * Get transaction by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get transaction details' })
  @ApiResponse({ status: 200, description: 'Transaction found' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(@Param('id') id: string, @GetUser() user: User) {
    const transaction = await this.transactionsService.getTransactionById(
      id,
      user._id.toString(),
    );

    return {
      message: 'Transaction retrieved successfully',
      data: transaction,
    };
  }

  /**
   * Seller updates shipping information
   */
  @Patch(':id/shipping')
  @Roles(UserRole.SELLER)
  @ApiOperation({ summary: 'Update shipping information (seller only)' })
  @ApiResponse({ status: 200, description: 'Shipping information updated' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async updateShipping(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() updateShippingDto: UpdateShippingDto,
  ) {
    const transaction = await this.transactionsService.updateShipping(
      id,
      user._id.toString(),
      updateShippingDto,
    );

    return {
      message: 'Shipping information updated successfully',
      data: transaction,
    };
  }

  /**
   * Mark as delivered (logistics or seller)
   */
  @Patch(':id/delivered')
  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark transaction as delivered' })
  @ApiResponse({ status: 200, description: 'Marked as delivered' })
  async markAsDelivered(@Param('id') id: string) {
    const transaction = await this.transactionsService.markAsDelivered(id);

    return {
      message: 'Transaction marked as delivered',
      data: transaction,
    };
  }

  /**
   * Buyer confirms delivery
   */
  @Post(':id/confirm')
  @Roles(UserRole.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm delivery and release payment (buyer only)' })
  @ApiResponse({ status: 200, description: 'Delivery confirmed, payment released' })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async confirmDelivery(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() confirmDeliveryDto: ConfirmDeliveryDto,
  ) {
    const transaction = await this.transactionsService.confirmDelivery(
      id,
      user._id.toString(),
      confirmDeliveryDto,
    );

    return {
      message: 'Delivery confirmed. Payment has been released to seller.',
      data: transaction,
    };
  }

  /**
   * Cancel transaction (before payment or by admin)
   */
  @Patch(':id/cancel')
  @Roles(UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel transaction' })
  @ApiResponse({ status: 200, description: 'Transaction cancelled' })
  async cancelTransaction(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body('reason') reason?: string,
  ) {
    const transaction = await this.transactionsService.cancelTransaction(
      id,
      user._id.toString(),
      reason,
    );

    return {
      message: 'Transaction cancelled successfully',
      data: transaction,
    };
  }

  /**
   * Get transaction statistics (Admin)
   */
  @Get('admin/statistics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get transaction statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics() {
    const stats = await this.transactionsService.getStatistics();

    return {
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }
}
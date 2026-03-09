import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
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
  ApiBody,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User, UserRole } from '../../entities/user.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { ConfirmDeliveryDto } from './dto/confirm-delivery.dto';
import { TransactionType } from 'src/entities';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // ─────────────────────────────────────────────
  // STANDARD TRANSACTION FLOW
  // ─────────────────────────────────────────────

  /**
   * POST /transactions
   * Buyer places a full-payment order
   */
  @Post()
  @Roles(UserRole.BUYER, UserRole.SELLER)
  @ApiOperation({ summary: 'Create a new transaction (place order)' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bicycle not available or not inspected',
  })
  async createTransaction(
    @GetUser() user: User,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    const data = await this.transactionsService.createTransaction(
      user._id.toString(),
      createTransactionDto,
    );
    return {
      message: 'Transaction created successfully. Please proceed to payment.',
      data,
    };
  }

  @Post('fee')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Pay listing or inspection fee for a bicycle' })
  @ApiResponse({ status: 201, description: 'Fee paid successfully' })
  @ApiResponse({
    status: 400,
    description:
      'Invalid transaction type, insufficient balance, or bicycle not found',
  })
  async payFee(@GetUser() user: User, @Body() body: CreateTransactionDto) {
    if (
      body.type !== TransactionType.FEE &&
      body.type !== TransactionType.INSPECTION_FEE
    ) {
      throw new BadRequestException(
        'type must be either "fee" or "inspection_fee"',
      );
    }

    const result = await this.transactionsService.payFee(user._id.toString(), body);

    return {
      message: 'Fee paid successfully',
      data: result,
    };
  }

  /**
   * POST /transactions/:id/confirm-payment
   * Confirm payment received (called by payment gateway webhook)
   */
  // @Post(':id/confirm-payment')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Confirm payment received and move to escrow' })
  // @ApiResponse({ status: 200, description: 'Payment confirmed, held in escrow' })
  // async confirmPayment(
  //   @Param('id') transactionId: string,
  //   @Body() paymentData: { transactionId: string },
  // ) {
  //   const data = await this.transactionsService.confirmPayment(transactionId, paymentData);
  //   return { message: 'Payment confirmed. Funds are held in escrow.', data };
  // }

  /**
   * PATCH /transactions/:id/shipping
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
    const data = await this.transactionsService.updateShippingAndMarkDelivered(
      id,
      user._id.toString(),
      updateShippingDto,
    );
    return { message: 'Shipping information updated successfully', data };
  }
  // @Patch(':id/shipping')
  // @Roles(UserRole.SELLER)
  // @ApiOperation({ summary: 'Update shipping information (seller only)' })
  // @ApiResponse({ status: 200, description: 'Shipping information updated' })
  // @ApiResponse({ status: 403, description: 'Not authorized' })
  // async updateShipping(
  //   @Param('id') id: string,
  //   @GetUser() user: User,
  //   @Body() updateShippingDto: UpdateShippingDto,
  // ) {
  //   const data = await this.transactionsService.updateShipping(
  //     id,
  //     user._id.toString(),
  //     updateShippingDto,
  //   );
  //   return { message: 'Shipping information updated successfully', data };
  // }

  // /**
  //  * PATCH /transactions/:id/delivered
  //  * Mark transaction as delivered (seller or admin)
  //  */
  // @Patch(':id/delivered')
  // @Roles(UserRole.SELLER, UserRole.ADMIN)
  // @ApiOperation({ summary: 'Mark transaction as delivered' })
  // @ApiResponse({ status: 200, description: 'Marked as delivered' })
  // async markAsDelivered(@Param('id') id: string) {
  //   const data = await this.transactionsService.markAsDelivered(id);
  //   return { message: 'Transaction marked as delivered', data };
  // }

  /**
   * POST /transactions/:id/confirm
   * Buyer confirms delivery and releases escrow to seller
   */
  @Post(':id/confirm')
  @Roles(UserRole.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm delivery and release payment (buyer only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery confirmed, payment released',
  })
  @ApiResponse({ status: 403, description: 'Not authorized' })
  async confirmDelivery(
    @Param('id') id: string,
    @GetUser() user: User,
    @Body() confirmDeliveryDto: ConfirmDeliveryDto,
  ) {
    const data = await this.transactionsService.confirmDelivery(
      id,
      user._id.toString(),
      confirmDeliveryDto,
    );
    return {
      message: 'Delivery confirmed. Payment has been released to seller.',
      data,
    };
  }

  /**
   * PATCH /transactions/:id/cancel
   * Cancel a transaction (buyer, seller, or admin)
   */
  // @Patch(':id/cancel')
  // @Roles(UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN)
  // @ApiOperation({ summary: 'Cancel transaction' })
  // @ApiResponse({ status: 200, description: 'Transaction cancelled' })
  // async cancelTransaction(
  //   @Param('id') id: string,
  //   @GetUser() user: User,
  //   @Body('reason') reason?: string,
  // ) {
  //   const data = await this.transactionsService.cancelTransaction(
  //     id,
  //     user._id.toString(),
  //     reason,
  //   );
  //   return { message: 'Transaction cancelled successfully', data };
  // }

  // ─────────────────────────────────────────────
  // DEPOSIT FLOW
  // ─────────────────────────────────────────────

  /**
   * POST /transactions/deposit
   * Buyer places a deposit (20% default) to reserve a bicycle.
   * Buyer then has 3 days to pay the remaining balance.
   */
  @Post('deposit')
  @Roles(UserRole.BUYER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Place a deposit to reserve a bicycle (buyer only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Deposit initiated, bicycle reserved',
  })
  @ApiResponse({
    status: 400,
    description: 'Bicycle not available or already reserved',
  })
  async createDeposit(@GetUser() user: User, @Body() dto: CreateDepositDto) {
    const data = await this.transactionsService.createDepositTransaction(
      user._id.toString(),
      dto,
    );
    return { message: 'Deposit initiated. Bicycle reserved for 3 days.', data };
  }

  /**
   * POST /transactions/:id/confirm-deposit-payment
   * Confirm deposit payment received from payment gateway
   */
  // @Post(':id/confirm-deposit-payment')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Confirm deposit payment received' })
  // @ApiResponse({ status: 200, description: 'Deposit confirmed, 3-day countdown started' })
  // async confirmDepositPayment(
  //   @Param('id') transactionId: string,
  //   @Body() paymentData: { transactionId: string },
  // ) {
  //   const data = await this.transactionsService.confirmDepositPayment(
  //     transactionId,
  //     paymentData,
  //   );
  //   return {
  //     message: 'Deposit confirmed. You have 3 days to complete the full payment.',
  //     data,
  //   };
  // }

  /**
   * POST /transactions/:id/pay-balance
   * Buyer pays remaining balance within the 3-day window
   */
  @Post(':id/pay-balance')
  @Roles(UserRole.BUYER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pay remaining balance within 3-day window (buyer only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment initiated for remaining balance',
  })
  @ApiResponse({
    status: 400,
    description: 'Deadline passed — deposit forfeited',
  })
  async payRemainingBalance(
    @Param('id') transactionId: string,
    @GetUser() user: User,
  ) {
    const data = await this.transactionsService.payRemainingBalance(
      transactionId,
      user._id.toString(),
    );
    return { message: 'Remaining balance payment initiated.', data };
  }

  /**
   * POST /transactions/:id/confirm-full-payment
   * Confirm full payment received — moves transaction into escrow
   */
  // @Post(':id/confirm-full-payment')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Confirm full payment received and move to escrow' })
  // @ApiResponse({ status: 200, description: 'Full payment confirmed, held in escrow' })
  // async confirmFullPayment(
  //   @Param('id') transactionId: string,
  //   @Body() paymentData: { transactionId: string },
  // ) {
  //   const data = await this.transactionsService.confirmFullPayment(
  //     transactionId,
  //     paymentData,
  //   );
  //   return {
  //     message: 'Full payment confirmed. Funds are held in escrow. Seller will ship shortly.',
  //     data,
  //   };
  // }

  // ─────────────────────────────────────────────
  // QUERIES
  // ─────────────────────────────────────────────

  /**
   * GET /transactions/my-transactions
   * Get all transactions for the current user (buyer or seller)
   */
  @Get('my-transactions')
  @ApiOperation({ summary: 'Get all my transactions' })
  @ApiQuery({ name: 'role', enum: ['buyer', 'seller'], required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
  })
  async getMyTransactions(
    @GetUser() user: User,
    @Query('role') role?: 'buyer' | 'seller',
    @Query('status') status?: string,
  ) {
    const data = await this.transactionsService.getMyTransactions(
      user._id.toString(),
      role,
      status,
    );
    return { message: 'Transactions retrieved successfully', data };
  }

  // ─────────────────────────────────────────────
  // ADMIN
  // ─────────────────────────────────────────────

  /**
   * GET /transactions/admin/statistics
   * Overall transaction statistics
   */
  @Get('admin/statistics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get transaction statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics() {
    const data = await this.transactionsService.getStatistics();
    return { message: 'Statistics retrieved successfully', data };
  }

  /**
   * GET /transactions/admin/escrow
   * All transactions currently held in escrow
   */
  @Get('admin/escrow')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all transactions held in escrow (admin only)' })
  @ApiResponse({ status: 200, description: 'Escrow transactions retrieved' })
  async getHeldInEscrow() {
    const data = await this.transactionsService.getHeldInEscrow();
    return { message: 'Escrow transactions retrieved successfully', data };
  }

  /**
   * GET /transactions/admin/escrow/statistics
   * Escrow-specific statistics
   */
  @Get('admin/escrow/statistics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get escrow statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Escrow statistics retrieved' })
  async getEscrowStatistics() {
    const data = await this.transactionsService.getEscrowStatistics();
    return { message: 'Escrow statistics retrieved successfully', data };
  }

  /**
   * POST /transactions/admin/forfeit/:id
   * Manually forfeit a deposit (admin override)
   */
  @Post('admin/forfeit/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually forfeit a deposit (admin only)' })
  @ApiResponse({ status: 200, description: 'Deposit forfeited' })
  async forfeitDeposit(@Param('id') transactionId: string) {
    const data = await this.transactionsService.forfeitDeposit(transactionId);
    return { message: 'Deposit forfeited. Funds released to seller.', data };
  }

  /**
   * POST /transactions/admin/auto-refund/:id
   * Manually trigger auto-refund for no-shipment
   */
  @Post('admin/auto-refund/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger auto-refund for no-shipment (admin only)' })
  async autoRefundNoShipment(@Param('id') transactionId: string) {
    const data =
      await this.transactionsService.autoRefundNoShipment(transactionId);
    return { message: 'Auto-refund check completed', data };
  }

  /**
   * POST /transactions/admin/auto-confirm/:id
   * Manually trigger auto-confirm for unconfirmed delivery
   */
  @Post('admin/auto-confirm/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Trigger auto-confirm for unconfirmed delivery (admin only)',
  })
  async autoConfirmDelivery(@Param('id') transactionId: string) {
    const data =
      await this.transactionsService.autoConfirmDelivery(transactionId);
    return { message: 'Auto-confirm check completed', data };
  }

  /**
   * POST /transactions/admin/auto-forfeit
   * Manually run the deposit forfeiture scheduler job
   */
  @Post('admin/auto-forfeit')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Run auto-forfeit job for expired deposits (admin only)',
  })
  async autoForfeitExpiredDeposits() {
    await this.transactionsService.autoForfeitExpiredDeposits();
    return { message: 'Auto-forfeit job completed successfully' };
  }

  // ─────────────────────────────────────────────
  // DYNAMIC PARAM ROUTES — must be last
  // ─────────────────────────────────────────────

  /**
   * GET /transactions/:id
   * Get a single transaction (buyer or seller of that transaction only)
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get transaction details' })
  @ApiResponse({ status: 200, description: 'Transaction found' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(@Param('id') id: string, @GetUser() user: User) {
    const data = await this.transactionsService.getTransactionById(
      id,
      user._id.toString(),
    );
    return { message: 'Transaction retrieved successfully', data };
  }
}

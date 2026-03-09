import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { User } from '../../entities/user.entity';
import { Public } from '../../common/decorators/public.decorator';
import { TopUpDto } from './dto/topup-dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Create ZaloPay payment
   */
  @Post('zalopay/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create ZaloPay payment order' })
  @ApiResponse({ status: 200, description: 'Payment URL created' })
  async createZaloPayPayment(
    // @Param('transactionId') transactionId: string,
    @GetUser() user: User,
    @Body() body: TopUpDto,
  ) {
    const result = await this.paymentService.createZaloPayPayment(
      "Payment for user " + user.email,
      user.email,
      user._id.toString(),
      body.amount
    );

    return {
      message: 'ZaloPay payment created successfully',
      data: result,
    };
  }

  /**
   * ZaloPay callback (webhook)
   */
  @Public()
  @Post('zalopay/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ZaloPay callback endpoint' })
  async zaloPayCallback(@Body() body: { data: string; mac: string }) {
    const result = await this.paymentService.handleZaloPayCallback(
      body.data,
      body.mac,
    );

    return result;
  }

  /**
   * Check payment status
   */
  @Public()
  @Get('zalopay/status/:transactionId')
  @ApiOperation({ summary: 'Check ZaloPay payment status' })
  async checkZaloPayStatus(@Param('transactionId') transactionId: string) {
    const result = await this.paymentService.checkZaloPayStatus(transactionId);

    return {
      message: 'Payment status retrieved',
      data: result,
    };
  }
}
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateReviewDto } from './dto/createReview.dto';
import { ReviewsService } from './reviews.service';
import { ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Post('create-review')
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.createReview(createReviewDto);
  }

  @Public()
  @Get('seller-reviews/:sellerId')
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async getReviewsBySeller(@Param('sellerId') sellerId: string) {
    return this.reviewsService.getReviewsBySeller(sellerId);
  }

  @Public()
  @Delete('delete-review/:reviewId')
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async deleteReview(@Param('reviewId') reviewId: string) {
    return this.reviewsService.deleteReview(reviewId);
  }

  @Public()
  @Post('update-review/:reviewId')
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: Partial<CreateReviewDto>,
  ) {
    return this.reviewsService.updateReview(reviewId, updateReviewDto);
  }

  @Public()
  @Get('ratings')
  @ApiResponse({ status: 200, description: 'Ratings retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async getAllRatings() {
    return this.reviewsService.getAllRatings();
  }
}

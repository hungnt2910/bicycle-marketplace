import { SystemSetting } from './../../entities/system-setting.entity';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { CategoriesService } from '../categories/categories.service';

@Controller('system-config')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService, // 👈 thêm
  ) {}

  // ================= CONFIG =================

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Get system config for bicycle posting' })
  @ApiResponse({ status: 200, description: 'Config retrieved successfully' })
  async getConfig() {
    const [
      postFee,
      inspectionFee,
      platformFeePercent,
      depositPercent,
      maxImages,
      maxListings,
    ] = await Promise.all([
      //   this.categoriesService.getPostingFee(),
      this.categoriesService.getPostingFee(),
      this.categoriesService.getInspectionFee(),
      this.categoriesService.getPlatformFeePercent(),
      this.categoriesService.getDepositPercent(),
      this.categoriesService.getMaxImagesPerListing(),
      this.categoriesService.getMaxActiveListingsPerUser(),
    ]);

    return {
      message: 'Config retrieved successfully',
      data: {
        postFee,
        inspectionFee,
        platformFeePercent,
        depositPercent,
        maxImages,
        maxListings,
      },
    };
  }
}

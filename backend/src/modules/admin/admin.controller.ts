import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Public()
  @Post('create-system-config')
  @ApiOperation({ summary: 'Create a new systemSetting listing' })
  @ApiResponse({
    status: 201,
    description: 'SystemSetting successfully created',
  })
  @ApiResponse({ status: 400, description: 'SystemSetting failed to create' })
  async createSystemConfig(@Body() createSystemConfig: any) {
    const result = await this.adminService.createSetting(createSystemConfig);
    return {
      message: 'SystemSetting created successfully',
      data: result,
    };
  }
}

// kieerm soát user, bài đăng, kiểm doanh thu, cấp quyền.

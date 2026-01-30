import { Body, Controller, Patch, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  //-------------------------------------------
  // CRUD category SystemSetting

  @Public()
  @Post('create-field-category')
  @ApiOperation({ summary: 'Create field category' })
  @ApiResponse({ status: 201, description: 'The category has been created.' })
  @ApiResponse({ status: 400, description: 'Title already exists.' })
  async createCategory(@Body('title') title: string) {
    try {
      const result = await this.adminService.createCategory(title);
      return {
        message: 'Category created successfully',
        data: result,
      };
    } catch (error) {
      return {
        message: error.message,
      };
    }
  }
}

// kieerm soát user, bài đăng, kiểm doanh thu, cấp quyền.

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService, SummaryPeriod } from './admin.service';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/entities';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('admin')
// @UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
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

  @Public()
  @Get('field-categories')
  @ApiOperation({ summary: 'Get all field categories' })
  @ApiResponse({ status: 200, description: 'List of field categories.' })
  @ApiResponse({ status: 400, description: 'Cannot get categories.' })
  async getAllCategories() {
    try {
      const result = await this.adminService.getAllCategories();
      return {
        message: 'Categories retrieved successfully',
        data: result,
      };
    } catch (error) {
      return {
        message: 'Cannot get categories',
      };
    }
  }

  @Public()
  @Patch('update-field-category/:id')
  @ApiOperation({ summary: 'Update field category' })
  @ApiResponse({ status: 200, description: 'The category has been updated.' })
  @ApiResponse({ status: 400, description: 'Title already exists.' })
  async updateCategory(@Body('id') id: string, @Body('title') title: string) {
    try {
      const result = await this.adminService.updateCategory(id, title);
      return {
        message: 'Category updated successfully',
        data: result,
      };
    } catch (error) {
      return {
        message: error.message,
      };
    }
  }

  @Public()
  @Delete('delete-field-category/:id')
  @ApiOperation({ summary: 'Delete field category' })
  @ApiResponse({ status: 200, description: 'The category has been deleted.' })
  @ApiResponse({ status: 400, description: 'Cannot delete category.' })
  async deleteCategory(@Param('id') id: string) {
    try {
      const result = await this.adminService.deleteCategory(id);
      return {
        message: 'Category deleted successfully',
        data: result,
      };
    } catch (error) {
      return {
        message: error.message,
      };
    }
  }

  //-------------------------------------------
  // sửa thông số hê thống
  @Public()
  @Post('create-system-setting')
  @ApiOperation({ summary: 'Create system setting' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string' },
        value: { type: 'any' },
        description: { type: 'string' },
        updatedBy: { type: 'string' },
      },
      required: ['key', 'value'],
    },
  })
  @ApiResponse({ status: 201, description: 'The setting has been created.' })
  @ApiResponse({ status: 400, description: 'Cannot create setting.' })
  async createSystemSetting(@Body() data: any) {
    try {
      const result = await this.adminService.createSystemSetting(data);
      return {
        message: 'System setting created successfully',
        data: result,
      };
    } catch (error) {
      return {
        message: error.message,
      };
    }
  }

  @Public()
  @Patch('system-setting-update')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: { type: 'string' },
        value: { type: 'any' },
        description: { type: 'string' },
        updatedBy: { type: 'string' },
      },
      required: ['key', 'value'],
    },
  })
  @ApiOperation({ summary: 'Update system setting' })
  @ApiResponse({ status: 200, description: 'The setting has been updated.' })
  @ApiResponse({ status: 400, description: 'Cannot update setting.' })
  async updateSystemSetting(@Body() dataUpdate: any) {
    try {
      const result = await this.adminService.updateSystemSetting(dataUpdate);
      return {
        message: 'System setting updated successfully',
        data: result,
      };
    } catch (error) {
      return {
        message: error.message,
      };
    }
  }

  @Public()
  @Get('system-settings')
  @ApiOperation({ summary: 'Get all system settings' })
  @ApiResponse({ status: 200, description: 'List of system settings.' })
  @ApiResponse({ status: 400, description: 'Cannot get settings.' })
  async getAllSystemSettings() {
    try {
      const result = await this.adminService.getAllSystemSettings();
      return {
        message: 'System settings retrieved successfully',
        data: result.map((setting) => setting.name_value),
      };
    } catch (error) {
      return {
        message: 'Cannot get system settings',
      };
    }
  }

  @Public()
  @Delete('system-setting/:key')
  @ApiOperation({ summary: 'Delete system setting' })
  @ApiResponse({ status: 200, description: 'The setting has been deleted.' })
  @ApiResponse({ status: 400, description: 'Cannot delete setting.' })
  async deleteSystemSetting(@Param('key') key: string) {
    try {
      const result = await this.adminService.deleteSystemSetting(key);
      return {
        message: 'System setting deleted successfully',
        data: result,
      };
    } catch (error) {
      return {
        message: error.message,
      };
    }
  }

  // ─── admin.controller.ts ──────────────────────────────────────────────────────

  @Get('revenue/summary')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get platform money in/out summary by period' })
  @ApiQuery({
    name: 'period',
    enum: ['7d', '30d', '12m'],
    required: true,
    description: '7d = last 7 days, 30d = last 30 days, 12m = last 12 months',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        period: '30d',
        from: '2024-11-01T00:00:00.000Z',
        to: '2024-12-01T00:00:00.000Z',
        totalIn: 50000000,
        totalOut: 5000000,
        net: 45000000,
        breakdown: [
          { type: 'full_payment', direction: 'in', total: 30000000, count: 10 },
          { type: 'deposit', direction: 'in', total: 15000000, count: 8 },
          { type: 'fee', direction: 'in', total: 3000000, count: 6 },
          { type: 'inspection_fee', direction: 'in', total: 2000000, count: 4 },
          { type: 'refund', direction: 'out', total: 4000000, count: 2 },
          {
            type: 'dispute_refund',
            direction: 'out',
            total: 1000000,
            count: 1,
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid period value' })
  async getMoneyFlowSummary(@Query('period') period: string) {
    if (!['7d', '30d', '12m'].includes(period)) {
      throw new BadRequestException('period must be one of: 7d, 30d, 12m');
    }

    return this.adminService.getMoneyFlowSummary(period as SummaryPeriod);
  }
}
// kieerm soát user, bài đăng, kiểm doanh thu, cấp quyền.

import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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
  @Post('system-setting')
  @ApiOperation({ summary: 'Create system setting' })
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
        data: result,
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
}
// kieerm soát user, bài đăng, kiểm doanh thu, cấp quyền.

import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiBody } from '@nestjs/swagger';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  //upload image cho xe đạp của người bán, up được cả video
  @Public()
  @Post('upload-image/:seller')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    description:
      'seller thì để seller, inspector thì để inspector trên api. Truyền form data với key là file và value là file ảnh/video cần upload',
    type: 'multipart/form-data',
    required: true,
  })
  async uploadForSeller(
    @UploadedFile() file: Express.Multer.File,
    @Param('seller') seller: string,
  ) {
    const result = await this.cloudinaryService.uploadFile(file, seller);
    return {
      message: 'Image uploaded successfully',
      data: result,
    };
  }

  @Public()
  @Post('upload-image/:inspector')
  @UseInterceptors(FileInterceptor('file'))
  //mô tả API cho Swagger
  @ApiBody({
    description:
      'seller thì để seller, inspector thì để inspector trên api. Truyền form data với key là file và value là file ảnh/video cần upload',
    type: 'multipart/form-data',
    required: true,
  })
  async uploadForInspector(
    @UploadedFile() file: Express.Multer.File,
    @Param('inspector') inspector: string,
  ) {
    const result = await this.cloudinaryService.uploadFile(file, inspector);
    return {
      message: 'Image uploaded successfully',
      data: result,
    };
  }
}

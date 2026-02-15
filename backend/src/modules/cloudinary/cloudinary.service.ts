import { Injectable, Inject } from '@nestjs/common';
import { v2 as Cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof Cloudinary) {}

  // Upload IMAGE chưa check trùng hình
  async uploadFile(file: Express.Multer.File, folder: string) {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto', // image | video auto detect
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  // Move / rename
  async move(
    publicId: string,
    newFolder: string,
    resourceType: 'image' | 'video' = 'image',
  ) {
    const filename = publicId.split('/').pop();

    return await this.cloudinary.uploader.rename(
      publicId,
      `${newFolder}/${filename}`,
      { resource_type: resourceType },
    );
  }

  // 🗑️ Delete
  async delete(publicId: string, resourceType: 'image' | 'video' = 'image') {
    return await this.cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }

  // List resources (cleanup)
  async list(prefix: string, resourceType: 'image' | 'video' = 'image') {
    return await this.cloudinary.api.resources({
      type: 'upload',
      prefix,
      resource_type: resourceType,
      max_results: 100,
    });
  }
}

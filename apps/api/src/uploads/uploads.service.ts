import { BadRequestException, Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  type UploadApiErrorResponse,
  type UploadApiResponse,
} from 'cloudinary';
import { Readable } from 'node:stream';

type StorageDriver = 'cloudinary' | 'local';

@Injectable()
export class UploadsService {
  constructor(private readonly configService: ConfigService) {
    if (this.storageDriver === 'cloudinary') {
      cloudinary.config({
        cloud_name: this.configService.getOrThrow<string>(
          'CLOUDINARY_CLOUD_NAME',
        ),

        api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),

        api_secret: this.configService.getOrThrow<string>(
          'CLOUDINARY_API_SECRET',
        ),
      });
    }
  }

  private get storageDriver(): StorageDriver {
    const value =
      this.configService.get<string>('STORAGE_DRIVER') ?? 'cloudinary';

    if (value !== 'cloudinary' && value !== 'local') {
      throw new Error(`Unsupported STORAGE_DRIVER: ${value}`);
    }

    return value;
  }

  private validateImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Product image is required.');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, PNG, and WEBP images are allowed.',
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('Product image must not exceed 5 MB.');
    }
  }

  async uploadProductImage(file: Express.Multer.File, organizationId: string) {
    this.validateImage(file);

    if (this.storageDriver === 'local') {
      throw new BadRequestException(
        'Product image upload is currently configured for Cloudinary storage.',
      );
    }

    const result = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolvePromise, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `cofflo/products/${organizationId}`,
          resource_type: 'image',

          transformation: [
            {
              width: 1200,
              height: 1200,
              crop: 'limit',
            },
            {
              quality: 'auto',
              fetch_format: 'auto',
            },
          ],
        },

        (error, uploadResult) => {
          if (error) {
            reject(new Error(error.message || 'Product image upload failed.'));

            return;
          }

          if (!uploadResult) {
            reject(new Error('Product image upload failed.'));

            return;
          }

          resolvePromise({
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
          });
        },
      );

      Readable.from(file.buffer).pipe(stream);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  async uploadTableImage(file: Express.Multer.File, organizationId: string) {
    this.validateImage(file);

    if (this.storageDriver !== 'cloudinary') {
      throw new BadRequestException(
        'Table image upload requires Cloudinary storage.',
      );
    }

    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `cofflo/tables/${organizationId}`,
          resource_type: 'image',
          transformation: [
            {
              width: 1200,
              height: 1200,
              crop: 'limit',
            },
          ],
          quality: 'auto',
          fetch_format: 'auto',
        },
        (
          error: UploadApiErrorResponse | undefined,
          uploadResult: UploadApiResponse | undefined,
        ) => {
          if (error || !uploadResult) {
            reject(error ?? new Error('Table image upload failed.'));
            return;
          }

          resolve({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadProfileImage(file: Express.Multer.File, userId: string) {
    this.validateImage(file);

    if (this.storageDriver !== 'cloudinary') {
      throw new BadRequestException(
        'Profile image upload requires Cloudinary storage.',
      );
    }

    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `cofflo/users/${userId}`,
          resource_type: 'image',
          transformation: [
            {
              width: 600,
              height: 600,
              crop: 'fill',
              gravity: 'face',
            },
          ],
          quality: 'auto',
          fetch_format: 'auto',
        },
        (
          error: UploadApiErrorResponse | undefined,
          uploadResult: UploadApiResponse | undefined,
        ) => {
          if (error || !uploadResult) {
            reject(error ?? new Error('Profile image upload failed.'));
            return;
          }

          resolve({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string) {
    if (this.storageDriver !== 'cloudinary') {
      return;
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
  }
}

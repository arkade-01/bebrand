/* eslint-disable */
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as multer from 'multer';
import { Multer } from 'multer';

@Injectable()
export class UploadService {
  private isEnabled = false;

  constructor(private configService: ConfigService) {
    const publicKey = this.configService.get<string>('IMAGEKIT_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('IMAGEKIT_PRIVATE_KEY');
    const urlEndpoint = this.configService.get<string>('IMAGEKIT_URL');

    if (!publicKey || !privateKey || !urlEndpoint) {
      console.warn(
        'ImageKit credentials not configured. Upload service is disabled.',
      );
      this.isEnabled = false;
      return;
    }

    this.isEnabled = true;
    console.log('ImageKit service would be initialized here');
  }

  getMulterConfig() {
    const storage = multer.memoryStorage();

    const fileFilter = (
      req: any,
      file: Multer.File,
      cb: multer.FileFilterCallback,
    ) => {
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    };

    return {
      storage,
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
    };
  }

  async uploadToImageKit(
    file: Multer.File,
    folder: string = 'products',
  ): Promise<{
    fileId: string;
    url: string;
    thumbnailUrl: string;
    name: string;
    size: number;
  }> {
    if (!this.isEnabled) {
      throw new BadRequestException(
        'Upload service is disabled. ImageKit credentials not configured.',
      );
    }

    throw new BadRequestException('ImageKit upload not implemented yet');
  }

  async deleteFromImageKit(fileId: string): Promise<void> {
    if (!this.isEnabled) {
      return;
    }
    // Silently handle delete errors
  }

  getThumbnailUrl(
    fileId: string,
    width: number = 300,
    height: number = 300,
  ): string {
    const baseUrl = this.configService.get<string>('IMAGEKIT_URL') || '';
    return baseUrl ? `${baseUrl}/${fileId}` : '';
  }

  getOptimizedUrl(
    fileId: string,
    width?: number,
    height?: number,
    quality: number = 80,
  ): string {
    const baseUrl = this.configService.get<string>('IMAGEKIT_URL') || '';
    return baseUrl ? `${baseUrl}/${fileId}` : '';
  }

  getAuthenticationParameters(): {
    token: string;
    expire: number;
    signature: string;
  } {
    return {
      token: '',
      expire: 0,
      signature: '',
    };
  }
}

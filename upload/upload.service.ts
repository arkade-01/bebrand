import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as multer from 'multer';
import { Multer } from 'multer';
import ImageKit, { toFile } from '@imagekit/nodejs';

@Injectable()
export class UploadService {
  private imagekit: ImageKit;

  constructor(private configService: ConfigService) {
    const publicKey = this.configService.get<string>('IMAGEKIT_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('IMAGEKIT_PRIVATE_KEY');
    const urlEndpoint = this.configService.get<string>('IMAGEKIT_URL');
    
    if (!publicKey) throw new Error('IMAGEKIT_PUBLIC_KEY not set');
    if (!privateKey) throw new Error('IMAGEKIT_PRIVATE_KEY not set');
    if (!urlEndpoint) throw new Error('IMAGEKIT_URL not set');


    this.imagekit = new ImageKit({
      privateKey,
    });
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
    try {
      // Check if file buffer exists
      if (!file.buffer) {
        throw new BadRequestException('File buffer is missing');
      }

      const uploadResponse = await this.imagekit.files.upload({
        file: await toFile(file.buffer, file.originalname),
        fileName: `${Date.now()}-${file.originalname}`,
        folder: folder,
        useUniqueFileName: true,
        tags: ['product-image'],
      });

      if (!uploadResponse?.fileId || !uploadResponse?.url || !uploadResponse?.name) {
        throw new BadRequestException('Invalid response from ImageKit upload');
      }

      return {
        fileId: uploadResponse.fileId,
        url: uploadResponse.url,
        thumbnailUrl: this.getThumbnailUrl(uploadResponse.fileId),
        name: uploadResponse.name,
        size: file.size,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload image to ImageKit: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async deleteFromImageKit(fileId: string): Promise<void> {
    try {
      await this.imagekit.files.delete(fileId);
    } catch (error) {
      // Silently handle delete errors
    }
  }

  getThumbnailUrl(
    fileId: string,
    width: number = 300,
    height: number = 300,
  ): string {
    const baseUrl = this.configService.get<string>('IMAGEKIT_URL');
    const transformation = `tr:w-${width},h-${height},c-maintain_ratio`;
    return `${baseUrl}/${fileId}?tr=${transformation}`;
  }

  getOptimizedUrl(
    fileId: string,
    width?: number,
    height?: number,
    quality: number = 80,
  ): string {
    const baseUrl = this.configService.get<string>('IMAGEKIT_URL');
    let transformation = `tr:q-${quality}`;
    
    if (width) transformation += `,w-${width}`;
    if (height) transformation += `,h-${height}`;

    return `${baseUrl}/${fileId}?tr=${transformation}`;
  }

  // Get authentication parameters for client-side uploads
  getAuthenticationParameters(): {
    token: string;
    expire: number;
    signature: string;
  } {
    // For now, return empty values since the new API structure is different
    // This method might need to be reimplemented based on the new ImageKit API
    return {
      token: '',
      expire: 0,
      signature: '',
    };
  }
}

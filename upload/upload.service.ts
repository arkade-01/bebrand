/* eslint-disable */
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as multer from 'multer';
import ImageKit from 'imagekit';
import sharp from 'sharp';

type MulterFile = Express.Multer.File;

@Injectable()
export class UploadService {
  private isEnabled = false;
  private imagekit: ImageKit;

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

    this.imagekit = new ImageKit({
      publicKey: publicKey,
      privateKey: privateKey,
      urlEndpoint: urlEndpoint,
    });

    this.isEnabled = true;
    console.log('ImageKit service initialized successfully');
  }

  getMulterConfig() {
    const storage = multer.memoryStorage();

    const fileFilter = (
      req: any,
      file: MulterFile,
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
    file: MulterFile,
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

    try {
      // Process image to make it square
      const processedImageBuffer = await this.makeImageSquare(file.buffer);

      // Generate a unique filename
      const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

      // Upload to ImageKit
      const uploadResponse = await this.imagekit.upload({
        file: processedImageBuffer,
        fileName: fileName,
        folder: folder,
        useUniqueFileName: true,
        tags: ['square', 'processed'],
      });

      return {
        fileId: uploadResponse.fileId,
        url: uploadResponse.url,
        thumbnailUrl: uploadResponse.thumbnailUrl,
        name: uploadResponse.name,
        size: uploadResponse.size,
      };
    } catch (error) {
      console.error('ImageKit upload error:', error);
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Processes an image to make it square by adding padding or cropping
   * @param imageBuffer - The original image buffer
   * @returns Promise<Buffer> - The processed square image buffer
   */
  private async makeImageSquare(imageBuffer: Buffer): Promise<Buffer> {
    try {
      // Get image metadata
      const metadata = await sharp(imageBuffer).metadata();
      const { width, height } = metadata;

      // Determine the size for the square (use the larger dimension)
      const size = Math.max(width, height);

      // Resize and add padding to make it square
      // Using 'contain' will fit the image within the square and add padding
      const squareImage = await sharp(imageBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background
        })
        .toBuffer();

      return squareImage;
    } catch (error) {
      console.error('Image processing error:', error);
      throw new BadRequestException(
        `Failed to process image: ${error.message}`,
      );
    }
  }

  async deleteFromImageKit(fileId: string): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      await this.imagekit.deleteFile(fileId);
      console.log(`File ${fileId} deleted successfully from ImageKit`);
    } catch (error) {
      console.error('ImageKit delete error:', error);
      // Silently handle delete errors as per original implementation
    }
  }

  getThumbnailUrl(
    fileId: string,
    width: number = 300,
    height: number = 300,
  ): string {
    if (!this.isEnabled) {
      return '';
    }

    const baseUrl = this.configService.get<string>('IMAGEKIT_URL') || '';
    return baseUrl ? `${baseUrl}/tr:w-${width},h-${height}/${fileId}` : '';
  }

  getOptimizedUrl(
    fileId: string,
    width?: number,
    height?: number,
    quality: number = 80,
  ): string {
    if (!this.isEnabled) {
      return '';
    }

    const baseUrl = this.configService.get<string>('IMAGEKIT_URL') || '';
    let transformations = `q-${quality}`;

    if (width) transformations += `,w-${width}`;
    if (height) transformations += `,h-${height}`;

    return baseUrl ? `${baseUrl}/tr:${transformations}/${fileId}` : '';
  }

  getAuthenticationParameters(): {
    token: string;
    expire: number;
    signature: string;
  } {
    if (!this.isEnabled) {
      return {
        token: '',
        expire: 0,
        signature: '',
      };
    }

    try {
      const authParams = this.imagekit.getAuthenticationParameters();
      return authParams;
    } catch (error) {
      console.error('Error generating auth parameters:', error);
      return {
        token: '',
        expire: 0,
        signature: '',
      };
    }
  }
}

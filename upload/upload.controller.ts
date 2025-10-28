import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Multer } from 'multer';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('upload')
@UseGuards(RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Multer.File,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const uploadResult = await this.uploadService.uploadToImageKit(
      file,
      folder,
    );

    return {
      fileId: uploadResult.fileId,
      url: uploadResult.url,
      thumbnailUrl: uploadResult.thumbnailUrl,
      name: uploadResult.name,
      originalName: file.originalname,
      size: uploadResult.size,
      mimetype: file.mimetype,
    };
  }

  @Get('auth-params')
  getAuthenticationParameters() {
    // Note: This endpoint is temporarily disabled due to ImageKit API changes
    return {
      message: 'Authentication parameters endpoint is temporarily unavailable',
      note: 'Direct server-side uploads are still supported',
    };
  }

  @Post('delete')
  async deleteImage(@Query('fileId') fileId: string) {
    if (!fileId) {
      throw new BadRequestException('File ID is required');
    }

    await this.uploadService.deleteFromImageKit(fileId);
    return { message: 'Image deleted successfully' };
  }
}

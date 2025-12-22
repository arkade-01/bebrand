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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { RolesGuard } from 'src/common/guards/roles.guard';

type MulterFile = Express.Multer.File;

@ApiTags('Upload')
@ApiBearerAuth('JWT-auth')
@Controller('upload')
@UseGuards(RolesGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Upload an image with automatic square conversion',
    description: `
Upload an image file to ImageKit with automatic square conversion.

**Features:**
- Automatically converts images to square format with white padding
- Maintains original aspect ratio
- Supports JPEG, PNG, GIF, WebP formats
- Maximum file size: 10MB
- Images are stored in ImageKit CDN

**Flow:**
1. Select an image file
2. POST to this endpoint with the image in form-data
3. Image is processed and converted to square
4. Image is uploaded to ImageKit
5. Response contains URL, thumbnail URL, and file ID
    `,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
      },
      required: ['image'],
    },
  })
  @ApiQuery({
    name: 'folder',
    required: false,
    type: String,
    description: 'Target folder in ImageKit (default: products)',
    example: 'products',
  })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        fileId: { type: 'string', example: '6abc123def456789' },
        url: {
          type: 'string',
          example: 'https://ik.imagekit.io/0fxgodyu4/products/image.jpg',
        },
        thumbnailUrl: {
          type: 'string',
          example:
            'https://ik.imagekit.io/0fxgodyu4/tr:n-media_library_thumbnail/products/image.jpg',
        },
        name: { type: 'string', example: '1703265432123-image.jpg' },
        originalName: { type: 'string', example: 'image.jpg' },
        size: { type: 'number', example: 245678 },
        mimetype: { type: 'string', example: 'image/jpeg' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid file or missing file',
  })
  async uploadImage(
    @UploadedFile() file: MulterFile,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      originalName: file.originalname,
      size: uploadResult.size,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      mimetype: file.mimetype,
    };
  }

  @Get('auth-params')
  @ApiOperation({
    summary: 'Get ImageKit authentication parameters',
    description: `
Get authentication parameters for client-side uploads to ImageKit.

Returns token, expire timestamp, and signature needed for direct client uploads.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication parameters retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
        expire: { type: 'number' },
        signature: { type: 'string' },
      },
    },
  })
  getAuthenticationParameters() {
    const authParams = this.uploadService.getAuthenticationParameters();

    if (!authParams.token) {
      return {
        message:
          'ImageKit service is not configured or temporarily unavailable',
        note: 'Direct server-side uploads are still supported',
      };
    }

    return authParams;
  }

  @Post('delete')
  @ApiOperation({
    summary: 'Delete an image from ImageKit',
    description: 'Delete an uploaded image using its file ID.',
  })
  @ApiQuery({
    name: 'fileId',
    required: true,
    type: String,
    description: 'ImageKit file ID to delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - File ID required',
  })
  async deleteImage(@Query('fileId') fileId: string) {
    if (!fileId) {
      throw new BadRequestException('File ID is required');
    }

    await this.uploadService.deleteFromImageKit(fileId);
    return { message: 'Image deleted successfully' };
  }
}

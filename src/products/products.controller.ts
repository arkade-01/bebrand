import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiProperty,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { UploadService } from '../../upload/upload.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new product with image (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() image?: Multer.File,
  ) {

    let imageData: any = null;
    
    if (image) {
      // Validate file type
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimes.includes(image.mimetype)) {
        throw new BadRequestException('Only image files are allowed');
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (image.size > maxSize) {
        throw new BadRequestException('File size exceeds 10MB limit');
      }

      imageData = await this.uploadService.uploadToImageKit(image, 'products');
    }

    return this.productsService.create(createProductDto, imageData);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'Returns all products',
  })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the product',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a product with optional image (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() image?: Multer.File,
  ) {
    let imageData: any = null;
    
    if (image) {
      // Validate file type
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedMimes.includes(image.mimetype)) {
        throw new BadRequestException('Only image files are allowed');
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (image.size > maxSize) {
        throw new BadRequestException('File size exceeds 10MB limit');
      }

      imageData = await this.uploadService.uploadToImageKit(image, 'products');
    }

    return this.productsService.update(id, updateProductDto, imageData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

}

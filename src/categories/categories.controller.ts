import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@ApiTags('Categories')
@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Mendapatkan semua kategori barang (Publik/Semua Role)' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Mendapatkan detail kategori berdasarkan ID' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PETUGAS)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Menambah kategori baru (Khusus Petugas & Admin)' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PETUGAS)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Mengedit kategori (Khusus Petugas & Admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PETUGAS)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus kategori (Khusus Petugas & Admin)' })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}

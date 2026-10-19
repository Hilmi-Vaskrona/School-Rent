import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto, QueryItemsDto, UpdateItemDto } from './dto/items.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Public } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@ApiTags('Items & Facilities')
@Controller('api/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Mendapatkan daftar barang dengan fitur pencarian dan filter (Publik/Siswa)',
  })
  async findAll(@Query() query: QueryItemsDto) {
    return this.itemsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Melihat detail spesifikasi dan ketersediaan barang' })
  async findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PETUGAS)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Menambahkan barang inventaris baru (Khusus Petugas & Admin)' })
  async create(@Body() dto: CreateItemDto) {
    return this.itemsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PETUGAS)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Mengedit data barang atau stok (Khusus Petugas & Admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.itemsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PETUGAS)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Menghapus barang inventaris (Khusus Petugas & Admin)' })
  async remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }
}

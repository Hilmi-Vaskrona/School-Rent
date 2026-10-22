import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemCondition, ItemStatus } from '../../common/enums/app.enums';
import { UUID_REGEX } from '../../common/constants/app.constants';

export class CreateItemDto {
  @ApiProperty({ example: 'd0000000-0000-0000-0000-000000000001', description: 'ID Kategori' })
  @Matches(UUID_REGEX, { message: 'ID Kategori harus UUID yang valid' })
  @IsNotEmpty({ message: 'Kategori barang harus dipilih' })
  category_id: string;

  @ApiProperty({ example: 'BRG-ELK-001', description: 'Kode inventaris barang unik' })
  @IsString()
  @IsNotEmpty({ message: 'Kode barang tidak boleh kosong' })
  code: string;

  @ApiProperty({ example: 'Proyektor Epson EB-X500', description: 'Nama barang' })
  @IsString()
  @IsNotEmpty({ message: 'Nama barang tidak boleh kosong' })
  name: string;

  @ApiPropertyOptional({ example: 'Proyektor 3600 lumens port HDMI VGA', description: 'Deskripsi lengkap barang' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.example.com/projector.jpg', description: 'URL foto barang' })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({ example: 5, description: 'Total stok barang' })
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Total stok minimal 0' })
  total_stock: number;

  @ApiPropertyOptional({ example: 5, description: 'Stok yang dapat dipinjam saat ini' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Stok tersedia minimal 0' })
  available_stock?: number;

  @ApiPropertyOptional({ enum: ItemCondition, default: ItemCondition.BAIK })
  @IsOptional()
  @IsEnum(ItemCondition)
  condition?: ItemCondition;

  @ApiPropertyOptional({ enum: ItemStatus, default: ItemStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;
}

export class UpdateItemDto {
  @ApiPropertyOptional({ example: 'd0000000-0000-0000-0000-000000000001' })
  @IsOptional()
  @Matches(UUID_REGEX, { message: 'ID Kategori harus UUID yang valid' })
  category_id?: string;

  @ApiPropertyOptional({ example: 'BRG-ELK-001' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Proyektor Epson EB-X500' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Deskripsi yang diperbarui' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://images.example.com/new-photo.jpg' })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  total_stock?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  available_stock?: number;

  @ApiPropertyOptional({ enum: ItemCondition })
  @IsOptional()
  @IsEnum(ItemCondition)
  condition?: ItemCondition;

  @ApiPropertyOptional({ enum: ItemStatus })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;
}

export class QueryItemsDto {
  @ApiPropertyOptional({ description: 'Pencarian nama, kode, atau deskripsi barang' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan ID kategori' })
  @IsOptional()
  @Matches(UUID_REGEX, { message: 'category_id harus berupa UUID yang valid' })
  category_id?: string;

  @ApiPropertyOptional({ enum: ItemCondition, description: 'Filter berdasarkan kondisi' })
  @IsOptional()
  @IsEnum(ItemCondition)
  condition?: ItemCondition;

  @ApiPropertyOptional({ enum: ItemStatus, description: 'Filter berdasarkan status barang' })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  @ApiPropertyOptional({ description: 'Hanya tampilkan barang yang stoknya tersedia (true/false)' })
  @IsOptional()
  only_available?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 12, default: 12 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

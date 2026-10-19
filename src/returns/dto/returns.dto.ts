import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemCondition } from '../../common/enums/app.enums';

export class ProcessReturnDto {
  @ApiProperty({ example: 'a123e456-e89b-12d3-a456-426614174000', description: 'ID Transaksi Peminjaman (Loans)' })
  @IsUUID('4', { message: 'ID peminjaman harus berupa UUID valid' })
  @IsNotEmpty({ message: 'ID peminjaman wajib diisi' })
  loan_id: string;

  @ApiProperty({
    enum: ItemCondition,
    example: ItemCondition.BAIK,
    description: 'Kondisi barang saat dikembalikan',
  })
  @IsEnum(ItemCondition, { message: 'Kondisi barang harus BAIK, RUSAK_RINGAN, RUSAK_BERAT, atau HILANG' })
  @IsNotEmpty({ message: 'Kondisi barang wajib diperiksa petugas' })
  item_condition: ItemCondition;

  @ApiPropertyOptional({ example: 'Lensa sedikit berdebu tetapi berfungsi normal', description: 'Catatan kondisi / kerusakan jika ada' })
  @IsOptional()
  @IsString()
  damage_notes?: string;

  @ApiPropertyOptional({ example: 'Dikembalikan lengkap dengan tas dan kabel charger', description: 'Catatan umum pengembalian' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueryReturnsDto {
  @ApiPropertyOptional({ description: 'Filter berdasarkan ID peminjam' })
  @IsOptional()
  @IsUUID('4')
  user_id?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

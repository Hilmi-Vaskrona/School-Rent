import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemCondition } from '../../common/enums/app.enums';
import { UUID_REGEX } from '../../common/constants/app.constants';

export class ProcessReturnDto {
  @ApiProperty({ example: 'a123e456-e89b-12d3-a456-426614174000', description: 'ID Transaksi Peminjaman (Loans)' })
  @Matches(UUID_REGEX, { message: 'ID peminjaman harus berupa UUID valid' })
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
  @Matches(UUID_REGEX, { message: 'user_id harus berupa UUID yang valid' })
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

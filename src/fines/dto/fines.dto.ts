import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { FineStatus } from '../../common/enums/app.enums';
import { UUID_REGEX } from '../../common/constants/app.constants';

export class PayFineDto {
  @ApiPropertyOptional({ example: 'Dibayar tunai di ruang sarpras', description: 'Catatan pembayaran denda' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class WaiveFineDto {
  @ApiPropertyOptional({ example: 'Keringanan denda atas izin kepala sekolah', description: 'Alasan pembebasan denda' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class QueryFinesDto {
  @ApiPropertyOptional({ enum: FineStatus, description: 'Filter status denda (UNPAID, PAID, WAIVED)' })
  @IsOptional()
  @IsEnum(FineStatus)
  status?: FineStatus;

  @ApiPropertyOptional({ description: 'Filter berdasarkan ID pengguna peminjam' })
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

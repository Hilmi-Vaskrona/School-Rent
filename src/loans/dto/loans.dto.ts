import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LoanStatus } from '../../common/enums/app.enums';
import { UUID_REGEX } from '../../common/constants/app.constants';

export class CreateLoanDto {
  @ApiProperty({ example: 'e0000000-0000-0000-0000-000000000001', description: 'ID Barang yang dipinjam' })
  @Matches(UUID_REGEX, { message: 'ID Barang harus UUID yang valid' })
  @IsNotEmpty({ message: 'Barang yang ingin dipinjam harus dipilih' })
  item_id: string;

  @ApiProperty({ example: 1, description: 'Jumlah barang yang dipinjam', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Jumlah peminjaman minimal 1' })
  quantity: number;

  @ApiProperty({ example: '2026-10-20', description: 'Tanggal mulai meminjam (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Format tanggal peminjaman harus YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Tanggal peminjaman wajib diisi' })
  borrow_date: string;

  @ApiProperty({ example: '2026-10-22', description: 'Tanggal jatuh tempo / batas kembali (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'Format tanggal jatuh tempo harus YYYY-MM-DD' })
  @IsNotEmpty({ message: 'Tanggal jatuh tempo wajib diisi' })
  due_date: string;

  @ApiProperty({ example: 'Presentasi tugas akhir kelompok di ruang multimedia', description: 'Keperluan peminjaman' })
  @IsString()
  @IsNotEmpty({ message: 'Keperluan peminjaman wajib diisi' })
  purpose: string;

  @ApiPropertyOptional({ example: 'Mohon dicek kondisi kabel HDMI-nya', description: 'Catatan tambahan' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectLoanDto {
  @ApiProperty({ example: 'Barang sedang diperlukan untuk ujian sekolah', description: 'Alasan penolakan' })
  @IsString()
  @IsNotEmpty({ message: 'Alasan penolakan harus diisi' })
  rejection_reason: string;
}

export class CancelLoanDto {
  @ApiPropertyOptional({ example: 'Acara dibatalkan', description: 'Alasan pembatalan oleh siswa' })
  @IsOptional()
  @IsString()
  cancellation_reason?: string;
}

export class QueryLoansDto {
  @ApiPropertyOptional({ enum: LoanStatus, description: 'Filter status peminjaman' })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;

  @ApiPropertyOptional({ description: 'Filter berdasarkan ID barang' })
  @IsOptional()
  @Matches(UUID_REGEX, { message: 'item_id harus berupa UUID yang valid' })
  item_id?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan ID pengguna peminjam (Khusus Petugas & Admin)' })
  @IsOptional()
  @Matches(UUID_REGEX, { message: 'user_id harus berupa UUID yang valid' })
  user_id?: string;

  @ApiPropertyOptional({ description: 'Pencarian kode peminjaman atau keperluan' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

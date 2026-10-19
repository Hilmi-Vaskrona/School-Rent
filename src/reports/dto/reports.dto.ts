import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { LoanStatus } from '../../common/enums/app.enums';

export class ReportFilterDto {
  @ApiPropertyOptional({ example: '2026-10-01', description: 'Tanggal awal periode (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ example: '2026-10-31', description: 'Tanggal akhir periode (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ description: 'Filter berdasarkan ID kategori' })
  @IsOptional()
  @IsUUID('4')
  category_id?: string;

  @ApiPropertyOptional({ enum: LoanStatus, description: 'Filter berdasarkan status' })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;
}

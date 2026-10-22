import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, Matches } from 'class-validator';
import { LoanStatus } from '../../common/enums/app.enums';
import { UUID_REGEX } from '../../common/constants/app.constants';

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
  @Matches(UUID_REGEX, { message: 'category_id harus berupa UUID yang valid' })
  category_id?: string;

  @ApiPropertyOptional({ enum: LoanStatus, description: 'Filter berdasarkan status' })
  @IsOptional()
  @IsEnum(LoanStatus)
  status?: LoanStatus;
}

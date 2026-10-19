import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Multimedia & Audio', description: 'Nama kategori unik' })
  @IsString({ message: 'Nama kategori harus berupa string' })
  @IsNotEmpty({ message: 'Nama kategori tidak boleh kosong' })
  name: string;

  @ApiPropertyOptional({ example: 'Peralatan speaker, mic, dan display presentasi' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Multimedia & Audio Update' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'Deskripsi kategori yang telah diperbarui' })
  @IsOptional()
  @IsString()
  description?: string;
}

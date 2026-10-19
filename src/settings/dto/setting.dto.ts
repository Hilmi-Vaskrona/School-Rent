import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSettingDto {
  @ApiProperty({ example: '5000', description: 'Nilai konfigurasi' })
  @IsString()
  @IsNotEmpty({ message: 'Nilai konfigurasi tidak boleh kosong' })
  value: string;
}

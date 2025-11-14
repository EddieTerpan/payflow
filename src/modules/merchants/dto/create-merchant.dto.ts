import { IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMerchantDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  C_percent: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

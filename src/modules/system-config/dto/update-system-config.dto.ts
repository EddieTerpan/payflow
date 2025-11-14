import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateSystemConfigDto {
  @ApiPropertyOptional({ description: 'A fee (absolute value)' })
  @IsOptional()
  @IsNumber()
  A?: number;

  @ApiPropertyOptional({ description: 'B fee percent (0.1 = 10%)' })
  @IsOptional()
  @IsNumber()
  B_percent?: number;

  @ApiPropertyOptional({ description: 'D hold percent (0.1 = 10%)' })
  @IsOptional()
  @IsNumber()
  D_percent?: number;
}

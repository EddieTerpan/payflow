import { ApiProperty } from '@nestjs/swagger';

export class SystemConfigDto {
  @ApiProperty({ example: 10, description: 'A fee (absolute value)' })
  A: number;

  @ApiProperty({ example: 0.05, description: 'B fee percent (0.05 = 5%)' })
  B_percent: number;

  @ApiProperty({ example: 0.1, description: 'D hold percent' })
  D_percent: number;
}

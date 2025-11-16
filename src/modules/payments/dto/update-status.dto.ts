import { ApiProperty } from '@nestjs/swagger';
export class UpdateStatusDto {
  @ApiProperty({
    type: [String],
    description: 'List of payment IDs to update',
  })
  ids: string[];
}

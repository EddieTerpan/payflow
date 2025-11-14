import { ApiProperty } from '@nestjs/swagger';

export class PayoutItemDto {
  @ApiProperty({ example: 12, description: 'ID платежу' })
  id: string;

  @ApiProperty({ example: 150.5, description: 'Сума, що була виплачена по даному платежу' })
  payoutAmount: number;
}

export class PayoutResponseDto {
  @ApiProperty({ description: 'ID магазину' })
  merchantId: string;

  @ApiProperty({
    example: 300,
    description: 'Загальна сума, виплачена у цьому запуску',
  })
  total: number;

  @ApiProperty({
    type: [PayoutItemDto],
    description: 'Список платежів, що увійшли у виплату',
  })
  items: PayoutItemDto[];
}

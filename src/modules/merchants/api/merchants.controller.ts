import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { MerchantsService } from '../application/merchants.service';
import { CreateMerchantDto } from '../dto/create-merchant.dto';
import { UpdateMerchantDto } from '../dto/update-merchant.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchants: MerchantsService) {}

  @Post()
  create(@Body() dto: CreateMerchantDto) {
    return this.merchants.create(dto);
  }

  @Get()
  getAll() {
    return this.merchants.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.merchants.getById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMerchantDto) {
    return this.merchants.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.merchants.remove(id);
  }
}

import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExtraModels, ApiOkResponse } from '@nestjs/swagger';
import { SystemConfigService } from '../aplication/system-config.service';
import { UpdateSystemConfigDto } from '../dto/update-system-config.dto';
import { SystemConfigDto } from '../dto/system-config.dto';

@ApiTags('system-config')
@ApiExtraModels(SystemConfigDto)
@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get system configuration' })
  @ApiOkResponse({ type: SystemConfigDto })
  async getConfig(): Promise<SystemConfigDto | null> {
    const cfg = await this.systemConfigService.getConfig();
    return cfg as SystemConfigDto;
  }

  @Patch()
  @ApiOperation({ summary: 'Update system configuration' })
  @ApiOkResponse({ type: SystemConfigDto })
  async updateConfig(@Body() dto: UpdateSystemConfigDto): Promise<SystemConfigDto> {
    const cfg = await this.systemConfigService.updateConfig(dto);
    return cfg as SystemConfigDto;
  }
}

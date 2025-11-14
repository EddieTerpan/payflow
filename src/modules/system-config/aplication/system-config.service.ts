import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RedisService } from '../../../common/database/redis/redis.service';
import { SystemConfig, SystemConfigDocument } from '../infrastructure/system-config.schema';

@Injectable()
export class SystemConfigService {
  private readonly CACHE_KEY = 'system_config';
  private readonly CACHE_TTL = 60;

  constructor(
    @InjectModel(SystemConfig.name)
    private readonly model: Model<SystemConfigDocument>,
    private readonly redis: RedisService,
  ) {}

  async getConfig() {

    const cached = await this.redis.get<SystemConfig>(this.CACHE_KEY);
    if (cached) {
      return cached;
    }

    const cfg = await this.model.findOne().lean();

    if (cfg) {
      await this.redis.set(this.CACHE_KEY, cfg, this.CACHE_TTL);
    }

    if(!cfg){
      throw new Error("sysconfig isn't found")
    }

    return cfg;
  }

  async updateConfig(dto: Partial<SystemConfig>) {
    const cfg = await this.model.findOneAndUpdate({}, dto, {
      upsert: true,
      new: true,
    });

    await this.redis.del(this.CACHE_KEY);

    return cfg;
  }
}

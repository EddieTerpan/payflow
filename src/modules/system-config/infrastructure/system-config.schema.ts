import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SystemConfigDocument = HydratedDocument<SystemConfig>;

@Schema({ collection: 'system_config' })
export class SystemConfig {
  @Prop({ required: true })
  A: number;

  @Prop({ required: true })
  B_percent: number;

  @Prop({ required: true })
  D_percent: number;

  @Prop({ default: () => new Date() })
  updatedAt: Date;
}

export const SystemConfigSchema = SchemaFactory.createForClass(SystemConfig);

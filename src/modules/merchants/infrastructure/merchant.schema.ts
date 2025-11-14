import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * 👉 Схема Merchant
 */
@Schema({ timestamps: true })
export class Merchant {
  /** Назва мерчанта */
  @Prop({ required: true })
  name: string;

  /** Комісія С у відсотках */
  @Prop({ required: true })
  C_percent: number;

  /** Чи активний мерчант */
  @Prop({ default: true })
  active: boolean;
}

export type MerchantDocument = HydratedDocument<Merchant>;

/** Lean-тип */
export type MerchantLean = Merchant & { _id: Types.ObjectId };

export const MerchantSchema = SchemaFactory.createForClass(Merchant);

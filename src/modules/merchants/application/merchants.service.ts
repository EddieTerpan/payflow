import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Merchant,
  MerchantDocument,
  MerchantLean,
} from '../infrastructure/merchant.schema';
import { CreateMerchantDto } from '../dto/create-merchant.dto';
import { UpdateMerchantDto } from '../dto/update-merchant.dto';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectModel(Merchant.name)
    private readonly merchantModel: Model<MerchantDocument>,
  ) {}

  async create(dto: CreateMerchantDto) {
    const created = await this.merchantModel.create(dto);
    return { id: created._id.toString() };
  }

  async getAll(): Promise<MerchantLean[]> {
    return this.merchantModel.find().lean() as Promise<MerchantLean[]>;
  }

  async getById(id: string): Promise<MerchantLean> {
    const merchant = await this.merchantModel.findById(id).lean();

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return merchant as MerchantLean;
  }

  async getByIds(ids: string[]): Promise<MerchantLean[]> {
    if (!ids.length) return [];

    const merchants = await this.merchantModel
      .find({ _id: { $in: ids } })
      .lean();

    return merchants as MerchantLean[];
  }

  async update(id: string, dto: UpdateMerchantDto) {
    const updated = await this.merchantModel.findByIdAndUpdate(
      id,
      { ...dto },
      { new: true, upsert: false },
    );

    if (!updated) throw new NotFoundException('Merchant not found');

    return updated;
  }

  async remove(id: string) {
    await this.merchantModel.findByIdAndDelete(id);
    return { deleted: true };
  }

  async getActiveMerchants(): Promise<MerchantLean[]> {
    return this.merchantModel
      .find({ active: true })
      .lean() as Promise<MerchantLean[]>;
  }
}

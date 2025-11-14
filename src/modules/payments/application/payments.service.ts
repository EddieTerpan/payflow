import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentOrmEntity } from '../domain/payment.orm-entity';
import { In } from 'typeorm';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentOrmEntity)
    private readonly repo: Repository<PaymentOrmEntity>,
  ) {}

  async create(merchantId: string, amount: number) {
    const p = this.repo.create({
      merchantId,
      amount,
      status: PaymentStatus.ACCEPTED,
    });
    return this.repo.save(p);
  }

  async getById(id: string) {
    return this.repo.findOneBy({ id });
  }

  async delete(id: string) {
    const entity = await this.getById(id);
    if (!entity) return null;

    await this.repo.delete(id);
    return entity;
  }

  async findByStatus(merchantId: string, status: PaymentStatus) {
    return this.repo.find({ where: { merchantId, status } });
  }

  async update(id: string, data: Partial<PaymentOrmEntity>) {
    await this.repo.update(id, data);
    return this.repo.findOneBy({ id });
  }

  async setStatus(ids: string[], status: PaymentStatus) {
    await this.repo.update(ids, { status });
  }

  async setPaid(ids: string[]) {
    await this.setStatus(ids, PaymentStatus.PAID);
  }

  async setPending(ids: string[]) {
    await this.setStatus(ids, PaymentStatus.PAID_PENDING);
  }

  async getPayablePayments(merchantId: string) {
    return this.repo.find({
      where: {
        merchantId,
        status: In([PaymentStatus.COMPLETED, PaymentStatus.PROCESSED]),
      },
      order: { createdAt: 'ASC' }, // FIFO
    });
  }

  async getPayablePaymentsMerchantIds(): Promise<string[]> {
    const rows = await this.repo.find({
      select: ['merchantId'],
      where: {
        status: In([PaymentStatus.COMPLETED, PaymentStatus.PROCESSED]),
      },
    });

    return [...new Set(rows.map((r) => r.merchantId))];
  }

  async getPaymentsMerchantIds(statusList: string[]): Promise<string[]> {
    const rows = await this.repo.find({
      select: ['merchantId'],
      where: {
        status: In(statusList),
      },
    });

    // Видаляємо дублікати
    return [...new Set(rows.map((r) => r.merchantId))];
  }
}

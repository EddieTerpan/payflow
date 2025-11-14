import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentsService } from '../../payments/application/payments.service';
import { MerchantsService } from '../../merchants/application/merchants.service';
import { PaymentStatus } from '../../payments/enums/payment-status.enum';
import { SystemConfigService } from '../../system-config/aplication/system-config.service';

@Injectable()
export class PayoutsService {
  constructor(
    private readonly payments: PaymentsService,
    private readonly merchants: MerchantsService,
    private readonly settings: SystemConfigService,
  ) {}

  // ======================================================================
  // 1) ACCEPTED → PROCESSED
  // ----------------------------------------------------------------------
  // Цитата ТЗ:
  // «Платіж оброблено — сума мінус комісія платіжної системи мінус D
  //   доступна для виплати. D — тимчасове блокування».
  //
  // З цього випливає формула:
  //   available(PROCESSED) = amount – A – B – C – D
  //
  // D ми блокуємо тимчасово (holdD), а доступну суму зменшуємо.
  // ======================================================================
  async processAccepted(merchantId: string) {
    const merchant = await this.merchants.getById(merchantId);
    if (!merchant) throw new NotFoundException('Магазин не знайдено');

    // Отримуємо системні комісії A, B та відсоток блокування D
    const { A, B_percent, D_percent } = await this.settings.getConfig();

    // Отримуємо всі платежі у статусі ACCEPTED
    const incoming = await this.payments.findByStatus(
      merchantId,
      PaymentStatus.ACCEPTED,
    );

    for (const p of incoming) {
      // A – фіксована комісія
      const feeA = Number(A);

      // B – % комісії платіжної системи
      const feeB = p.amount * (Number(B_percent) / 100);

      // C – % наша комісія (залежить від мерчанта)
      const feeC = p.amount * (Number(merchant.C_percent) / 100);

      // D – тимчасове блокування згідно з ТЗ
      const holdD = p.amount * (Number(D_percent) / 100);

      // Доступна сума без D
      const available =
        Number(p.amount) - feeA - feeB - feeC - holdD;

      // Переводимо платіж у статус PROCESSED
      await this.payments.update(p.id, {
        feeA,
        feeB,
        feeC,
        holdD,
        available,
        status: PaymentStatus.PROCESSED,
      });
    }
  }

  // ======================================================================
  // 2) PROCESSED → COMPLETED  +  PAID_PENDING → PAID
  // ----------------------------------------------------------------------
  // Цитата ТЗ:
  // «Платіж виконано — сума D розблокована та також доступна для виплати».
  //
  // Тобто:
  //   available(COMPLETED) = amount – A – B – C
  //   = available(PROCESSED) + holdD
  //
  // Важлива частина:
  // Якщо платіж був виплачений у статусі PROCESSED,
  //   але D ще не розморозився,
  // він повинен мати статус PAID_PENDING.
  //
  // Коли ми розморожуємо D → такий платіж повинен перейти у PAID.
  // ======================================================================
  async processProcessed(merchantId: string) {
    // 1) PROCESSED → COMPLETED (повертаємо D у available)
    const list = await this.payments.findByStatus(
      merchantId,
      PaymentStatus.PROCESSED,
    );

    for (const p of list) {
      await this.payments.update(p.id, {
        available: Number(p.available) + Number(p.holdD), // додаємо D назад
        holdD: 0, // більше нічого не заблоковано
        status: PaymentStatus.COMPLETED, // тепер платіж повністю готовий до виплати
      });
    }

    // 2) PAID_PENDING → PAID (остаточне підтвердження виплати)
    const pending = await this.payments.findByStatus(
      merchantId,
      PaymentStatus.PAID_PENDING,
    );

    for (const p of pending) {
      await this.payments.setStatus([p.id], PaymentStatus.PAID);
    }
  }

  // ======================================================================
  // 3) daily payout — щоденні виплати
  // ----------------------------------------------------------------------
  // Цитати ТЗ:
  //
  // «Платежі у статусі "оброблено" та "виконано" мають виплачуватись
  //   раз на день у межах доступного балансу клієнта.»
  //
  // «Через тимчасове блокування D — не усі оброблені платежі можуть
  //   бути виплачені через нестачу балансу.»
  //
  // «Якщо платіж виплачується — він виплачується як amount - A - B - C,
  //   але НЕ D.»
  //
  // Ключове:
  //  - PROCESSED можна виплачувати, але вони повинні стати PAID_PENDING
  //  - COMPLETED виплачуються одразу у PAID
  //
  // Алгоритм:
  //  1. Ранжуємо: COMPLETED > PROCESSED
  //  2. Рахуємо totalAvailableNow = Σ available
  //  3. Обираємо платежі, що поміщаються у баланс
  //  4. PROCESSED → PAID_PENDING
  //  5. COMPLETED → PAID
  // ======================================================================
  async dailyPayout(merchantId: string) {
    // Отримуємо всі PROCESSED + COMPLETED
    const payablePayments = await this.payments.getPayablePayments(merchantId);

    // 1) Ранжування: COMPLETED має більший пріоритет ніж PROCESSED
    const sortedPayablePayments = payablePayments.sort((a, b) => {
      // 1) Спочатку COMPLETED, потім PROCESSED
      if (a.status !== b.status) {
        return a.status === PaymentStatus.COMPLETED ? -1 : 1;
      }

      // 2) FIFO всередині одного статусу
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    let totalAvailableNow = 0;
    for (const payablePayment of payablePayments) {
      totalAvailableNow += Number(payablePayment.available);
    }

    // 3) Відбір платежів, які можна виплатити в межах балансу
    const picked: { id: string; payoutAmount: number }[] = [];
    let current = 0;

    for (const sortedPayablePayment of sortedPayablePayments) {
      // payoutAmount = amount – (A+B+C), згідно з ТЗ ("але НЕ D")
      const payoutAmount =
        Number(sortedPayablePayment.amount)
        - Number(sortedPayablePayment.feeA)
        - Number(sortedPayablePayment.feeB)
        - Number(sortedPayablePayment.feeC);

      if (current + payoutAmount <= totalAvailableNow) {
        picked.push({
          id: sortedPayablePayment.id,
          payoutAmount
        });

        current += payoutAmount;
      }
    }

    // 4) Розділяємо вибрані платежі по статусам
    const statusMap = new Map(payablePayments.map(p => [p.id, p.status]));

    const completedIds: string[] = [];
    const processedIds: string[] = [];

    for (const item of picked) {
      const status = statusMap.get(item.id);

      if (status === PaymentStatus.COMPLETED) {
        completedIds.push(item.id); // COMPLETED → PAID
      } else if (status === PaymentStatus.PROCESSED) {
        processedIds.push(item.id); // PROCESSED → PAID_PENDING
      }
    }

    // 5) Застосовуємо статуси
    if (completedIds.length > 0) {
      await this.payments.setPaid(completedIds);
    }

    if (processedIds.length > 0) {
      await this.payments.setPending(processedIds);
    }

    // Готовий денний звіт
    return {
      merchantId,
      total: current,
      items: picked,
    };
  }
}

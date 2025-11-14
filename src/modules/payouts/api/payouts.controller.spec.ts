import { Test } from '@nestjs/testing';
import { PayoutsController } from './payouts.controller';
import { PayoutsService } from '../application/payouts.service';

describe('PayoutsController', () => {
  let controller: PayoutsController;
  let service: PayoutsService;

  const mockService = {
    processAccepted: jest.fn(),
    processProcessed: jest.fn(),
    dailyPayout: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [PayoutsController],
      providers: [{ provide: PayoutsService, useValue: mockService }],
    }).compile();

    controller = module.get(PayoutsController);
    service = module.get(PayoutsService);
  });

  test('exists', () => expect(controller).toBeDefined());

  test.each([{ merchantId: 'm1' }, { merchantId: 'm2' }])(
    'processAccepted %#',
    async ({ merchantId }) => {
      const res = await controller.processAccepted(merchantId);
      expect(res).toEqual({ ok: true });
      expect(service.processAccepted).toHaveBeenCalledWith(merchantId);
    },
  );

  test.each([{ merchantId: 'mX' }, { merchantId: 'mY' }])(
    'processProcessed %#',
    async ({ merchantId }) => {
      const res = await controller.processProcessed(merchantId);
      expect(res).toEqual({ ok: true });
      expect(service.processProcessed).toHaveBeenCalledWith(merchantId);
    },
  );

  test.each([
    {
      merchantId: 'm1',
      payout: { merchantId: 'm1', total: 120, items: [] },
    },
    {
      merchantId: 'm2',
      payout: { merchantId: 'm2', total: 555, items: [{ id: 'p1' }] },
    },
  ])('daily payout %#', async ({ merchantId, payout }) => {
    mockService.dailyPayout.mockResolvedValue(payout);

    const res = await controller.runDaily(merchantId);
    expect(res).toEqual(payout);
  });
});

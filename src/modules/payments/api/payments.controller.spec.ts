import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from '../application/payments.service';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockService = {
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: mockService }],
    }).compile();

    controller = module.get(PaymentsController);
    service = module.get(PaymentsService);
  });

  test('controller exists', () => {
    expect(controller).toBeDefined();
  });

  test.each([
    { merchantId: 'm1', amount: 100 },
    { merchantId: 'm2', amount: 200.5 },
  ])('create %#', async ({ merchantId, amount }) => {
    mockService.create.mockResolvedValue({ id: 'p1', merchantId, amount });

    const res = await controller.create({ merchantId, amount });
    expect(res.amount).toBe(amount);
  });

  test.each([
    { id: 'p1', amount: 10 },
    { id: 'p2', amount: 999 },
  ])('getOne %#', async ({ id, amount }) => {
    mockService.getById.mockResolvedValue({ id, amount });

    const res = await controller.getOne(id);
    // @ts-ignore
    expect(res.amount).toBe(amount);
  });

  test.each([
    { id: 'p1', dto: { amount: 300 } },
    { id: 'p2', dto: { feeA: 2 } },
  ])('update %#', async ({ id, dto }) => {
    mockService.update.mockResolvedValue({ id, ...dto });

    const res = await controller.updateOne(id, dto);
    // @ts-ignore
    expect(res.id).toBe(id);
  });

  test.each(['p1', 'p2'])('delete %#', async (id) => {
    mockService.delete.mockResolvedValue({ ok: true });

    const res = await controller.deleteOne(id);
    expect(res).toEqual({ ok: true });
  });
});

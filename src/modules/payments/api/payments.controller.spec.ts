import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from '../application/payments.service';
import { PaymentStatus } from '../enums/payment-status.enum';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  const mockService = {
    create: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    setStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: mockService }],
    }).compile();

    controller = module.get(PaymentsController);
    service = module.get(PaymentsService);

    jest.clearAllMocks();
  });

  test('controller exists', () => {
    expect(controller).toBeDefined();
  });

  // ---------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------
  test.each([
    { merchantId: 'm1', amount: 100 },
    { merchantId: 'm2', amount: 200.5 },
  ])('create %#', async ({ merchantId, amount }) => {
    mockService.create.mockResolvedValue({ id: 'p1', merchantId, amount });

    const res = await controller.create({ merchantId, amount });
    expect(res.amount).toBe(amount);
    expect(service.create).toHaveBeenCalledWith(merchantId, amount);
  });

  // ---------------------------------------------------------
  // GET ONE
  // ---------------------------------------------------------
  test.each([
    { id: 'p1', amount: 10 },
    { id: 'p2', amount: 999 },
  ])('getOne %#', async ({ id, amount }) => {
    mockService.getById.mockResolvedValue({ id, amount });

    const res = await controller.getOne(id);
    //@ts-ignore
    expect(res.amount).toBe(amount);
    expect(service.getById).toHaveBeenCalledWith(id);
  });

  // ---------------------------------------------------------
  // UPDATE ONE
  // ---------------------------------------------------------
  test.each([
    { id: 'p1', dto: { amount: 300 } },
    { id: 'p2', dto: { feeA: 2 } },
  ])('updateOne %#', async ({ id, dto }) => {
    mockService.update.mockResolvedValue({ id, ...dto });

    const res = await controller.updateOne(id, dto);
    //@ts-ignore
    expect(res.id).toBe(id);
    expect(service.update).toHaveBeenCalledWith(id, dto);
  });

  // ---------------------------------------------------------
  // SET PROCESSED MANY
  // ---------------------------------------------------------
  test.each([
    { ids: [1, 2, 3] },
    { ids: [10] },
  ])('setProcessedMany %#', async ({ ids }) => {
    mockService.setStatus.mockResolvedValue(
      ids.map((id) => ({ id, status: PaymentStatus.PROCESSED }))
    );
    //@ts-ignore
    const res = await controller.setProcessedMany({ ids });

    expect(service.setStatus).toHaveBeenCalledWith(ids, PaymentStatus.PROCESSED);
    //@ts-ignore
    expect(res.length).toBe(ids.length);
  });

  // ---------------------------------------------------------
  // SET COMPLETED MANY
  // ---------------------------------------------------------
  test.each([
    { ids: [5, 6] },
    { ids: [99] },
  ])('setCompletedMany %#', async ({ ids }) => {
    mockService.setStatus.mockResolvedValue(
      ids.map((id) => ({ id, status: PaymentStatus.COMPLETED }))
    );
    //@ts-ignore
    const res = await controller.setCompletedMany({ ids });

    expect(service.setStatus).toHaveBeenCalledWith(ids, PaymentStatus.COMPLETED);
    //@ts-ignore
    expect(res.length).toBe(ids.length);
  });

  // ---------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------
  test.each(['p1', 'p2'])('delete %#', async (id) => {
    mockService.delete.mockResolvedValue({ ok: true });

    const res = await controller.deleteOne(id);
    expect(res).toEqual({ ok: true });
    expect(service.delete).toHaveBeenCalledWith(id);
  });
});

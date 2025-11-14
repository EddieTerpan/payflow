import { Test, TestingModule } from '@nestjs/testing';
import { MerchantsService } from '../application/merchants.service';
import { MerchantsController } from './merchants.controller';

describe('MerchantsController', () => {
  let controller: MerchantsController;
  let service: MerchantsService;

  const mockService = {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MerchantsController],
      providers: [{ provide: MerchantsService, useValue: mockService }],
    }).compile();

    controller = module.get(MerchantsController);
    service = module.get(MerchantsService);
  });

  test('should be defined', () => {
    expect(controller).toBeDefined();
  });

  test.each([
    { dto: { name: 'Shop A', C_percent: 1.2 } },
    { dto: { name: 'Shop B', C_percent: 3.5 } },
  ])('create %#', async ({ dto }) => {
    mockService.create.mockResolvedValue({ id: '1', ...dto });

    const res = await controller.create(dto);
    expect(res).toEqual({ id: '1', ...dto });
  });

  test.each([
    { id: '10', name: 'A' },
    { id: '20', name: 'B' },
  ])('getById %#', async ({ id, name }) => {
    mockService.getById.mockResolvedValue({ id, name });

    const res = await controller.getById(id);
    expect(res.name).toBe(name);
  });

  test.each([
    { id: '10', dto: { name: 'Updated' } },
    { id: '20', dto: { C_percent: 4.4 } },
  ])('update %#', async ({ id, dto }) => {
    mockService.update.mockResolvedValue({ id, ...dto });

    const res = await controller.update(id, dto);
    expect(res.id).toBe(id);
  });

  test.each(['10', '20'])('remove %#', async (id) => {
    mockService.remove.mockResolvedValue({ ok: true });

    const res = await controller.remove(id);
    expect(res).toEqual({ ok: true });
  });
});

import { Test } from '@nestjs/testing';
import { SystemConfigController } from './system-config.controller';
import { SystemConfigService } from '../aplication/system-config.service';


describe('SystemConfigController', () => {
  let controller: SystemConfigController;
  let service: SystemConfigService;

  const mockService = {
    getConfig: jest.fn(),
    updateConfig: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [SystemConfigController],
      providers: [{ provide: SystemConfigService, useValue: mockService }],
    }).compile();

    controller = module.get(SystemConfigController);
    service = module.get(SystemConfigService);
  });

  test('exists', () => expect(controller).toBeDefined());

  test.each([
    { cfg: { A: 10, B_percent: 1, D_percent: 20 } },
    { cfg: { A: 20, B_percent: 2, D_percent: 30 } },
  ])('getConfig %#', async ({ cfg }) => {
    mockService.getConfig.mockResolvedValue(cfg);
    const res = await controller.getConfig();
    expect(res).toEqual(cfg);
  });

  test.each([
    { update: { A: 10 } },
    { update: { B_percent: 2.5 } },
    { update: { D_percent: 40 } },
  ])('updateConfig %#', async ({ update }) => {
    mockService.updateConfig.mockResolvedValue(update);
    const res = await controller.updateConfig(update);
    expect(res).toEqual(update);
  });
});

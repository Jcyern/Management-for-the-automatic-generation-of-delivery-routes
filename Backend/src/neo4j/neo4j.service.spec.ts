import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NEO4J_CONFIG } from './neo4j.constants.js';
import { Neo4jService } from './neo4j.service.js';

const mocks = vi.hoisted(() => {
  const run = vi.fn();
  const sessionClose = vi.fn();
  const verifyConnectivity = vi.fn();
  const driverClose = vi.fn();
  const session = vi.fn(() => ({
    executeRead: (cb: (tx: { run: typeof run }) => unknown) => cb({ run }),
    executeWrite: (cb: (tx: { run: typeof run }) => unknown) => cb({ run }),
    close: sessionClose,
  }));
  const driver = vi.fn(() => ({ verifyConnectivity, close: driverClose, session }));
  const basic = vi.fn((username: string, password: string) => ({ username, password }));
  return { run, sessionClose, verifyConnectivity, driverClose, session, driver, basic };
});

vi.mock('neo4j-driver', () => ({
  default: { driver: mocks.driver, auth: { basic: mocks.basic } },
}));

const config = {
  uri: 'bolt://localhost:7687',
  username: 'neo4j',
  password: 'password',
  database: 'neo4j',
};

describe('Neo4jService', () => {
  let service: Neo4jService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [Neo4jService, { provide: NEO4J_CONFIG, useValue: config }],
    }).compile();
    service = module.get(Neo4jService);
  });

  it('crea el driver con disableLosslessIntegers', () => {
    expect(mocks.driver).toHaveBeenCalledWith(
      config.uri,
      { username: 'neo4j', password: 'password' },
      { disableLosslessIntegers: true },
    );
  });

  it('verifica la conectividad al iniciar', async () => {
    await service.onModuleInit();
    expect(mocks.verifyConnectivity).toHaveBeenCalledOnce();
  });

  it('read mapea los records y cierra la sesion', async () => {
    mocks.run.mockResolvedValue({ records: [{ toObject: () => ({ zonas: [1, 5, 2] }) }] });

    const filas = await service.read<{ zonas: number[] }>('RETURN 1', { a: 1 });

    expect(filas).toEqual([{ zonas: [1, 5, 2] }]);
    expect(mocks.run).toHaveBeenCalledWith('RETURN 1', { a: 1 });
    expect(mocks.sessionClose).toHaveBeenCalledOnce();
  });

  it('write ejecuta en modo escritura', async () => {
    mocks.run.mockResolvedValue({ records: [] });

    await service.write('CREATE (n)', {});

    expect(mocks.run).toHaveBeenCalledWith('CREATE (n)', {});
    expect(mocks.sessionClose).toHaveBeenCalledOnce();
  });

  it('cierra el driver al destruir el modulo', async () => {
    await service.onModuleDestroy();
    expect(mocks.driverClose).toHaveBeenCalledOnce();
  });
});

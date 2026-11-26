import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { PrismaService } from '../../prismaModule/prisma.service.js';
import { PrismaZonaRepository } from './adapters/outbound/prisma/PrismaZonaRepository.js';
import { ZONA_REPOSITORY } from './application/ports/ZonaRepositoryPort.js';
import { CrearZonaUseCase } from './application/use-cases/CrearZonaUseCase.js';
import { ZonaHexModule } from './zona.module.js';

describe('ZonaHexModule', () => {
  it('resuelve el repositorio y los casos de uso', async () => {
    const prismaMock = {
      zona: {
        create: async () => ({ id: 1, nombre: 'Norte' }),
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [ZonaHexModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    expect(moduleRef.get(ZONA_REPOSITORY)).toBeInstanceOf(PrismaZonaRepository);
    expect(moduleRef.get(CrearZonaUseCase)).toBeInstanceOf(CrearZonaUseCase);
  });
});

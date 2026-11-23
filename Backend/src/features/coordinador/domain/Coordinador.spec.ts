import { describe, expect, it } from 'vitest';
import { ReglaDeNegocioViolada } from '../../../shared/domain/DomainError.js';
import { Coordinador } from './Coordinador.js';

describe('Coordinador (dominio)', () => {
  const base = {
    id: 1,
    nombre: 'Ana',
    correo: 'ana@test.com',
    rolUsuario: 'COORDINADOR',
    especialidad: 'LOGISTICO' as const,
    centrosCrearRuta: [{ id: 10, nombre: 'Centro Norte' }],
    centrosValidarRuta: [],
    tieneLogistico: true,
    tieneSupervisor: false,
    tieneAdministrador: false,
  };

  it('rehidrata un coordinador con sus datos', () => {
    const coordinador = Coordinador.rehidratar(base);

    expect(coordinador.id).toBe(1);
    expect(coordinador.nombre).toBe('Ana');
    expect(coordinador.especialidad).toBe('LOGISTICO');
    expect(coordinador.correo).toBe('ana@test.com');
    expect(coordinador.centrosCrearRuta).toEqual([{ id: 10, nombre: 'Centro Norte' }]);
  });

  it('valida y normaliza nombre', () => {
    expect(Coordinador.validarNombre('  Ana  ')).toBe('Ana');
    expect(() => Coordinador.validarNombre('   ')).toThrow(ReglaDeNegocioViolada);
  });

  it('valida especialidad permitida', () => {
    expect(Coordinador.validarEspecialidad('SUPERVISOR')).toBe('SUPERVISOR');
    expect(() => Coordinador.validarEspecialidad('REPARTIDOR')).toThrow(
      ReglaDeNegocioViolada,
    );
  });

  it('rechaza especialidad inválida al rehidratar', () => {
    expect(() =>
      Coordinador.rehidratar({
        ...base,
        especialidad: 'INVALIDA' as any,
      }),
    ).toThrow(ReglaDeNegocioViolada);
  });
});

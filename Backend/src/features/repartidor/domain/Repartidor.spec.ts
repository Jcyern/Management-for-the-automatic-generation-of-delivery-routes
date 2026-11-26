import { describe, expect, it } from 'vitest';
import { Repartidor } from './Repartidor.js';
import { ReglaDeNegocioViolada } from '../../../shared/domain/DomainError.js';

describe('Repartidor (Dominio)', () => {
  it('crea un repartidor válido', () => {
    const rep = Repartidor.crear('Juan', 25, 1, 10, [2, 3]);
    expect(rep.nombre).toBe('Juan');
    expect(rep.edad).toBe(25);
    expect(rep.idUser).toBe(10);
    expect(rep.centrosIds).toEqual([2, 3]);
  });

  it('lanza error si el nombre está vacío', () => {
    expect(() => Repartidor.crear('  ', 25, 1, 10)).toThrow(ReglaDeNegocioViolada);
  });

  it('lanza error si el repartidor es menor de edad', () => {
    expect(() => Repartidor.crear('Juan', 17, 1, 10)).toThrow(ReglaDeNegocioViolada);
  });

  it('actualiza datos y centros manteniendo inmutabilidad', () => {
    const rep = Repartidor.rehidratar({ idUser: 10, nombre: 'Juan', edad: 25, idFlota: 1, centrosIds: [2] });
    const actualizado = rep.actualizarDatos('Juan Pérez', 26, 2, [3, 4]);

    expect(rep.nombre).toBe('Juan');
    expect(actualizado.nombre).toBe('Juan Pérez');
    expect(actualizado.edad).toBe(26);
    expect(actualizado.idFlota).toBe(2);
    expect(actualizado.centrosIds).toEqual([3, 4]);
  });
});
import { describe, expect, it } from 'vitest';
import { Flota } from './Flota.js';
import { ReglaDeNegocioViolada } from '../../../shared/domain/DomainError.js';

describe('Flota (Dominio)', () => {
  it('crea una flota válida y limpia los espacios en blanco', () => {
    const flota = Flota.crear('  Flota Norte  ');
    expect(flota.nombre).toBe('Flota Norte');
    expect(flota.id).toBeNull();
  });

  it('lanza excepción si el nombre está vacío', () => {
    expect(() => Flota.crear('   ')).toThrow(ReglaDeNegocioViolada);
    expect(() => Flota.crear('   ')).toThrow('El nombre de la flota es obligatorio.');
  });

  it('rehidrata una flota existente', () => {
    const flota = Flota.rehidratar({ id: 1, nombre: 'Flota Sur' });
    expect(flota.id).toBe(1);
    expect(flota.nombre).toBe('Flota Sur');
  });

  it('renombrar devuelve una nueva instancia inmutable', () => {
    const flota = Flota.rehidratar({ id: 1, nombre: 'Flota Sur' });
    const renombrada = flota.renombrar('Flota Sur 2');

    expect(flota.nombre).toBe('Flota Sur');
    expect(renombrada.nombre).toBe('Flota Sur 2');
    expect(renombrada.id).toBe(1);
  });

  it('renombrar valida que el nuevo nombre no esté vacío', () => {
    const flota = Flota.rehidratar({ id: 1, nombre: 'Flota Sur' });
    expect(() => flota.renombrar('')).toThrow(ReglaDeNegocioViolada);
  });
});
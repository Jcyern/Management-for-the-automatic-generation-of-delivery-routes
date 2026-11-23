import { describe, expect, it } from 'vitest';
import { ReglaDeNegocioViolada } from '../../../shared/domain/DomainError.js';
import { Zona } from './Zona.js';

describe('Zona (dominio)', () => {
  it('crea una zona con id nulo y nombre normalizado', () => {
    const zona = Zona.crear('  Norte  ');

    expect(zona.id).toBeNull();
    expect(zona.nombre).toBe('Norte');
  });

  it('rechaza un nombre vacío al crear', () => {
    expect(() => Zona.crear('   ')).toThrow(ReglaDeNegocioViolada);
  });

  it('rechaza un nombre vacío con el mensaje esperado', () => {
    expect(() => Zona.crear('')).toThrow('El nombre de la zona es obligatorio.');
  });

  it('rehidrata conservando id y nombre', () => {
    const zona = Zona.rehidratar({ id: 7, nombre: 'Centro' });

    expect(zona.id).toBe(7);
    expect(zona.nombre).toBe('Centro');
  });

  it('renombrar devuelve una nueva instancia sin mutar la original', () => {
    const original = Zona.rehidratar({ id: 1, nombre: 'Norte' });
    const actualizada = original.renombrar('Sur');

    expect(actualizada.nombre).toBe('Sur');
    expect(original.nombre).toBe('Norte');
    expect(actualizada).not.toBe(original);
  });

  it('renombrar conserva el id', () => {
    const zona = Zona.rehidratar({ id: 42, nombre: 'Norte' });

    expect(zona.renombrar('Sur').id).toBe(42);
  });

  it('rechaza renombrar a un nombre vacío', () => {
    const zona = Zona.rehidratar({ id: 1, nombre: 'Norte' });

    expect(() => zona.renombrar('')).toThrow(ReglaDeNegocioViolada);
  });
});

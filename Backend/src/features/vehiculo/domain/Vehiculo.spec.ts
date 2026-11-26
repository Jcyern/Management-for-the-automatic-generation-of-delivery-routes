import { describe, expect, it } from 'vitest';
import { Vehiculo } from './Vehiculo.js';
import { ReglaDeNegocioViolada } from '../../../shared/domain/DomainError.js';

describe('Vehiculo (Dominio)', () => {
  it('crea un vehículo válido', () => {
    const v = Vehiculo.crear(500, 1);
    expect(v.capacidad).toBe(500);
    expect(v.idFlota).toBe(1);
  });

  it('lanza error si la capacidad es 0 o menor', () => {
    expect(() => Vehiculo.crear(0, 1)).toThrow(ReglaDeNegocioViolada);
    expect(() => Vehiculo.crear(-10, 1)).toThrow(ReglaDeNegocioViolada);
  });

  it('permite cambiar de capacidad y flota de forma inmutable', () => {
    const v = Vehiculo.rehidratar({ id: 1, capacidad: 500, idFlota: 1 });
    const modificado = v.cambiarCapacidad(800).cambiarFlota(2);
    
    expect(v.capacidad).toBe(500);
    expect(modificado.capacidad).toBe(800);
    expect(modificado.idFlota).toBe(2);
  });
});
import { describe, expect, it } from 'vitest';
import { ReglaDeNegocioViolada } from '../../../shared/domain/DomainError.js';
import { Centro } from './Centro.js';

const base = {
  id: 1,
  nombre: 'Centro Norte',
  programaLogistico: 'P1',
  direccion: 'Calle 23, La Habana',
  latitud: 23.1,
  longitud: -82.4,
  zonasIds: [2],
};

describe('Centro (dominio)', () => {
  it('crea un centro con id nulo y nombre/programa/dirección normalizados', () => {
    const centro = Centro.crear({
      nombre: '  Centro Norte  ',
      programaLogistico: '  P1  ',
      direccion: '  Calle 23  ',
    });

    expect(centro.id).toBeNull();
    expect(centro.nombre).toBe('Centro Norte');
    expect(centro.programaLogistico).toBe('P1');
    expect(centro.direccion).toBe('Calle 23');
    expect(centro.latitud).toBeNull();
    expect(centro.longitud).toBeNull();
  });

  it('crea con solo coordenadas', () => {
    const centro = Centro.crear({
      nombre: 'Centro',
      programaLogistico: 'P1',
      latitud: 23.1,
      longitud: -82.4,
    });

    expect(centro.direccion).toBeNull();
    expect(centro.latitud).toBe(23.1);
    expect(centro.longitud).toBe(-82.4);
  });

  it('crea sin zonas por defecto', () => {
    const centro = Centro.crear({
      nombre: 'Centro',
      programaLogistico: 'P1',
      direccion: 'Calle',
    });

    expect(centro.zonasIds).toEqual([]);
  });

  it('crea conservando los ids de zonas indicados', () => {
    const centro = Centro.crear({
      nombre: 'Centro',
      programaLogistico: 'P1',
      direccion: 'Calle',
      zonasIds: [2, 3],
    });

    expect(centro.zonasIds).toEqual([2, 3]);
  });

  it('rechaza ids de zona no positivos al crear', () => {
    expect(() =>
      Centro.crear({
        nombre: 'Centro',
        programaLogistico: 'P1',
        direccion: 'Calle',
        zonasIds: [0],
      }),
    ).toThrow(ReglaDeNegocioViolada);

    expect(() =>
      Centro.crear({
        nombre: 'Centro',
        programaLogistico: 'P1',
        direccion: 'Calle',
        zonasIds: [1.5],
      }),
    ).toThrow(ReglaDeNegocioViolada);
  });

  it('rechaza ids de zona duplicados al crear', () => {
    expect(() =>
      Centro.crear({
        nombre: 'Centro',
        programaLogistico: 'P1',
        direccion: 'Calle',
        zonasIds: [2, 2],
      }),
    ).toThrow(ReglaDeNegocioViolada);
  });

  it('rechaza nombre vacío', () => {
    expect(() =>
      Centro.crear({
        nombre: '   ',
        programaLogistico: 'P1',
        direccion: 'Calle',
      }),
    ).toThrow(ReglaDeNegocioViolada);
  });

  it('rechaza programa logístico vacío', () => {
    expect(() =>
      Centro.crear({
        nombre: 'Centro',
        programaLogistico: '',
        direccion: 'Calle',
      }),
    ).toThrow('El programa logístico es obligatorio.');
  });

  it('rechaza crear sin dirección ni coordenadas', () => {
    expect(() =>
      Centro.crear({ nombre: 'Centro', programaLogistico: 'P1' }),
    ).toThrow(ReglaDeNegocioViolada);
  });

  it('rechaza latitud sin longitud', () => {
    expect(() =>
      Centro.crear({
        nombre: 'Centro',
        programaLogistico: 'P1',
        latitud: 23.1,
      }),
    ).toThrow(ReglaDeNegocioViolada);
  });

  it('rechaza latitud fuera de rango', () => {
    expect(() =>
      Centro.crear({
        nombre: 'Centro',
        programaLogistico: 'P1',
        latitud: 100,
        longitud: -82.4,
      }),
    ).toThrow(ReglaDeNegocioViolada);
  });

  it('rechaza longitud fuera de rango', () => {
    expect(() =>
      Centro.crear({
        nombre: 'Centro',
        programaLogistico: 'P1',
        latitud: 23.1,
        longitud: 200,
      }),
    ).toThrow(ReglaDeNegocioViolada);
  });

  it('rehidrata conservando id y datos', () => {
    const centro = Centro.rehidratar(base);

    expect(centro.id).toBe(1);
    expect(centro.nombre).toBe('Centro Norte');
    expect(centro.direccion).toBe('Calle 23, La Habana');
    expect(centro.zonasIds).toEqual([2]);
  });

  it('renombrar devuelve nueva instancia sin mutar la original', () => {
    const original = Centro.rehidratar(base);
    const actualizado = original.renombrar('Centro Sur');

    expect(actualizado.nombre).toBe('Centro Sur');
    expect(original.nombre).toBe('Centro Norte');
    expect(actualizado).not.toBe(original);
    expect(actualizado.id).toBe(1);
  });

  it('renombrar rechaza un nombre vacío', () => {
    const centro = Centro.rehidratar(base);
    expect(() => centro.renombrar('')).toThrow(ReglaDeNegocioViolada);
  });

  it('cambiarPrograma normaliza y no muta', () => {
    const original = Centro.rehidratar(base);
    const actualizado = original.cambiarPrograma('  P2  ');

    expect(actualizado.programaLogistico).toBe('P2');
    expect(original.programaLogistico).toBe('P1');
  });

  it('ubicar con coordenadas válidas devuelve nueva instancia', () => {
    const original = Centro.rehidratar(base);
    const actualizado = original.ubicar(null, 23.2, -82.5);

    expect(actualizado.latitud).toBe(23.2);
    expect(actualizado.longitud).toBe(-82.5);
    expect(actualizado.direccion).toBeNull();
    expect(original.latitud).toBe(23.1);
  });

  it('ubicar rechaza dejar el centro sin ubicación (D5)', () => {
    const centro = Centro.rehidratar(base);
    expect(() => centro.ubicar(null, null, null)).toThrow(ReglaDeNegocioViolada);
  });

  it('ubicar rechaza una sola coordenada', () => {
    const centro = Centro.rehidratar(base);
    expect(() => centro.ubicar('Calle', 23.2, null)).toThrow(
      ReglaDeNegocioViolada,
    );
  });

  it('asignarZonas devuelve nueva instancia sin mutar la original', () => {
    const original = Centro.rehidratar(base);
    const actualizado = original.asignarZonas([4, 5]);

    expect(actualizado.zonasIds).toEqual([4, 5]);
    expect(original.zonasIds).toEqual([2]);
    expect(actualizado).not.toBe(original);
  });

  it('asignarZonas([]) quita todas las zonas', () => {
    const centro = Centro.rehidratar(base);
    expect(centro.asignarZonas([]).zonasIds).toEqual([]);
  });

  it('asignarZonas rechaza ids duplicados', () => {
    const centro = Centro.rehidratar(base);
    expect(() => centro.asignarZonas([4, 4])).toThrow(ReglaDeNegocioViolada);
  });
});

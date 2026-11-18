import { describe, expect, it } from 'vitest';
import { normalizarDireccion, sonCoordenadasValidas } from './geo.utils.js';

describe('normalizarDireccion', () => {
  it('pasa a minúsculas, quita tildes y colapsa espacios', () => {
    expect(normalizarDireccion('  Calle   Ñandú Nº 12  ')).toBe('calle nandu nº 12');
  });

  it('normaliza la puntuación redundante', () => {
    expect(normalizarDireccion('Av. 5ta; e/ 10 y 12,')).toBe('av 5ta e/ 10 y 12');
  });

  it('devuelve cadena vacía si la dirección solo tiene espacios', () => {
    expect(normalizarDireccion('   ')).toBe('');
  });
});

describe('sonCoordenadasValidas', () => {
  it('acepta coordenadas dentro de rango', () => {
    expect(sonCoordenadasValidas({ latitud: 23.11, longitud: -82.36 })).toBe(true);
  });

  it('rechaza valores nulos o no finitos', () => {
    expect(sonCoordenadasValidas(null)).toBe(false);
    expect(sonCoordenadasValidas({ latitud: Number.NaN, longitud: 0 })).toBe(false);
  });

  it('rechaza coordenadas fuera de rango', () => {
    expect(sonCoordenadasValidas({ latitud: 91, longitud: 0 })).toBe(false);
    expect(sonCoordenadasValidas({ latitud: 0, longitud: 181 })).toBe(false);
  });
});

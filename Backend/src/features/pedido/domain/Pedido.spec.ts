import { describe, expect, it } from 'vitest';
import { ReglaDeNegocioViolada } from '../../../shared/domain/DomainError.js';
import { Pedido } from './Pedido.js';

describe('Pedido (dominio)', () => {
  const datos = {
    destinatario: 'Ana Pérez',
    direccion: 'Calle 23 #10',
    idCentro: 1,
    idCoordinador: 2,
    idZona: 3,
  };

  it('crea un pedido sin id ni relaciones persistidas', () => {
    const pedido = Pedido.crear({ ...datos, coordenadas: null });

    expect(pedido.id).toBeNull();
    expect(pedido.centro).toBeNull();
    expect(pedido.coordinador).toBeNull();
    expect(pedido.coordenadas).toBeNull();
    expect(pedido.idParada).toBeNull();
  });

  it('rechaza destinatario o dirección vacíos', () => {
    expect(() => Pedido.crear({ ...datos, destinatario: '  ' })).toThrow(
      ReglaDeNegocioViolada,
    );
    expect(() => Pedido.crear({ ...datos, direccion: '' })).toThrow(
      ReglaDeNegocioViolada,
    );
  });

  it('rechaza ids no positivos y enums inválidos', () => {
    expect(() => Pedido.crear({ ...datos, idCentro: 0 })).toThrow(
      ReglaDeNegocioViolada,
    );
    expect(() =>
      Pedido.crear({ ...datos, prioridad: 'Inexistente' as any }),
    ).toThrow(ReglaDeNegocioViolada);
  });

  it('rechaza coordenadas fuera de rango', () => {
    expect(() =>
      Pedido.crear({
        ...datos,
        coordenadas: { latitud: 91, longitud: 0 },
      }),
    ).toThrow(ReglaDeNegocioViolada);
  });

  it('actualizar conserva coordenadas si no cambia la dirección', () => {
    const pedido = Pedido.crear({
      ...datos,
      coordenadas: { latitud: 23.1, longitud: -82.4 },
    });

    const actualizado = pedido.actualizar({ prioridad: 'Urgente' });

    expect(actualizado.coordenadas).toEqual({ latitud: 23.1, longitud: -82.4 });
    expect(actualizado.prioridad).toBe('Urgente');
    expect(pedido.prioridad).toBeNull();
  });

  it('actualizar reemplaza coordenadas cuando cambia la dirección', () => {
    const pedido = Pedido.crear({
      ...datos,
      coordenadas: { latitud: 23.1, longitud: -82.4 },
    });

    const actualizado = pedido.actualizar({
      direccion: 'Calle 25 #12',
      coordenadas: { latitud: 23.2, longitud: -82.5 },
    });

    expect(actualizado.direccion).toBe('Calle 25 #12');
    expect(actualizado.coordenadas).toEqual({ latitud: 23.2, longitud: -82.5 });
  });
});

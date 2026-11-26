import { Zona } from '../../src/features/zona/domain/Zona.js';
import type { ZonaRepositoryPort } from '../../src/features/zona/application/ports/ZonaRepositoryPort.js';

export class FakeZonaRepository implements ZonaRepositoryPort {
  private readonly zonas = new Map<number, Zona>();
  private readonly conDependencias = new Set<number>();
  private siguienteId = 1;

  sembrar(id: number, nombre: string): Zona {
    const zona = Zona.rehidratar({ id, nombre });
    this.zonas.set(id, zona);
    this.siguienteId = Math.max(this.siguienteId, id + 1);
    return zona;
  }

  marcarDependencias(id: number): void {
    this.conDependencias.add(id);
  }

  async guardar(zona: Zona): Promise<Zona> {
    const id = zona.id ?? this.siguienteId++;
    const guardada = Zona.rehidratar({ id, nombre: zona.nombre });
    this.zonas.set(id, guardada);
    return guardada;
  }

  async buscarPorId(id: number): Promise<Zona | null> {
    return this.zonas.get(id) ?? null;
  }

  async listar(): Promise<Zona[]> {
    return [...this.zonas.values()];
  }

  async tieneDependencias(id: number): Promise<boolean> {
    return this.conDependencias.has(id);
  }

  async eliminar(id: number): Promise<Zona> {
    const zona = this.zonas.get(id);
    if (!zona) {
      throw new Error(`Zona ${id} no existe en el fake`);
    }
    this.zonas.delete(id);
    return zona;
  }
}

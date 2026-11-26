import type { TiempoRealPort } from '../ports/ExternalPorts.js';

export class VerificarDisponibilidadUseCase {
  constructor(private readonly tiempoReal: TiempoRealPort) {}
  async execute(idUser: number): Promise<{ disponible: boolean }> {
    const disponible = await this.tiempoReal.estaDisponible(idUser);
    return { disponible };
  }
}
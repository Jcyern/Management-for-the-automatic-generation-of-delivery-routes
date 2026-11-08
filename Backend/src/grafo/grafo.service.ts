import { Injectable, NotFoundException } from '@nestjs/common';
import { Neo4jService } from '../neo4j/neo4j.service.js';
import {
  CRITERIOS,
  type CaminoResult,
  type Criterio,
} from './dto/camino.dto.js';

const PESO_POR_CRITERIO: Record<Criterio, string> = {
  distancia: 'distanciaKm',
  tiempo: 'tiempoMin',
};

const MAX_SALTOS = 6;
const MAX_LIMITE = 10;

@Injectable()
export class GrafoService {
  constructor(private readonly neo4j: Neo4jService) {}

  static esCriterioValido(valor: string): valor is Criterio {
    return (CRITERIOS as readonly string[]).includes(valor);
  }

  async caminoMasCorto(
    origenId: number,
    destinoId: number,
    criterio: Criterio,
  ): Promise<CaminoResult> {
    const peso = PESO_POR_CRITERIO[criterio];
    const filas = await this.neo4j.read<CaminoResult>(
      `MATCH (a:Zona {id: $origen}), (b:Zona {id: $destino})
       CALL apoc.algo.dijkstra(a, b, 'CONECTA', '${peso}')
       YIELD path, weight
       WITH path, weight,
            reduce(d = 0.0, r IN relationships(path) | d + toFloat(r.distanciaKm)) AS distancia,
            reduce(t = 0.0, r IN relationships(path) | t + toFloat(r.tiempoMin)) AS tiempo
       RETURN [n IN nodes(path) | n.id] AS zonas,
              round(distancia * 100) / 100 AS distanciaKm,
              round(tiempo * 100) / 100 AS tiempoMin,
              round(weight * 100) / 100 AS costo,
              length(path) AS saltos`,
      { origen: origenId, destino: destinoId },
    );

    const resultado = filas[0];
    if (!resultado) {
      throw new NotFoundException(
        `No hay camino entre las zonas ${origenId} y ${destinoId}`,
      );
    }
    return resultado;
  }

  async rutasAlternativas(
    origenId: number,
    destinoId: number,
    criterio: Criterio,
    limite: number,
  ): Promise<CaminoResult[]> {
    const peso = PESO_POR_CRITERIO[criterio];
    const tope = Math.min(Math.max(limite, 1), MAX_LIMITE);

    const filas = await this.neo4j.read<CaminoResult>(
      `MATCH (a:Zona {id: $origen}), (b:Zona {id: $destino})
       CALL apoc.algo.allSimplePaths(a, b, 'CONECTA', ${MAX_SALTOS})
       YIELD path
       WITH path,
            reduce(d = 0.0, r IN relationships(path) | d + toFloat(r.distanciaKm)) AS distancia,
            reduce(t = 0.0, r IN relationships(path) | t + toFloat(r.tiempoMin)) AS tiempo
       WITH path, distancia, tiempo,
            CASE '${peso}' WHEN 'distanciaKm' THEN distancia ELSE tiempo END AS costo
       RETURN [n IN nodes(path) | n.id] AS zonas,
              round(distancia * 100) / 100 AS distanciaKm,
              round(tiempo * 100) / 100 AS tiempoMin,
              round(costo * 100) / 100 AS costo,
              length(path) AS saltos
       ORDER BY costo ASC
       LIMIT ${tope}`,
      { origen: origenId, destino: destinoId },
    );

    if (filas.length === 0) {
      throw new NotFoundException(
        `No existen rutas alternativas entre las zonas ${origenId} y ${destinoId}`,
      );
    }
    return filas;
  }
}

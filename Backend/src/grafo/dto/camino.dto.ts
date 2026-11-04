export const CRITERIOS = ['distancia', 'tiempo'] as const;

export type Criterio = (typeof CRITERIOS)[number];

export interface CaminoResult {
  zonas: number[];
  costo: number;
  saltos: number;
}
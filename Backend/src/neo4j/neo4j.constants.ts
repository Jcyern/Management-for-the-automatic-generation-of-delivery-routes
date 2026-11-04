export const NEO4J_CONFIG = 'NEO4J_CONFIG';

export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
  database: string;
}
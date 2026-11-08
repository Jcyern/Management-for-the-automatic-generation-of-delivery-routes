export type RolCoordinadorSeed = 'ADMINISTRADOR' | 'LOGISTICO' | 'SUPERVISOR' ;




export type UsuarioBaseSeed = {
  email: string;
  password: string;
  nombre: string;
  roluser: 'COORDINADOR'|'REPARTIDOR'
};


export type CoordinadorSeed = UsuarioBaseSeed & {
    roluser: "COORDINADOR"
    rol : RolCoordinadorSeed
}

export type RepartidorSeed = UsuarioBaseSeed & {
    roluser: "REPARTIDOR"
    edad: number
    flota: string
}

export type UsuarioSeed = CoordinadorSeed | RepartidorSeed

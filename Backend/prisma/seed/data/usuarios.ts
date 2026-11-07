import type { FlotaSeed, UsuarioSeed } from '../tipos.js';


//Datos de los Usuarios que se van a  agregar 

export const usuarios: UsuarioSeed[] = [
  {
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@rutas.local',
    password: process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!',
    nombre: process.env.SEED_ADMIN_NOMBRE ?? 'Administrador',
    roluser : 'COORDINADOR',
    rol: 'ADMINISTRADOR',
  },
  {
    email: process.env.SEED_LOGISTICO_EMAIL ?? 'logistico@rutas.local',
    password: process.env.SEED_LOGISTICO_PASSWORD ?? 'Logistica123!',
    nombre: process.env.SEED_LOGISTICO_NOMBRE ?? 'Logístico Demo',
    roluser: 'COORDINADOR',
    rol: 'LOGISTICO',

  },
  {
    email: process.env.SEED_SUPERVISOR_EMAIL ?? 'supervisor@rutas.local',
    password: process.env.SEED_SUPERVISOR_PASSWORD ?? 'Supervisor123!',
    nombre: process.env.SEED_SUPERVISOR_NOMBRE ?? 'Supervisor Demo',
    roluser:'COORDINADOR',
    rol: 'SUPERVISOR',
  },
];


export const flotas: FlotaSeed[] =[
  {nombre: "Lisa"},
  {nombre: "Habana del Este "}
]
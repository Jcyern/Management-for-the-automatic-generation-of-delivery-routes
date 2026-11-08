import type { UsuarioSeed } from '../tipos.js';


//Datos de los Usuarios que se van a agregar

export const usuarios: UsuarioSeed[] = [
  {
    email:'admin@deliveryroutes.com',
    password: 'Admin123!',
    nombre: 'Laura',
    roluser : 'COORDINADOR',
    rol: 'ADMINISTRADOR',
  },
  {
    email:'logic@deliveryroutes.com',
    password: 'Logic123!',
    nombre: 'Ana Laura',
    roluser : 'COORDINADOR',
    rol: 'LOGISTICO',
  },
  {
    email:'superv@deliveryroutes.com',
    password: 'Superv123!',
    nombre: 'Adrian',
    roluser : 'COORDINADOR',
    rol: 'SUPERVISOR',
  },
  {
    email:'repartidor@deliveryroutes.com',
    password: 'Repartidor123!',
    nombre: 'Alejandro',
    roluser : 'REPARTIDOR',
    edad : 22 ,
    flota: "Cerro"
  },


];


export const flotas: string[] =[
  "Lisa",
  "Habana del Este",
  "Cerro"
]

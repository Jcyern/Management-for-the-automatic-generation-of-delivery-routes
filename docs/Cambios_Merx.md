## Cambios realizados en el MERX:
## Referente al MERX

1- [Listo] **Pedido no está relacionado con Ruta ni con Parada.** El texto dice que la parada tiene "pedido asociado". Sin la relación Ruta–Pedido no se pueden resolver las consultas 2, 4, 5 y 6.
2- [Listo] **Reporte de Entrega no está relacionado con Ruta, Pedido ni Parada**, y no tiene ningún atributo de resultado (entregado/fallido, a tiempo o no). Contiene ID Repartidor como atributo, es decir, una clave foránea dibujada como atributo en lugar de una interrelación. No permite calcular tasas de entrega a tiempo ni de incumplimiento. 
3- [Listo] **ConsultaR y ConsultaC** modelan como interrelaciones la operación de "consultar" reportes. Consultar no es un hecho a almacenar; no deben aparecer en el MERX.
4- [Listo] **Validar (Supervisor–Ruta) no tiene atributos.** Faltan la fecha de validación y las observaciones (RF-23 y Consulta 3). Tampoco hay historial de validaciones ni resultado (aprobada/rechazada).
5- [Listo] **Ruta solo tiene ID Ruta y Parámetros.** Falta la fecha de creación (Consulta 1, y la usan las restricciones temporales) y el estado de la ruta (que sí se usa en la §3.2). Pedido tampoco tiene estado, aunque §3.2 lo restringe.
6- [Listo] **Ruta tiene dos interrelaciones "Crear"**: una con Coordinadores y otra con Supervisor de Operaciones, ambas con (1,1). Eso implica que toda ruta tiene a la vez un coordinador creador y un supervisor creador. Además, "indicar la confección de otra ruta" no queda modelado como relación entre rutas o solicitud.
7- [Listo] **Existe una línea con flecha entre Coordinador Logístico y Supervisor de Operaciones.** ,  explicar que es una especificación
8- [Listo] **Coordinadores tiene el atributo "IDs Centros"**, que es multivaluado y representa claves foráneas. Además, existen las interrelaciones "Crear Rutas" y "Validación Rutas" entre Coordinadores y Centro de Distribución. La autorización por centro está representada de forma redundante y confusa.
9- [Listo] **Pedido tiene "Zona" como atributo** aunque existe la entidad Zonas. Debería ser una interrelación Pedido–Zona.
10- [ ] **Reprogramar (ternaria Repartidor–Ruta–Coordinador)** no registra el resultado de la reprogramación manual (RF-29) ni la entrega o pedido concreto que se reprograma.
11- [Listo] **Notación:** los atributos se unen con flechas (no es notación MERX).
12- [Listo] **No hay hora prevista ni real de entrega** por parada o pedido, así que no se puede determinar si una entrega fue "a tiempo".

Solciones:
2- Relacion entre Ruta-Reporte(Generar_Reporte), Se añade el atributos entregado , en_tiempo? a Reporte_Entrega , Se añade a pedidos atributos de fecha_prevista , fecha_entrega para saber si el pedido fue entregado a tiempo o no .

3- Relaciones eliminadad por completo
4- Se añade a la relación Validar los atributos de observaciones , fecha, aprobado/rechazado.
5- Se añade atributos fecha_creación a la relación Crear , los atributos estado , fecha_realización  a rutas, además de agregarle el atributo estado a pedido
6- Se elimina la relación crear entre ruta y supervisor. 
8- Eliminado el atributo id_centros
9- Relación cubrir entre Zona y Pedido
10 - Reprogramación se modela entre repartidor ,pedido y el coordinador encargado de hacer la reprogrmacion

11- Cambiar la Notacion
12- Añadimos hora_prevista y hora_entrega a pedido como atributos

# Diseño Lógico : 


## Entidades :
Pedidos (#id_pedido, prioridad, tipo_entrega, estado, fecha_prevista , fecha_entrega)

Centro de Distribución (#id_centro, nombre_centro, programa_logístico)

Persona (#id_persona , nombre)

Zona (#id_zona, nombre_zona)

Ruta(#id_ruta, estado, fecha_realización, proporción_pedidos_tipo_de_entrega, cobertura_zonas, cant_pedidos)

Flota(#id_flota,nombre_flota)

Parada(#id_parada, estado_ejecución)

Vehículo(#id_vehículo,capacidad)

Reporte_Entrega(#id_reporte, fecha, entregado , en_tiempo?)

## Entidades Débiles (herencia por tabla por clase)
Persona es la entidad padre. De ella heredan directamente Repartidor y Coordinador.
De Coordinador heredan Logístico, Supervisor Logístico y Administrador.

Repartidor (#id_persona, edad)
FK: #id_persona referencia a Persona

Coordinador (#id_persona, especialidad)
FK: #id_persona referencia a Persona

Logístico (#id_coordinador)
FK: #id_coordinador referencia a Coordinador

Supervisor Logístico (#id_coordinador)
FK: #id_coordinador referencia a Coordinador

Administrador (#id_coordinador)
FK: #id_coordinador referencia a Coordinador

## Interrelaciones  y Agregaciones:
Pertenece (#id_pedido,#id_centro) Cardinalidad:  (1,*): (1,1)
FK: #id_pedido referencia Pedido
FK: #id_centro referencia Centro de Distribución

Ingresa (#id_pedido, #id_persona)  Cardinalidad: (1,*):(1,1)
FK: #id_pedido referencia Pedido
FK: #id_persona referencia Coordinador

Cubre(#id_zona,#id_centro) Cardinalidad: (1,*): (1,*)
FK: #id_zona referencia Zona
FK: #id_centro referencia Centro de Distribución

Asociado(#id_parada,#id_pedido) Cardinalidad (1,1):(1,*)
FK: #id_parada referencia Parada
FK: #id_pedido referencia Pedido

Contener(#id_pedido, #id_ruta) Cardinalidad (1,*):(1,*)
FK: #id_pedido referencia Pedido
FK: #id_ruta referencia Ruta

Crear (#id_ruta, #id_persona, fecha_creacion) Cardinalidad (1,*):(1,1)
FK: #id_ruta referencia Ruta
FK: #id_persona referencia Logístico

Crear_Ruta(#id_centro, #id_persona) Cardinalidad (1,*):(1,*)
FK: #id_centro referencia Centro de Distribución
FK: #id_persona referencia Coordinador

Curbir_Zonas(#id_ruta, #id_zona) Cardinalidad (0,*):(1,*)
FK: #id_ruta referencia Ruta
FK: #id_zona referencia Zona

Asignar(#id_coordinador,#id_repartidor,#id_ruta,fecha) Cardinalidad Coordinador(0,*), Repartidor(0,*), Ruta(0,1)
FK: #id_coordinador referencia Coordinador
FK: #id_repartidor referencia Repartidor
FK: #id_ruta referencia Ruta


Pertenece_Flota(#id_persona,#id_flota) Cardinalidad (1,*):(1,1)
FK: #id_persona referencia Repartidor
FK: #id_flota referencia Flota

Validar (#id_persona,#id_ruta, fecha, aprobado/rechazado, observaciones) Cardinalidad (1,1):(1,*)
FK: #id_persona referencia Supervisor Logístico
FK: #id_ruta referencia Ruta

Pertenecer_Vehículo(#id_vehículo,#id_flota) Cardinalidad (1,*):(1,1)
FK: #id_vehículo referencia Vehículo
FK: #id_flota referencia Flota

Pertenecer_Zona(#id_pedido,#id_zona) Cardinalidad (0,*):(1,1)
FK: #id_pedido Referencia a Pedido
FK: #id_zona Referencia a Zona

Realizar(#id_persona,#id_vehículo,#id_ruta,fecha) Cardinalidad (0,1):(0,1):(0,*)
FK: #id_persona Referencia a Repartidor
FK: #id_vehículo Referencia a Vehiculo
FK: #id_ruta Referencia Ruta

Generar_Reporte(#id_ruta,#id_reporte): Cardinalidad (0,*):(0,1)
FK: #id_ruta Referencia Ruta 
FK: #id_reporte Referencia Reporte_Entrega

Reprogramar (#id_persona1, #id_persona2, #id_pedido, fecha_solicitada, fecha_aceptada) (0,1):(0,*):(0,*)
FK: #id_persona1 referencia a Coordinador Logistico
FK: #id_persona2 referencia a Repartidor
FK: #id_pedido referencia a Pedido


Asignar_Centro(#id_centro,#id_persona) Cardinalidad: (1,*):(1,*)
FK: #id_centro referencia a Centro de Distribución
FK: #id_persona referencia a Repartidor

Validar_Rutas(#id_centro,#id_persona) Cardinalidad (0,*):(1,*)
FK: #id_centro referencia a Centro de Distribución
FK: #id_persona referencia a Coordinador Logístico

Contiene_Parada(#id_ruta,#id_parada) Cardinalidad (1,*):(1,*)
FK: #id_ruta referencia a Ruta
FK: #id_parada referencia a Parada
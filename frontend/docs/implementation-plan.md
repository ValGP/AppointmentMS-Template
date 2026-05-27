# Plan tecnico de implementacion del frontend

Este documento organiza el desarrollo del frontend para el sistema de turnos de BIBE Estetica.

La idea es construir un proyecto fullstack donde el backend actual se mantenga como base estable y el frontend se agregue de manera ordenada, sin interferir con la logica ya implementada.

El frontend se pensara en tres superficies principales:

- Sitio publico del negocio.
- Area de cliente para solicitar y consultar turnos.
- Panel administrativo para operar servicios, profesionales, horarios, bloqueos y turnos.

## 1. Criterio general

El frontend no deberia empezar como una landing decorativa grande. El sistema necesita una experiencia util: mostrar el negocio, permitir que un cliente pida turno y darle al admin una herramienta clara para trabajar.

Toda la aplicacion debe ser responsive desde el inicio. Cada pantalla, layout, formulario, tabla, listado, dashboard y flujo debe poder usarse correctamente en PC de escritorio, notebook, tablet y mobile.

Decision recomendada:

- Priorizar primero el panel administrativo.
- Construir despues el flujo de solicitud de turnos del cliente.
- Dejar el sitio publico simple, elegante y suficiente para presentar el negocio.

Motivo:

- El backend ya tiene mucha capacidad administrativa.
- El negocio necesita cargar servicios, profesionales y horarios antes de que el cliente pueda pedir turnos bien.
- El panel admin permite probar casi todo el backend desde una interfaz real.

## 2. Arquitectura de pantallas

### 2.1 Sitio publico

Ruta sugerida:

```text
/
```

Objetivo:

Mostrar BIBE Estetica como negocio y llevar al usuario hacia la accion principal: solicitar un turno.

Contenido inicial:

- Presentacion del negocio.
- Servicios destacados.
- Informacion basica de contacto.
- Horarios o referencia de atencion.
- Boton para solicitar turno.
- Accesos de login y registro.

Juicio inicial:

La pagina publica deberia ser una SPA o una home dentro de la app, pero no deberia mezclar componentes internos de administracion. Puede convivir en el mismo proyecto React, pero conceptualmente es una superficie separada.

### 2.2 Autenticacion

Rutas sugeridas:

```text
/login
/register
```

Objetivo:

Permitir que clientes y administradores entren al sistema.

Decision recomendada:

Login y registro deben estar fuera de la pagina publica, como rutas propias. No conviene que sean modales dentro de la home en esta etapa, porque despues el flujo de redireccion por rol se vuelve mas confuso.

Comportamiento esperado:

- Si inicia sesion un `ADMIN`, redirigir a `/admin`.
- Si inicia sesion un `CLIENT`, redirigir a `/app`.
- Si un usuario ya autenticado entra a `/login`, redirigir segun su rol.
- Si el login falla, mostrar error claro.

Registro:

- Solo registra clientes.
- Despues de registrarse, el usuario queda logueado automaticamente si el backend devuelve token.
- El token se guarda igual que en login y se redirige al area de cliente.

### 2.3 Area de cliente

Ruta base sugerida:

```text
/app
```

Subrutas sugeridas:

```text
/app/book
/app/appointments
/app/profile
```

Objetivo:

Permitir que el cliente solicite turnos de manera sencilla y consulte sus turnos.

Flujo principal para solicitar turno:

1. Elegir servicio.
2. El sistema sugiere/asigna profesional disponible.
3. Elegir fecha dentro de la ventana visible.
4. Ver horarios disponibles.
5. Confirmar solicitud.
6. Ver estado `PENDING`.

Juicio inicial:

El flujo debe explicar de forma natural que el turno queda pendiente de confirmacion. Esto es importante porque el backend ya define que los turnos creados por cliente nacen como `PENDING`.

Pantallas iniciales:

- Solicitar turno.
- Mis turnos.
- Mi perfil.

Estados importantes:

- Sin servicios disponibles.
- Sin horarios disponibles para la fecha.
- Turno solicitado correctamente.
- Turno pendiente de confirmacion.
- Turno confirmado.
- Turno cancelado.

### 2.4 Panel administrativo

Ruta base sugerida:

```text
/admin
```

Subrutas sugeridas:

```text
/admin/dashboard
/admin/appointments
/admin/calendar
/admin/services
/admin/professionals
/admin/business-hours
/admin/availability-blocks
/admin/clients
```

Objetivo:

Dar al administrador una herramienta de trabajo diaria.

Decision recomendada:

El panel admin debe vivir en una URL especifica (`/admin`) y no necesita un boton publico visible en la home. Si un admin inicia sesion desde `/login`, se lo redirige automaticamente al panel.

Motivo:

- Evita ensuciar la web publica con un acceso interno.
- Mantiene una separacion clara entre cliente y operacion del negocio.
- Sigue siendo facil de acceder para el admin escribiendo `/login` o `/admin`.

Prioridad:

El panel admin deberia ser la primera gran fase del frontend.

## 3. Navegacion y proteccion de rutas

Rutas publicas:

```text
/
/login
/register
```

Rutas protegidas para cliente:

```text
/app/*
```

Rutas protegidas para admin:

```text
/admin/*
```

Reglas:

- Sin token, las rutas protegidas redirigen a `/login`.
- Con token de `CLIENT`, `/admin/*` redirige a `/app`.
- Con token de `ADMIN`, `/app/*` redirige a `/admin`.
- El rol debe obtenerse desde el token o desde `GET /api/users/me`.

Decision recomendada:

Usar `GET /api/users/me` como fuente confiable al iniciar la app. Aunque el token tenga rol, la app debe poder validar usuario activo y datos actuales.

## 3.1 Responsive y adaptacion por dispositivo

La experiencia debe considerarse completa solo si funciona bien en:

- PC de escritorio.
- Notebook.
- Tablet.
- Mobile.

Reglas:

- Los layouts deben adaptarse sin romper contenido ni controles.
- El panel admin debe tener navegacion usable en pantallas chicas, por ejemplo sidebar compacta, navegacion horizontal o drawer segun convenga.
- Las tablas y listados deben transformarse en vistas escaneables en mobile, evitando overflow horizontal obligatorio salvo casos muy justificados.
- Los formularios deben mantener campos, errores y acciones visibles y comodos de usar en pantallas chicas.
- Los botones, inputs, filtros y acciones deben conservar tamanos tactiles razonables.
- No debe haber superposiciones de texto, cards, headers, modales o controles.
- Antes de cerrar cada fase visual o funcional, se debe probar al menos en desktop/notebook y mobile; tablet debe revisarse cuando haya layouts de multiples columnas.

## 3.2 Posibles mejoras UX a evaluar

Esta seccion funciona como lista de ideas para revisar y decidir mas adelante. No implica implementarlas automaticamente.

- En mobile, abrir los formularios de creacion/edicion de catalogos en modal o drawer en lugar de insertarlos dentro de la pagina. Esto puede ser mas comodo cuando hay listados largos de servicios, profesionales, clientes, horarios o bloqueos.
- En desktop, evaluar si conviene mantener formularios inline, usar panel lateral o modal segun la cantidad de campos de cada pantalla.
- Agregar confirmaciones claras antes de desactivar servicios, profesionales, clientes, horarios o bloqueos, explicando que no se borran del historial.
- Evaluar una vista, boton o filtro de "desactivados" al final del listado o en una zona secundaria. La idea es que los elementos inactivos no ensucien la visual principal de trabajo, pero sigan accesibles para consultarlos o reactivarlos cuando haga falta.
- Mejorar busqueda y filtros dentro de catalogos administrativos cuando las listas crezcan.
- Agregar acciones rapidas visibles en mobile sin saturar las cards, por ejemplo editar/desactivar desde un menu compacto.
- Revisar estados vacios para que expliquen el siguiente paso util sin parecer mensajes tecnicos.
- Evaluar feedback visual con toasts o banners despues de crear, editar o desactivar entidades.
- Revisar si algunas pantallas necesitan scroll automatico hacia el formulario cuando se edita desde desktop/tablet y no se usa modal.

## 4. Integracion con backend

Backend actual esperado:

```text
http://localhost:8080
```

Endpoints principales que usara el frontend:

Autenticacion:

```http
POST /auth/login
POST /auth/register
GET /api/users/me
```

Servicios:

```http
GET /api/services
POST /api/services
PUT /api/services/{id}
PATCH /api/services/{id}/activate
PATCH /api/services/{id}/deactivate
```

Profesionales:

```http
GET /api/professionals
POST /api/professionals
PUT /api/professionals/{id}
PATCH /api/professionals/{id}/activate
PATCH /api/professionals/{id}/deactivate
```

Horarios:

```http
GET /api/business-hours
POST /api/business-hours
PUT /api/business-hours/{id}
PATCH /api/business-hours/{id}/activate
PATCH /api/business-hours/{id}/deactivate
```

Bloqueos:

```http
GET /api/availability-blocks
POST /api/availability-blocks
PUT /api/availability-blocks/{id}
PATCH /api/availability-blocks/{id}/activate
PATCH /api/availability-blocks/{id}/deactivate
```

Disponibilidad:

```http
GET /api/availability?professionalId=1&serviceId=2&date=2026-05-26
```

Turnos:

```http
POST /api/appointments
GET /api/appointments
GET /api/appointments/{id}
PATCH /api/appointments/{id}/confirm
PATCH /api/appointments/{id}/reject
PATCH /api/appointments/{id}/cancel-by-client
PATCH /api/appointments/{id}/cancel-by-admin
PATCH /api/appointments/{id}/complete
PATCH /api/appointments/{id}/no-show
```

## 5. Stack frontend recomendado

Decision inicial recomendada:

- React.
- TypeScript.
- Vite.
- React Router.
- TanStack Query para estado de servidor.
- React Hook Form para formularios.
- Zod para validaciones de formulario.
- Un sistema simple de estilos a definir.

Decision tomada:

- React + TypeScript sera la base del frontend.
- TailAdmin se usara como referencia principal o base visual para el panel administrativo, siempre que su estructura tecnica encaje bien.
- El panel debe soportar modo dark y modo light desde el inicio o desde una fase temprana.

Juicio inicial:

Para avanzar rapido y mantener calidad, conviene usar React + TypeScript + Vite. Para UI, Tailwind + componentes propios o shadcn/ui puede funcionar bien, siempre que no se convierta en una dependencia visual rigida. Como es una estetica, el diseno visual importa, pero el admin debe ser sobrio y operativo.

Nota sobre TailAdmin:

TailAdmin gusta visualmente y puede servir como punto de partida para el panel administrativo si su licencia y estructura encajan con el proyecto. La decision tecnica no debe tomarse solo por apariencia: hay que revisar si permite integrarse bien con React, TypeScript, React Router, formularios, estados de carga, tablas y permisos por rol sin pelearse con la arquitectura.

El objetivo no es copiar una plantilla generica sin adaptacion. La idea es replicar/adaptar su lenguaje visual al sistema de turnos:

- Sidebar operativo.
- Header con busqueda o acciones utiles.
- Tarjetas de resumen.
- Tablas y listados limpios.
- Dark/light mode.
- Componentes reutilizables para formularios, filtros y estados.

Decision visual inicial:

- El estilo general buscado sera premium y calido.
- El diseno visual se definira con mas detalle cuando llegue la fase correspondiente.
- Antes de empezar la fase de sitio publico o pulido visual, se debe pausar y definir criterios de estetica, paleta, tono, componentes y referencias visuales.

## 6. Diseno de experiencia por rol

### 6.1 Visitante

Puede:

- Ver informacion del negocio.
- Ver servicios destacados.
- Ir a login.
- Registrarse.
- Iniciar solicitud de turno.

No puede:

- Confirmar turno sin autenticarse.
- Ver disponibilidad sin autenticarse.
- Avanzar en el flujo de reserva sin cuenta.

Decision tomada:

El visitante puede ver informacion publica y servicios, pero no puede consultar disponibilidad ni solicitar turnos sin registrarse o iniciar sesion.

Recomendacion:

La home y la seccion de servicios deben vender bien lo que ofrece el negocio. El flujo de turno empieza realmente despues de autenticarse, para evitar guardar selecciones temporales de visitantes y simplificar la consistencia de disponibilidad.

### 6.2 Cliente

Puede:

- Solicitar turno.
- Ver sus turnos.
- Cancelar sus turnos cuando el backend lo permita.
- Ver su perfil.
- Ver disponibilidad solo despues de iniciar sesion.

No puede:

- Modificar servicios.
- Modificar profesionales.
- Confirmar turnos.
- Ver turnos de otros clientes.
- Elegir profesional en el MVP.

Decision tomada:

El sistema sugerira/asignara el profesional disponible para el primer MVP. La seleccion manual de profesional queda como mejora futura porque en otros negocios puede ser importante.

### 6.3 Administrador

Puede:

- Ver resumen de turnos.
- Ver agenda.
- Confirmar, rechazar, cancelar, completar y marcar no-show.
- Crear turnos manuales.
- Gestionar clientes desde el primer MVP.
- Administrar servicios.
- Administrar profesionales.
- Administrar horarios laborales.
- Administrar bloqueos de agenda.
- Consultar historial.

No necesita:

- Un boton publico visible en la home.
- Registro publico como admin.

## 7. Fases de implementacion

### Fase 0 - Preparacion del proyecto frontend

Objetivo:

Crear la base tecnica del frontend sin implementar todavia todas las pantallas.

Tareas:

- Crear proyecto Vite + React + TypeScript.
- Configurar estructura de carpetas.
- Configurar router.
- Configurar cliente HTTP.
- Configurar manejo de token.
- Configurar layout publico, layout cliente y layout admin.
- Configurar variables de entorno.
- Crear estilos base.

Salida esperada:

- La app levanta localmente.
- Existen rutas base.
- Se puede navegar entre pantallas placeholder.

### Fase 1 - Autenticacion y sesion

Objetivo:

Conectar login, registro y usuario actual contra el backend.

Tareas:

- Pantalla de login.
- Pantalla de registro.
- Guardado de token.
- Carga de usuario actual con `/api/users/me`.
- Redireccion segun rol.
- Proteccion de rutas.
- Logout.

Salida esperada:

- Admin entra a `/admin`.
- Cliente entra a `/app`.
- Rutas protegidas funcionan.

### Fase 2 - Panel admin base

Objetivo:

Construir la estructura operativa del admin.

Tareas:

- Layout admin con navegacion lateral o superior.
- Dashboard inicial.
- Listado de turnos de la semana actual y la semana siguiente.
- Acciones rapidas.
- Manejo de estados de carga y error.
- Evaluar TailAdmin como base visual y tecnica del shell administrativo.

Salida esperada:

- El admin tiene una base real para operar.

### Fase 3 - Catalogos administrativos

Objetivo:

Permitir configurar la informacion necesaria para operar la agenda.

Tareas:

- CRUD de servicios.
- CRUD de profesionales.
- Gestion de clientes desde admin.
- CRUD de horarios laborales.
- CRUD de bloqueos de agenda.
- Activar/desactivar entidades.
- Formularios con validaciones.
- Mensajes de error del backend legibles.

Salida esperada:

- El admin puede preparar el sistema para recibir turnos.

### Fase 4 - Agenda y turnos admin

Objetivo:

Permitir al admin gestionar turnos desde una interfaz clara.

Tareas:

- Listado filtrable de turnos.
- Vista tipo agenda/listado, no calendario complejo en el MVP.
- Mostrar inicialmente turnos de la semana actual y la semana siguiente.
- Crear turno manual.
- Confirmar turno pendiente.
- Rechazar turno pendiente.
- Cancelar turno.
- Completar turno.
- Marcar no-show.
- Filtros por fecha, profesional, cliente y estado.

Salida esperada:

- El admin puede operar el ciclo completo de turnos.

### Fase 5 - Flujo cliente para solicitar turno

Objetivo:

Permitir que un cliente pida turno con pocos pasos.

Tareas:

- Selector de servicio.
- Profesional sugerido/asignado por el sistema.
- Calendario de fecha.
- Limitar fechas visibles a la semana actual y la semana siguiente.
- Definir visualmente si el cliente ve solo dias seleccionables o tambien indicadores de dias con turnos disponibles.
- Consulta de disponibilidad.
- Selector de horario.
- Confirmacion de solicitud.
- Pantalla de resultado.

Salida esperada:

- El cliente puede crear un turno `PENDING`.

### Fase 6 - Area cliente

Objetivo:

Completar la experiencia minima del cliente.

Tareas:

- Mis turnos.
- Cancelar turno propio.
- Ver estado del turno.
- Perfil basico.

Salida esperada:

- El cliente puede consultar y administrar sus reservas basicas.

### Fase 7 - Sitio publico

Objetivo:

Dejar presentable la cara publica del negocio.

Tareas:

- Home del negocio.
- Seccion de servicios organizada por tipos o categorias.
- Detalle publico de servicios con texto y, mas adelante, imagenes.
- CTA para pedir turno.
- Contacto.
- Ajuste responsive.
- Pulido visual.

Salida esperada:

- La app tiene una entrada publica coherente con BIBE Estetica.

Estructura publica inicial:

- Inicio/Home.
- Servicios organizados por categorias.
- Turno, que lleva a login/registro si el usuario no esta autenticado.
- Contacto.

### Fase 8 - Pulido y calidad

Objetivo:

Cerrar MVP frontend con estabilidad.

Tareas:

- Revisar responsive.
- Revisar posibles mejoras UX anotadas en la seccion 3.2 y decidir cuales entran al MVP.
- Revisar errores y estados vacios.
- Revisar accesibilidad basica.
- Revisar consistencia visual.
- Agregar tests donde tenga sentido.
- Documentar setup.
- Probar flujo completo con backend local.

Salida esperada:

- Frontend usable para demo y desarrollo posterior.

## 8. Estructura de carpetas sugerida

```text
src
|-- app
|   |-- router
|   |-- providers
|   |-- layouts
|-- features
|   |-- auth
|   |-- public-site
|   |-- client
|   |-- admin
|   |-- services
|   |-- professionals
|   |-- business-hours
|   |-- availability-blocks
|   |-- appointments
|-- shared
|   |-- api
|   |-- components
|   |-- hooks
|   |-- utils
|   |-- types
|-- styles
```

Regla:

Agrupar por feature para que el proyecto no se convierta en una carpeta gigante de componentes sueltos.

## 9. Decisiones tomadas provisionalmente

- El frontend tendra tres superficies: publico, cliente y admin.
- React + TypeScript sera la base del frontend.
- TailAdmin sera referencia principal o posible base visual del panel admin.
- El panel admin debera contemplar modo dark y light.
- El panel admin vivira en `/admin`.
- No habra boton publico visible hacia admin en la home.
- Login y registro tendran rutas propias.
- El login redirige segun rol.
- El registro deja al cliente logueado automaticamente si recibe token.
- Las rutas protegidas redirigen estrictamente segun rol.
- El admin sera la primera prioridad fuerte del frontend.
- El primer objetivo funcional sera el panel admin.
- El admin podra gestionar clientes desde el primer MVP.
- El cliente solicitara turnos que nacen como `PENDING`.
- El visitante podra ver servicios publicos, pero no disponibilidad.
- La solicitud de turno requiere usuario autenticado.
- El sistema sugerira/asignara profesional en el MVP.
- La seleccion manual de profesional queda como mejora futura.
- La vista de turnos sera agenda/listado, no calendario complejo al inicio.
- El admin y el cliente trabajaran inicialmente con semana actual y semana siguiente.
- Los servicios seran principalmente texto en el MVP.
- El sitio publico tendra Inicio/Home, Servicios, Turno y Contacto.
- El estilo visual buscado sera premium y calido.
- El sitio publico sera simple al inicio.
- El frontend sera parte del proyecto fullstack, separado del backend.

## 10. Decisiones pendientes

Estas decisiones se iran cerrando a medida que aparezcan ideas nuevas.

- Nombre visual definitivo del negocio en la UI: `BIBE Estetica`, `BIBE`, u otro.
- Definicion fina del estilo visual premium y calido.
- Definir si TailAdmin se integra como plantilla base o se replica visualmente con componentes propios.
- Definir stack de estilos concreto segun lo que requiera TailAdmin y el proyecto.
- Si los servicios publicos tendran imagenes en una fase posterior.
- Si el sitio publico necesita secciones de promociones, equipo, ubicacion o galeria mas adelante.
- Como sera exactamente el criterio visual antes de la fase de diseno: paleta, tipografias, referencias y tono.
- En el flujo de turnos, definir si la seleccion de fecha muestra solo dias disponibles o si muestra todos los dias con indicadores de disponibilidad.

## 11. Riesgos y criterios de juicio

### Riesgo: empezar por la home y postergar la operacion

Puede dar una app linda pero poco util. El backend ya resuelve reglas operativas; conviene exponerlas primero en admin.

### Riesgo: mezclar cliente y admin en una sola interfaz

Puede volver confusa la navegacion. Mejor separar por rutas y layouts.

### Riesgo: hacer el calendario demasiado complejo al principio

Un calendario completo semanal es atractivo, pero puede demorar. Para MVP se empezara con agenda/listado de turnos y una ventana visible de semana actual y semana siguiente.

### Riesgo: esconder demasiado el admin

No hace falta boton publico, pero `/admin` y redireccion por rol deben ser claros. El admin no deberia depender de recordar URLs raras.

### Riesgo: pedir registro demasiado temprano

Si se fuerza login antes de ver cualquier cosa, puede bajar conversion. La decision tomada equilibra esto: el visitante puede ver informacion y servicios, pero disponibilidad y reserva quedan detras de autenticacion.

### Riesgo: usar una plantilla admin sin adaptarla

TailAdmin puede acelerar el inicio, pero si se copia sin criterio puede imponer estructura, estilos o componentes que despues dificulten formularios, permisos o flujos propios. Debe evaluarse antes de adoptarse.

## 12. Orden recomendado de trabajo inmediato

1. Evaluar integracion tecnica de TailAdmin con React + TypeScript.
2. Crear proyecto frontend.
3. Configurar router y layouts.
4. Implementar login contra backend.
5. Implementar proteccion por rol.
6. Construir shell de `/admin`.
7. Implementar servicios admin.
8. Implementar profesionales admin.
9. Implementar gestion de clientes admin.
10. Implementar horarios y bloqueos.
11. Implementar turnos admin como listado/agenda.
12. Implementar flujo cliente autenticado.
13. Pulir sitio publico.
14. Pausar antes de la fase visual fina para definir estetica.

## 13. Preguntas para la siguiente conversacion

- TailAdmin se puede integrar como base real o conviene replicarlo visualmente con componentes propios?
- Que ajustes necesita TailAdmin para sentirse premium/calido y no generico?
- Para la primera fase admin, arrancamos por servicios/profesionales y despues clientes?
- Que datos exactos deberia poder editar el admin en clientes?
- Como deberia sugerirse/asignarse profesional cuando hay mas de uno disponible?

# BIBE Estetica - Sistema de turnos

Proyecto fullstack para gestionar turnos de BIBE Estetica. El sistema esta pensado con tres superficies:

- Sitio publico del negocio.
- Area de cliente para pedir y consultar turnos.
- Panel administrativo para operar catalogos, disponibilidad y turnos.

## Estado actual

Estado del frontend al cierre de Fase 3:

- Fase 0 - Preparacion del frontend: completada.
- Fase 1 - Autenticacion y sesion: completada.
- Fase 2 - Panel admin base: completada.
- Fase 3 - Catalogos administrativos: completada funcionalmente.
- Siguiente fase: Fase 4 - Agenda y turnos admin.

La Fase 3 quedo cerrada con:

- Servicios: listar, crear, editar, activar y desactivar.
- Profesionales: listar, crear, editar, activar y desactivar.
- Clientes: listar, crear con password, editar, activar y desactivar.
- Horarios laborales: listar, crear, editar, activar y desactivar.
- Bloqueos de agenda: listar, crear, editar, activar y desactivar.
- Dashboard admin dark-first con version light.
- Navegacion responsive con menu hamburguesa en mobile.
- Rutas protegidas por rol.
- Integracion real con backend local.

Quedan anotadas mejoras UX futuras en `frontend/docs/implementation-plan.md`, incluyendo modales/drawers en mobile para formularios, vista de elementos desactivados, confirmaciones, filtros y feedback visual.

## Estructura

```text
.
|-- backend
|   `-- Appointment-Manager-API
|-- frontend
|   |-- docs
|   |-- src
|   `-- package.json
`-- README.md
```

## Backend

Ubicacion:

```text
backend/Appointment-Manager-API
```

Stack principal:

- Java 17 como base del proyecto.
- Spring Boot.
- Spring Web.
- Spring Security con JWT.
- Spring Data JPA.
- PostgreSQL en perfil `dev`.
- H2 en perfil `test`.
- Flyway.
- SpringDoc OpenAPI.

URL local esperada:

```text
http://localhost:8080
```

Swagger:

```text
http://localhost:8080/swagger-ui.html
```

Credenciales admin de desarrollo:

```text
admin@turnos.local / admin1234
```

Comando usado localmente para levantar el backend:

```powershell
C:\Users\vale-\.m2\wrapper\dists\apache-maven-3.9.11\03d7e36a140982eea48e22c1dcac01d8862b2550b2939e09a0809bbc5182a5bc\bin\mvn.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

Tambien puede funcionar con Maven Wrapper desde la carpeta del backend:

```powershell
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

Nota local: en esta maquina el wrapper llego a fallar con `Cannot index into a null array`, por eso se uso Maven desde `.m2`.

Nota de entorno: las verificaciones recientes se corrieron con Java 21 instalado localmente, pero la base documentada del backend es Java 17.

## Frontend

Ubicacion:

```text
frontend
```

Stack principal:

- React.
- TypeScript.
- Vite.
- React Router.
- TanStack Query.
- React Hook Form.
- Zod.
- Lucide React.
- CSS propio.

URL local esperada:

```text
http://127.0.0.1:5173
```

Comandos:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev -- --port 5173
npm.cmd run build
```

Preview correcta para probar la interfaz:

```text
http://127.0.0.1:5173
```

No usar `http://localhost:8080` como preview del frontend: ese puerto corresponde al backend.

## Rutas principales

Publicas:

```text
/
/login
/register
```

Cliente:

```text
/app/book
/app/appointments
/app/profile
```

Admin:

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

Algunas rutas admin todavia son placeholders porque pertenecen a fases siguientes, especialmente agenda/turnos.

## Verificacion reciente

Ultimo cierre funcional de Fase 3:

- `npm.cmd run build`: OK.
- Frontend dev server en `http://127.0.0.1:5173`: OK.
- Backend en `http://localhost:8080/swagger-ui.html`: OK.
- Endpoints reales autenticados:
  - `/api/services`: OK.
  - `/api/professionals`: OK.
  - `/api/clients`: OK.
  - `/api/business-hours`: OK.
  - `/api/availability-blocks`: OK.
- Tests backend:
  - `AdminCatalogControllerTest`: OK.
  - `ClientControllerTest`: OK.

## Proxima fase

Fase 4 - Agenda y turnos admin.

Objetivo:

Permitir al admin operar el ciclo de turnos desde una interfaz clara.

Tareas esperadas:

- Listado filtrable de turnos.
- Vista tipo agenda/listado.
- Mostrar semana actual y semana siguiente.
- Crear turno manual.
- Confirmar turno pendiente.
- Rechazar turno pendiente.
- Cancelar turno.
- Completar turno.
- Marcar no-show.
- Filtros por fecha, profesional, cliente y estado.

## Documentacion importante

- Plan frontend: `frontend/docs/implementation-plan.md`
- README backend: `backend/Appointment-Manager-API/README.md`
- Plan backend: `backend/Appointment-Manager-API/docs/implementation-plan.md`

## Notas de desarrollo

- El frontend debe ser responsive completo: PC, notebook, tablet y mobile.
- El panel admin usa dark mode como base visual y soporta light mode.
- Las entidades administrativas se desactivan en lugar de eliminarse para conservar historial.
- La gestion de elementos desactivados queda como mejora UX posible para no ensuciar la visual principal.
- El sistema se centra primero en organizacion y registro de turnos; precios de servicios existen, pero no son prioridad funcional por ahora.

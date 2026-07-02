# BIBE Estetica - PRD de testing para TestSprite

## 1. Objetivo

Validar las funciones criticas del sistema de turnos de BIBE Estetica desde dos roles:

- Cliente: registro, login, solicitud de turnos, consulta/cancelacion de turnos y edicion de perfil.
- Admin: operacion diaria, configuracion de catalogos, disponibilidad, agenda, creacion de turnos, gestion de estados, clientes y bloqueos.

El test debe comprobar que el sistema permite operar turnos reales sin romper reglas de disponibilidad, roles, estados ni navegacion responsive.

## 2. URLs y entorno esperado

- Frontend local: `http://127.0.0.1:5173`
- Backend local: `http://localhost:8080`
- Swagger backend: `http://localhost:8080/swagger-ui.html`
- Admin dev: `admin@turnos.local` / `admin1234`

Si TestSprite ejecuta pruebas destructivas o crea datos, usar nombres con prefijo `TS QA` y emails unicos con timestamp.

## 3. Roles

### Usuario publico

Puede navegar la web publica, ver categorias de tratamientos, ir a login o registro y no debe poder entrar a rutas privadas.

### Cliente

Puede crear cuenta, iniciar sesion, pedir turnos online, ver sus turnos, cancelar solicitudes o turnos activos y editar datos basicos del perfil.

### Admin

Puede iniciar sesion, usar el panel administrativo, configurar categorias, servicios, profesionales, horarios, bloqueos, clientes y operar turnos.

## 4. Reglas de negocio criticas

- Las rutas `/app/*` requieren rol `CLIENT`.
- Las rutas `/admin/*` requieren rol `ADMIN`.
- Un cliente no debe entrar al panel admin.
- Un admin no debe operar como cliente en `/app/*`.
- Un turno creado por cliente nace como `PENDING`.
- Un turno creado por admin nace como `CONFIRMED`.
- Los turnos `PENDING` y `CONFIRMED` ocupan disponibilidad.
- Los estados `REJECTED`, `CANCELED_BY_CLIENT`, `CANCELED_BY_ADMIN`, `COMPLETED` y `NO_SHOW` son finales o no ocupan disponibilidad.
- La disponibilidad se calcula por categoria, servicio, profesional, horarios laborales, bloqueos y turnos activos.
- Servicios, categorias, profesionales, clientes, horarios y bloqueos se desactivan/reactivan; no se eliminan fisicamente.
- Un servicio con `requiresEvaluation` no debe quedar disponible para reserva online.
- Un servicio no online-bookable no debe aparecer en el flujo de reserva del cliente.
- Un profesional sin horarios no debe generar slots.
- Un bloqueo activo debe quitar disponibilidad del rango bloqueado.
- El backend debe rechazar combinaciones invalidas aunque el frontend intente evitarlas.

## 5. Datos de prueba sugeridos

Crear o reutilizar datos con estos nombres:

- Categoria: `TS QA Facial`
- Servicio online: `TS QA Limpieza Facial`, duracion `30`, precio `1000`, reserva online habilitada.
- Servicio solo admin/evaluacion: `TS QA Evaluacion Capilar`, duracion `45`, precio `0`, requiere evaluacion.
- Profesional general: `TS QA Profesional General`, email `tsqa.pro.general+<timestamp>@example.com`.
- Profesional selectivo: `TS QA Profesional Selectivo`, email `tsqa.pro.selectivo+<timestamp>@example.com`.
- Cliente: `TS QA Cliente <timestamp>`, email `tsqa.cliente+<timestamp>@example.com`, password `TestSprite123`.
- Horario laboral: proxima semana, dia habil, `09:00` a `17:00`.
- Bloqueo: rango de 30 a 60 minutos dentro de un horario laboral futuro.

Evitar usar datos reales de pacientes. Si hay datos existentes, no modificarlos salvo que tengan prefijo `TS QA`.

## 6. Flujos publicos

### 6.1 Home publica

Pasos:

1. Abrir `/`.
2. Verificar que carga la marca BIBE y contenido publico.
3. Navegar por categorias de tratamientos.
4. Entrar a una pagina de categoria usando `/tratamientos/:slug`.
5. Verificar que los CTA de login/registro o reserva no rompen la navegacion.

Resultado esperado:

- No hay errores visuales graves.
- Las imagenes y textos principales cargan.
- La navegacion funciona en desktop y mobile.

### 6.2 Rutas protegidas sin sesion

Pasos:

1. Abrir `/app/book` sin login.
2. Abrir `/admin/dashboard` sin login.

Resultado esperado:

- El usuario es enviado a login o se bloquea el acceso.
- No se muestra informacion privada.

## 7. Autenticacion

### 7.1 Registro de cliente

Pasos:

1. Abrir `/register`.
2. Intentar enviar vacio.
3. Verificar mensajes requeridos.
4. Completar nombre, email unico, password de 8+ caracteres y telefono opcional.
5. Crear cuenta.

Resultado esperado:

- La cuenta se crea con rol cliente.
- El usuario queda logueado y redirigido a `/app/book`.
- Emails duplicados deben mostrar error y no crear otra cuenta.

### 7.2 Login cliente

Pasos:

1. Abrir `/login`.
2. Loguearse con el cliente de prueba.

Resultado esperado:

- Redirige a `/app`.
- `/app` termina en `/app/book`.
- Se ve navegacion de cliente: Pedir turno, Mis turnos, Perfil.

### 7.3 Login admin

Pasos:

1. Abrir `/login`.
2. Loguearse con `admin@turnos.local` / `admin1234`.

Resultado esperado:

- Redirige a `/admin`.
- `/admin` termina en `/admin/dashboard`.
- Se ve navegacion admin: Dashboard, Turnos, Agenda, Servicios, Profesionales, Horarios, Bloqueos, Clientes.

### 7.4 Logout y aislamiento de roles

Pasos:

1. Cerrar sesion desde cliente y desde admin.
2. Como cliente intentar abrir `/admin/dashboard`.
3. Como admin intentar abrir `/app/book`.

Resultado esperado:

- Logout limpia sesion.
- Cada rol queda restringido a sus rutas.

## 8. Flujos de cliente

### 8.1 Solicitar turno online

Precondiciones:

- Existe categoria activa.
- Existe servicio activo y online-bookable.
- Existe profesional activo compatible.
- Existe horario laboral futuro sin bloqueos.

Pasos:

1. Loguearse como cliente.
2. Ir a `/app/book`.
3. Seleccionar categoria.
4. Seleccionar servicio.
5. Seleccionar profesional.
6. Cambiar entre semana actual y proxima si hace falta.
7. Elegir un slot disponible.
8. Revisar modal de confirmacion.
9. Agregar nota opcional.
10. Enviar con `Solicitar turno`.

Resultado esperado:

- Se crea un turno `PENDING`.
- Se navega a `/app/book/success`.
- El turno aparece en `/app/appointments` como Pendiente.
- El horario ya no debe aparecer como disponible para otro turno activo equivalente.

### 8.2 Servicios no reservables online

Pasos:

1. Crear o usar un servicio con `requiresEvaluation` o `onlineBookable=false`.
2. Loguearse como cliente.
3. Ir a `/app/book`.
4. Seleccionar la categoria correspondiente.

Resultado esperado:

- El servicio no aparece como opcion de reserva online.
- Si la categoria no tiene servicios online, se muestra estado vacio claro.

### 8.3 Mis turnos y filtros

Pasos:

1. Ir a `/app/appointments`.
2. Revisar resumen Pendientes, Confirmados e Historial.
3. Usar filtros: Todos, Pendientes, Confirmados, Historial.

Resultado esperado:

- Los turnos se agrupan por estado correctamente.
- Cada tarjeta muestra servicio, fecha/hora, profesional, notas y estado.

### 8.4 Cancelar turno como cliente

Precondicion:

- Cliente tiene un turno `PENDING` o `CONFIRMED`.

Pasos:

1. Abrir `/app/appointments`.
2. Seleccionar `Cancelar solicitud` o `Cancelar turno`.
3. Intentar confirmar sin motivo.
4. Agregar motivo.
5. Confirmar cancelacion.

Resultado esperado:

- Sin motivo muestra error.
- Con motivo cambia a `CANCELED_BY_CLIENT`.
- El turno pasa a historial o deja de estar en proximos activos.
- La disponibilidad se libera si no hay otro turno o bloqueo en ese horario.

### 8.5 Perfil cliente

Pasos:

1. Ir a `/app/profile`.
2. Ver nombre, email, telefono, rol e ID.
3. Intentar editar nombre y telefono.
4. Guardar cambios.
5. Intentar guardar nombre vacio.

Resultado esperado:

- Nombre y telefono se actualizan.
- Email no es editable.
- Nombre vacio muestra error.

## 9. Flujos admin - Dashboard

### 9.1 Vista operativa

Pasos:

1. Loguearse como admin.
2. Abrir `/admin/dashboard`.
3. Revisar metricas: Pendientes, Confirmados, Completados, Total ventana.
4. Revisar lista de turnos proximos.
5. Usar acciones rapidas: Nuevo turno, Registrar cliente, Revisar disponibilidad.
6. Revisar alertas de configuracion.

Resultado esperado:

- Las metricas enlazan a `/admin/appointments` con filtros.
- Las alertas muestran profesionales sin horarios o servicios sin profesionales.
- El boton de actualizar recarga datos sin romper la pagina.

## 10. Flujos admin - Servicios y categorias

### 10.1 Crear categoria

Pasos:

1. Abrir `/admin/services`.
2. Crear categoria con nombre, slug, orden y descripcion.
3. Guardar.

Resultado esperado:

- Categoria aparece en `Categorias de servicios`.
- Categoria activa puede usarse en servicios.
- Campos requeridos muestran errores si se envian vacios.

### 10.2 Crear servicio online

Pasos:

1. En `/admin/services`, click `Nuevo servicio`.
2. Completar nombre, categoria, duracion, precio y descripcion.
3. Dejar `Permitir reserva online` activado.
4. Asignar profesionales en modo `Todos` o `Seleccionar`.
5. Guardar.

Resultado esperado:

- Servicio aparece activo.
- Muestra badge `Reserva online`.
- Si no hay profesionales compatibles, debe mostrar alerta `Sin profesionales`.

### 10.3 Servicio con evaluacion previa

Pasos:

1. Crear o editar servicio.
2. Activar `Requiere evaluacion previa`.
3. Guardar.

Resultado esperado:

- `Permitir reserva online` queda deshabilitado o apagado.
- Servicio muestra badge `Evaluacion previa`.
- No aparece en reserva online del cliente.

### 10.4 Busqueda, orden y filtro de servicios

Pasos:

1. Buscar por nombre.
2. Filtrar por categoria.
3. Ordenar por nombre, categoria y duracion.

Resultado esperado:

- La tabla se actualiza correctamente.
- Si no hay resultados, se muestra estado vacio y accion para limpiar busqueda.

### 10.5 Editar, desactivar y reactivar servicio/categoria

Pasos:

1. Editar servicio y guardar cambios.
2. Desactivar servicio desde menu de acciones.
3. Abrir resumen de inactivos.
4. Reactivar servicio.
5. Intentar desactivar categoria con servicios activos.

Resultado esperado:

- Edicion persiste.
- Desactivar no borra historial.
- Reactivar vuelve a mostrar el item.
- Si backend rechaza desactivar categoria por dependencias, se muestra error claro.

## 11. Flujos admin - Profesionales

### 11.1 Crear profesional para todos los servicios

Pasos:

1. Abrir `/admin/professionals`.
2. Crear profesional con nombre, email y telefono.
3. Dejar modo `Todos`.
4. Guardar.

Resultado esperado:

- Profesional aparece activo.
- Si no tiene horarios, muestra badge `Sin horarios`.
- Puede aparecer como compatible para servicios activos.

### 11.2 Profesional con servicios seleccionados

Pasos:

1. Crear o editar profesional.
2. Cambiar a modo `Seleccionar`.
3. Filtrar servicios por categoria.
4. Marcar al menos un servicio.
5. Guardar.
6. Revisar Agenda con un servicio asignado y uno no asignado.

Resultado esperado:

- Profesional solo aparece para servicios compatibles.
- Guardar sin servicios seleccionados debe mostrar error.

### 11.3 Busqueda, orden, editar, desactivar y reactivar profesional

Pasos:

1. Buscar por nombre, email o telefono.
2. Ordenar por nombre o email.
3. Editar datos.
4. Desactivar y confirmar.
5. Abrir inactivos y reactivar.

Resultado esperado:

- Los cambios persisten.
- Profesional inactivo no aparece para nuevos turnos/disponibilidad.
- Historial previo se conserva.

## 12. Flujos admin - Horarios laborales

### 12.1 Crear horario

Pasos:

1. Abrir `/admin/business-hours`.
2. Seleccionar profesional activo.
3. Click `Nuevo horario`.
4. Elegir dia, inicio y fin.
5. Guardar.

Resultado esperado:

- Horario aparece activo para ese profesional.
- La agenda genera slots dentro del rango.
- Rango invalido o solapado debe mostrar error.

### 12.2 Editar, ordenar, desactivar y reactivar horario

Pasos:

1. Ordenar por dia/hora.
2. Editar inicio/fin.
3. Desactivar horario.
4. Abrir inactivos y reactivar.

Resultado esperado:

- Desactivar horario deja de generar disponibilidad.
- Reactivar vuelve a generar slots si no hay bloqueos/turnos activos.

## 13. Flujos admin - Agenda

### 13.1 Revisar disponibilidad semanal

Pasos:

1. Abrir `/admin/calendar`.
2. Seleccionar categoria.
3. Seleccionar servicio.
4. Seleccionar profesional compatible.
5. Cambiar semana anterior/siguiente.
6. Restablecer filtros.

Resultado esperado:

- Se muestran slots disponibles y turnos ocupados por semana.
- Si faltan datos, se muestran estados vacios utiles con links a Servicios, Profesionales u Horarios.
- Profesionales incompatibles no aparecen.

### 13.2 Crear turno con cliente existente

Precondiciones:

- Existe cliente activo.
- Hay slot disponible.

Pasos:

1. En Agenda, seleccionar slot disponible.
2. Elegir `Cliente existente`.
3. Seleccionar cliente.
4. Agregar notas opcionales.
5. Crear turno.

Resultado esperado:

- Turno queda `CONFIRMED`.
- Slot pasa a ocupado.
- Turno aparece en `/admin/appointments`.

### 13.3 Crear cliente nuevo y turno

Pasos:

1. En Agenda, seleccionar slot disponible.
2. Elegir `Nuevo cliente`.
3. Completar nombre, telefono, email y password.
4. Crear turno.

Resultado esperado:

- Se crea cliente activo.
- Se crea turno `CONFIRMED`.
- Email duplicado o password menor a 8 caracteres muestra error.

### 13.4 Doble reserva

Pasos:

1. Crear un turno en un slot.
2. Intentar crear otro turno en el mismo slot, si el UI lo permite mediante recarga tardia o sesion paralela.

Resultado esperado:

- El backend rechaza la doble reserva.
- El usuario ve error claro.

## 14. Flujos admin - Turnos

### 14.1 Filtros y listado

Pasos:

1. Abrir `/admin/appointments`.
2. Usar tabs: Todos, Pendientes, Confirmados, Completados, Cancelados.
3. Usar rangos rapidos: Semana actual, Proxima semana, Semana actual + proxima.
4. Filtrar por fecha desde/hasta, estado, profesional y cliente.
5. Usar paginacion si hay mas de una pagina.

Resultado esperado:

- Los filtros se combinan correctamente.
- Los turnos se agrupan por dia.
- `Ver detalle` abre modal con cliente, profesional, servicio, fecha, estado, origen, notas y timestamps.

### 14.2 Confirmar turno pendiente

Precondicion:

- Existe turno `PENDING`, idealmente creado por cliente.

Pasos:

1. Filtrar pendientes.
2. Abrir detalle.
3. Click `Confirmar turno`.
4. Confirmar accion.

Resultado esperado:

- Estado pasa a `CONFIRMED`.
- Se registra confirmacion.
- Sigue ocupando disponibilidad.

### 14.3 Rechazar turno pendiente

Pasos:

1. Abrir detalle de turno `PENDING`.
2. Click `Rechazar turno`.
3. Intentar confirmar sin motivo.
4. Agregar motivo y confirmar.

Resultado esperado:

- Sin motivo muestra error.
- Con motivo pasa a `REJECTED`.
- Se guarda motivo.
- Slot se libera.

### 14.4 Cancelar turno desde admin

Pasos:

1. Abrir detalle de turno `PENDING` o `CONFIRMED`.
2. Click `Cancelar turno`.
3. Ingresar motivo.
4. Confirmar.

Resultado esperado:

- Estado pasa a `CANCELED_BY_ADMIN`.
- Se guarda motivo.
- Slot se libera.

### 14.5 Completar y marcar no asistio

Precondicion:

- Existe turno `CONFIRMED`.

Pasos:

1. Abrir detalle.
2. Ejecutar `Completar turno` y confirmar en un turno.
3. Ejecutar `Marcar no asistio` y confirmar en otro turno confirmado.

Resultado esperado:

- Completar pasa a `COMPLETED`.
- No-show pasa a `NO_SHOW`.
- Estados finales no muestran acciones invalidas.

## 15. Flujos admin - Bloqueos

### 15.1 Crear bloqueo

Pasos:

1. Abrir `/admin/availability-blocks`.
2. Click `Nuevo bloqueo`.
3. Seleccionar profesional.
4. Seleccionar tipo: Vacaciones, Licencia medica, Feriado, Bloqueo manual u Otro.
5. Completar inicio, fin y motivo opcional.
6. Guardar.
7. Revisar Agenda en ese rango.

Resultado esperado:

- Bloqueo aparece activo.
- Los slots superpuestos desaparecen de disponibilidad.
- Rango invalido o superpuesto con turno activo debe mostrar error.

### 15.2 Editar, desactivar y reactivar bloqueo

Pasos:

1. Editar bloqueo.
2. Desactivar bloqueo.
3. Verificar que disponibilidad se libera.
4. Abrir inactivos y reactivar.

Resultado esperado:

- Reactivar vuelve a afectar disponibilidad.
- Historial de bloqueos no se borra.

## 16. Flujos admin - Clientes

### 16.1 Crear cliente desde panel

Pasos:

1. Abrir `/admin/clients`.
2. Click `Nuevo cliente`.
3. Completar nombre, email, telefono y password.
4. Guardar.

Resultado esperado:

- Cliente aparece activo.
- Password es obligatoria al crear.
- Email duplicado muestra error.

### 16.2 Editar cliente

Pasos:

1. Editar cliente.
2. Cambiar nombre/telefono.
3. Dejar password vacia.
4. Guardar.
5. Editar de nuevo con nueva password valida.

Resultado esperado:

- Password vacia al editar no rompe ni fuerza cambio.
- Password nueva requiere minimo 8 caracteres.
- Cambios persisten.

### 16.3 Buscar, ordenar, historial, desactivar y reactivar cliente

Pasos:

1. Buscar por nombre, email o telefono.
2. Ordenar por fecha de alta y nombre.
3. Abrir `Ver historial`.
4. Desactivar cliente.
5. Abrir inactivos y reactivar.

Resultado esperado:

- Historial muestra turnos del cliente con estado.
- Cliente inactivo no debe poder usarse para nuevos turnos.
- Reactivar lo devuelve al flujo normal.

## 17. Responsive y UX transversal

Probar en desktop y mobile:

- Menu publico responsive.
- Menu cliente con hamburguesa.
- Menu admin con hamburguesa.
- Modales no deben quedar cortados ni impedir cerrar.
- Tablas/listados deben ser legibles o adaptarse en mobile.
- Botones de acciones deben tener texto visible o aria-label util.
- No debe haber texto superpuesto, botones fuera de pantalla ni scroll horizontal innecesario.
- El admin debe poder alternar modo claro/oscuro sin perder contexto.

## 18. Errores esperados

Validar que el usuario vea mensajes claros cuando:

- Login falla.
- Registro usa email duplicado.
- Campos requeridos estan vacios.
- Password tiene menos de 8 caracteres.
- Horario laboral tiene rango invalido o solapado.
- Bloqueo tiene rango invalido o se superpone con turno activo.
- Servicio/profesional/cliente esta inactivo.
- Profesional no es compatible con servicio.
- Slot ya no esta disponible.
- Backend no responde.

## 19. Priorizacion de testing

Prioridad alta:

- Auth y restricciones por rol.
- Reserva cliente end-to-end.
- Agenda admin y creacion de turnos.
- Gestion de estados de turnos.
- Disponibilidad: horarios, bloqueos, turnos activos y liberacion.
- Servicios/profesionales compatibles.

Prioridad media:

- Dashboard, filtros, busquedas, ordenamientos.
- Edicion y baja logica de catalogos.
- Perfil cliente e historial cliente.

Prioridad baja:

- Contenido publico detallado de tratamientos.
- Estetica visual fina fuera de errores graves.

## 20. Criterios de aceptacion globales

La prueba se considera exitosa si:

- Cliente puede registrarse, pedir turno, verlo, cancelarlo y editar perfil.
- Admin puede configurar datos minimos, crear disponibilidad, crear turnos y operar estados.
- La disponibilidad se mantiene consistente tras crear, cancelar, rechazar, completar, marcar no-show y bloquear rangos.
- No hay accesos cruzados entre roles.
- Los errores principales se muestran en pantalla y no dejan datos inconsistentes.
- La app funciona en desktop y mobile para los flujos principales.

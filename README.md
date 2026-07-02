# BIBE Estética - Sistema Fullstack de Gestión de Turnos y Disponibilidad

Este es un proyecto **Fullstack** diseñado y desarrollado como un sistema de agendamiento y gestión de disponibilidad en vivo para **BIBE Estética**. La aplicación cuenta con tres superficies diferenciadas (Pública, Cliente y Administración) y está estructurada bajo principios de diseño limpio, separación de conceptos, y un modelo de dominio rico (DDD). 

Sirve como una excelente pieza de portfolio que demuestra la integración real de un backend robusto en **Spring Boot** con un frontend ágil en **React + TypeScript**, respaldado por una suite de pruebas integradas y automatizadas.

---

## 🚀 Arquitectura del Sistema y Superficies

La aplicación está dividida en tres áreas operativas bien delimitadas:

1.  **Sitio Público del Negocio (`/`):**
    *   Landing page moderna que presenta el catálogo de tratamientos divididos en categorías (Facial, Corporal, Capilar, Pestañas, Podología).
    *   Preguntas frecuentes interactivas y llamados a la acción (CTA) integrados para contactar vía WhatsApp o redirigir al portal de agendamiento.
    *   Incorpora un botón flotante de WhatsApp personalizado y adaptativo con micro-animaciones en hover.
2.  **Portal del Cliente (`/app/*`):**
    *   Flujo intuitivo de reserva de turnos en 4 pasos: **Categoría → Servicio → Profesional compatible → Horario disponible (en vivo)**.
    *   Panel de turnos personales clasificados en tres pestañas: solicitudes *Pendientes*, turnos *Confirmados* e *Historial* de turnos pasados.
    *   Permite a los clientes cancelar solicitudes o turnos activos ingresando un motivo obligatorio.
    *   Edición de datos de contacto (Nombre y Teléfono) con validación de formularios mediante **Zod**, manteniendo el correo electrónico bloqueado por integridad de la sesión.
3.  **Panel de Administración (`/admin/*`):**
    *   **Dashboard Operativo:** Visualización de métricas clave del día (Turnos confirmados, pendientes, completados) que enlazan directamente a listas filtradas. Incluye alertas automáticas de configuración (ej. servicios sin profesionales compatibles, profesionales sin horarios de atención).
    *   **Agenda Semanal Interactiva:** Grilla de disponibilidad en vivo por profesional/servicio que permite a la recepcionista agendar un turno confirmado en un slot libre con un solo click. Admite asociar el turno a un cliente existente o registrar un cliente nuevo desde el mismo formulario de reserva.
    *   **Gestión de Catálogos (CRUD completo con Borrado Lógico):**
        *   *Servicios:* Definición de duraciones en minutos, precios y banderas operativas (ej. si requiere evaluación previa o si es reservable online).
        *   *Categorías:* Creación y ordenamiento de categorías. Bloqueo de desactivación si contienen servicios activos.
        *   *Profesionales:* Asignación de servicios en modo híbrido (todos los servicios o sólo selección específica).
        *   *Horarios Laborales:* Bloques de atención semanales configurables por profesional.
        *   *Bloqueos de Agenda:* Excepciones de disponibilidad (licencias, feriados) que invalidan automáticamente los slots del día.
    *   **Control de Estados de Turnos:** Modal de detalle operativo para cambiar estados con confirmación de seguridad y registro de motivos (Confirmar, Rechazar, Cancelar, Completar, No Asistió).
    *   **Historial de Clientes:** Ficha administrativa de clientes con buscador contextual por nombre/email y acceso al historial de turnos individuales en modal.

---

## 🛠️ Stack Tecnológico

### Backend (Appointment-Manager-API)
- **Java 17/21** como lenguaje base del proyecto.
- **Spring Boot 3.3.5** para la infraestructura del framework.
- **Spring Security + JWT** para autenticación y autorización basada en roles (`CLIENT` y `ADMIN`).
- **Spring Data JPA + Hibernate** para persistencia de datos y consultas relacionales.
- **PostgreSQL** como base de datos de producción y desarrollo local.
- **H2 Database** en memoria para aislamiento durante la suite de pruebas.
- **Flyway** para control de versiones y migraciones de esquemas de base de datos.
- **SpringDoc OpenAPI (Swagger)** para la auto-documentación interactiva de los endpoints RESTful.

### Frontend
- **React 19** y **TypeScript** para la lógica estructurada de componentes.
- **Vite** como entorno ágil de compilación y empaquetado.
- **React Router 7** para el enrutamiento SPA y protección de rutas mediante gates de rol.
- **TanStack Query 5 (React Query)** para la sincronización de estados del servidor y almacenamiento en caché.
- **React Hook Form + Zod** para la gestión robusta de formularios y validaciones en el cliente.
- **Lucide React** para el catálogo moderno de íconos vectoriales.
- **CSS Vanilla (Custom CSS)** para máximo control de estilos, diseño responsive adaptado a móviles, soporte completo de temas (Modo Oscuro como base y Modo Claro) y micro-animaciones.

---

## ⚡ Reglas de Negocio Críticas Implementadas

-   **Seguridad de Rutas:** Un cliente autenticado no puede acceder a las rutas `/admin/*`. Un administrador autenticado no puede ingresar al flujo de reservas de `/app/*` (redirecciones automáticas por rol).
-   **Ciclo de Vida de los Turnos:**
    -   Un turno solicitado por un cliente nace como `PENDING`.
    -   Un turno creado manualmente por el administrador nace directamente como `CONFIRMED`.
    -   Sólo los estados `PENDING` y `CONFIRMED` bloquean el cálculo de slots (ocupan disponibilidad).
    -   Estados finales (`REJECTED`, `CANCELED_BY_CLIENT`, `CANCELED_BY_ADMIN`, `COMPLETED`, `NO_SHOW`) liberan la agenda inmediatamente.
-   **Cálculo Dinámico de Disponibilidad:** No se persisten registros vacíos en base de datos. Los slots disponibles se calculan en vivo cruzando la jornada laboral de un profesional, los bloqueos activos, los turnos existentes del día y la duración en minutos del servicio seleccionado.
-   **Compatibilidad Profesional-Servicio:** El sistema filtra en frontend las combinaciones inválidas y el backend valida de forma estricta (retorna `409 Conflict`) si se intenta agendar una sesión con un profesional no capacitado para ese tratamiento específico.
-   **Desactivación Segura (Baja Lógica):** Las entidades nunca se eliminan físicamente de la base de datos para preservar la integridad del historial financiero y operativo del negocio.

---

## 📁 Estructura del Proyecto

```text
.
├── backend
│   └── Appointment-Manager-API
│       ├── docs/                       # Planes técnicos y casos de uso del backend
│       ├── src/main/java/com/turnos/api/
│       │   ├── auth/                   # Autenticación JWT y Login
│       │   ├── appointments/           # Dominio, Servicios y APIs de Turnos
│       │   ├── availability/           # Lógica de Jornadas, Bloqueos y Slots
│       │   ├── professionals/          # Entidades y asignación de Profesionales
│       │   ├── services/               # CRUD de Servicios y Categorías
│       │   ├── users/                  # Clientes e información del perfil
│       │   └── config/                 # Seguridad, CORS y Filtros
│       └── pom.xml                     # Dependencias de Maven
├── frontend
│   ├── docs/                           # Decisiones de producto y roadmap SaaS
│   ├── src/
│   │   ├── app/                        # Router, Providers y Layouts base
│   │   ├── features/                   # Módulos encapsulados por característica (Auth, Admin, Client)
│   │   ├── shared/                     # Componentes y hooks reutilizables
│   │   └── styles/                     # Hojas de estilos personalizadas (global.css)
│   └── package.json                    # Scripts y dependencias de Node.js
└── README.md                           # Documento principal de presentación
```

---

## ⚙️ Guía de Ejecución Local

### Requisitos Previos
- **Java 17 o 21** instalado en el sistema.
- **Node.js** (versión 18 o superior).
- **PostgreSQL** instalado y corriendo con una base de datos vacía llamada `appointment_management`.

### 1. Iniciar el Backend
1. Navega a la carpeta del backend:
   ```bash
   cd backend/Appointment-Manager-API
   ```
2. Configura los parámetros de base de datos en [application-dev.yml](file:///c:/Users/vale-/CodeProjects/Freelance/BIBE-estetica/backend/Appointment-Manager-API/src/main/resources/application-dev.yml) si difieren del usuario `postgres` por defecto.
3. Ejecuta el servidor de desarrollo local usando el wrapper de Maven (se especifica el perfil de desarrollo):
   ```bash
   .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
   ```
4. El backend estará corriendo en `http://localhost:8080` y la documentación interactiva estará disponible en [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html).

*Credenciales iniciales de administrador (creadas automáticamente en el seed):*
- **Usuario:** `admin@turnos.local`
- **Contraseña:** `admin1234`

### 2. Iniciar el Frontend
1. Abre otra terminal y navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm.cmd install
   ```
3. Inicia el servidor de desarrollo local de Vite:
   ```bash
   npm.cmd run dev
   ```
4. El portal estará accesible en el navegador en [http://127.0.0.1:5173](http://127.0.0.1:5173).

---

## 🧪 Estado de Pruebas y Calidad

El proyecto se mantiene con altos estándares de estabilidad técnica:
- **Backend Testing:** Suite automatizada de **84 pruebas de integración y unitarias** que verifican transiciones de estado inválidas, reglas de solapamiento y permisos de seguridad. Todos los tests corren y pasan exitosamente vía `.\mvnw.cmd test`.
- **Frontend E2E Testing:** Cuenta con scripts funcionales basados en **Playwright y Python** (ubicados en `testsprite_tests/`) diseñados para simular flujos de usuario completos de reserva, registro y transiciones de turnos en el navegador.

---

## 📈 Próximos Pasos (Camino a SaaS)

El sistema ha sido estructurado para evolucionar fácilmente hacia un producto de software como servicio (**SaaS Multi-tenant**). El plan técnico detallado se encuentra en [roadmap-saas-local-turnos.md](file:///c:/Users/vale-/CodeProjects/Freelance/BIBE-estetica/frontend/docs/roadmap-saas-local-turnos.md) e incluye:
1.  **Aislamiento de Datos:** Añadir la entidad `Business` (inquilino/tenant) y propagar `business_id` en las tablas relacionales filtradas automáticamente por contextos de Spring Security.
2.  **Reserva Sencilla (Fricción Cero):** Flujo de agendamiento rápido para clientes finales sin obligación de crear contraseñas.
3.  **Configurador Visual:** Permitir a cada negocio elegir un preset estético (ej. Rosa Estética, Azul Salud, Negro Premium) y cargar su propio logo y enlace a WhatsApp de contacto.

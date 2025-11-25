# Event Platform - Full Stack Application

Plataforma Full-Stack de Gestión de Eventos y Boletos desarrollada con PostgreSQL, Node.js/Express y React/Vite.

## 🚀 Tecnologías

### Backend
- Node.js con Express
- PostgreSQL (con Docker)
- ES Modules (import/export)
- JWT para autenticación
- bcrypt para hash de contraseñas

### Frontend
- React 18
- Vite
- React Router DOM
- Bootstrap & React Bootstrap
- Axios
- Context API para gestión de estado

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- Docker y Docker Compose
- npm o yarn

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd event-platform
```

### 2. Configurar la Base de Datos

#### Iniciar PostgreSQL con Docker

```bash
docker-compose up -d
```

Esto iniciará PostgreSQL en el puerto 5432

#### Inicializar la Base de Datos

Ejecuta el script SQL de inicialización:

```bash
# Opción 1: Usando psql desde Docker
docker exec -i postgres_db psql -U postgres -d eventplatform < database/init.sql

# Opción 2: Usando psql local (si tienes PostgreSQL instalado)
psql -h localhost -U postgres -d eventplatform -f database/init.sql
```

El script creará:
- Tablas: roles, users, categories, events, images, tickets
- Roles por defecto (administrator ID=5, member ID=2)
- Categorías de eventos

### 3. Configurar el Backend

```bash
cd backend
npm install
```

### 4. Configurar el Frontend

```bash
cd frontend
npm install
```

## 🎯 Ejecutar la Aplicación

### Iniciar el Backend

```bash
cd backend
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

### Iniciar el Frontend

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en: `http://localhost:5175`

## 👥 Usuarios de Prueba

## 🎨 Características

### Para Usuarios
- ✅ Registro e inicio de sesión
- ✅ Visualización de eventos destacados
- ✅ Búsqueda y filtrado por categorías
- ✅ Detalle de eventos
- ✅ Navegación por categorías

### Para Administradores
- ✅ Panel de administración completo
- ✅ Crear, editar y eliminar eventos
- ✅ Gestión de usuarios y roles
- ✅ Reportes de ventas y estadísticas
- ✅ Dashboard con métricas

## 📁 Estructura del Proyecto

```
event-platform/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   ├── adminEventController.js
│   │   ├── adminUserController.js
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── eventController.js
│   │   └── reportController.js
│   ├── database/
│   │   ├── adminEventQueries.js
│   │   ├── categoryQueries.js
│   │   ├── db.js
│   │   ├── eventQueries.js
│   │   └── userQueries.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── eventRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminEventList.jsx
│   │   │   ├── AdminReports.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── AdminUserList.jsx
│   │   │   ├── Carousel.jsx
│   │   │   ├── CreateEventForm.jsx
│   │   │   ├── EditEventForm.jsx
│   │   │   ├── EventCard.jsx
│   │   │   ├── EventDetail.jsx
│   │   │   ├── EventList.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── init.sql
├── docker-compose.yml
└── README.md
```

## 🔐 Seguridad

- Las contraseñas se hashean con bcrypt (10 rounds)
- Autenticación basada en JWT
- Middleware de protección de rutas
- Separación de roles (administrator vs member)
- CORS configurado para el frontend

## 🌐 API Endpoints

### Públicos
- `GET /api/events/featured` - Eventos destacados
- `GET /api/events` - Lista de eventos
- `GET /api/events/category/:slug` - Eventos por categoría
- `GET /api/event/:slug` - Detalle de evento
- `GET /api/categories` - Lista de categorías

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### Admin (requiere autenticación y rol de administrador)
- `GET /api/admin/events` - Todos los eventos (admin)
- `POST /api/admin/events` - Crear evento
- `PUT /api/admin/events/:id` - Actualizar evento
- `DELETE /api/admin/events/:id` - Eliminar evento
- `GET /api/admin/users` - Lista de usuarios
- `PUT /api/admin/users/:userId/role` - Cambiar rol de usuario
- `GET /api/admin/reports` - Reportes y estadísticas

## 🧪 Testing

Este proyecto incluye un conjunto completo de pruebas unitarias y de integración con cobertura mínima del 80%.

### Ejecutar Pruebas

```bash
cd backend

# Instalar dependencias de testing
npm install

# Ejecutar todas las pruebas
npm test

# Ejecutar solo pruebas unitarias
npm run test:unit

# Ejecutar solo pruebas de integración
npm run test:integration

# Ejecutar con reporte de cobertura
npm run test:coverage
```

### Configuración de Base de Datos de Pruebas

```bash
# Crear base de datos de pruebas
docker exec -i postgres_db psql -U postgres -c "CREATE DATABASE eventplatform_test;"

# Inicializar esquema
docker exec -i postgres_db psql -U postgres -d eventplatform_test < database/init.sql
```

### Cobertura de Código

- Mínimo requerido: **80%** en todas las métricas
- Las pruebas incluyen:
  - ✅ Pruebas unitarias de controladores
  - ✅ Pruebas de integración con base de datos real
  - ✅ Validación de seguridad (autenticación/autorización)
  - ✅ Pruebas de flujos completos (registro, login, eventos, compras)

Ver documentación completa en: [`backend/TESTING.md`](backend/TESTING.md)

## 🔄 CI/CD

El proyecto incluye GitHub Actions que ejecuta automáticamente:
- Todas las pruebas unitarias
- Todas las pruebas de integración
- Análisis de cobertura de código
- Verificación de umbral del 80%

El workflow se ejecuta en cada:
- Push a ramas `main` o `develop`
- Pull request a ramas `main` o `develop`

## 📄 Licencia

Este proyecto fue desarrollado como parte del curso de Proyectos - Universidad Galileo.

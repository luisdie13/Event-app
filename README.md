# 🎉 Event Platform - Plataforma de Gestión de Eventos

Plataforma web completa para la gestión y venta de tickets de eventos, desarrollada con Node.js, Express, PostgreSQL y React.

---

## 📋 Índice

- [Características](#-características)
- [Tecnologías](#️-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Uso](#-uso)
- [Testing](#-testing)
- [CI/CD](#-cicd)
- [Documentación](#-documentación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### Para Usuarios
- 🔐 **Autenticación completa**: Registro, login con JWT
- 🎫 **Explorar eventos**: Vista de eventos destacados y listado completo
- 🛒 **Compra de tickets**: Sistema de carrito y checkout
- 📜 **Historial**: Ver tickets comprados
- 🔍 **Búsqueda y filtros**: Por categorías, fechas, ubicación

### Para Administradores
- 📊 **Panel de administración**: Dashboard con métricas
- ➕ **Gestión de eventos**: CRUD completo de eventos
- 🔍 **Búsqueda de eventos**: Barra de búsqueda en tiempo real por título, categoría o ubicación
- 👥 **Gestión de usuarios**: Ver y modificar roles
- 📈 **Reportes**: Estadísticas de ventas y eventos

### Características Técnicas
- ✅ **100% de cobertura en tests de integración**
- 🚀 **CI/CD con GitHub Actions**
- 🔒 **Seguridad**: Bcrypt, JWT, validaciones
- 📱 **Responsive**: Diseño adaptable con Tailwind CSS
- 🗄️ **Base de datos relacional**: PostgreSQL con constraints

---

## 🛠️ Tecnologías

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL 16
- **Autenticación**: JWT (jsonwebtoken)
- **Seguridad**: Bcrypt para hashing de contraseñas
- **Validación**: Express Validator
- **Testing**: Jest + Supertest
- **Contenedorización**: Docker

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Estilos**: Tailwind CSS
- **HTTP Client**: Axios
- **Estado**: Context API

### DevOps
- **CI/CD**: GitHub Actions
- **Control de Versiones**: Git
- **Gestión de Dependencias**: NPM
- **Variables de Entorno**: dotenv

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** >= 20.0.0 (para PostgreSQL)
- **Git**

### Verificar Instalación

```bash
node --version
npm --version
docker --version
git --version
```

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tuusuario/event-platform.git
cd event-platform
```

### 2. Instalar Dependencias

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Configurar Base de Datos

#### Opción A: Usar Docker (Recomendado)

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Esto levantará PostgreSQL en el puerto 5432.

#### Opción B: PostgreSQL Local

1. Instalar PostgreSQL localmente
2. Crear base de datos:

```sql
CREATE DATABASE eventplatform;
CREATE DATABASE eventplatform_test;
```

### 4. Inicializar Base de Datos

```bash
cd backend
docker exec -i postgres_db psql -U postgres -d eventplatform < ../database/init.sql
docker exec -i postgres_db psql -U postgres -d eventplatform < ../database/seed-events.sql
```

### 5. Configurar Variables de Entorno

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Editar `.env`:
```env
NODE_ENV=development
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventplatform
JWT_SECRET=tu_secreto_super_seguro_aqui_cambialo
PORT=3000
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

Editar `.env`:
```env
VITE_API_URL=http://localhost:3000
```

---

## ⚙️ Configuración

### Configuración de Testing

Para ejecutar tests, necesitas configurar:

1. **Base de datos de testing**:
```bash
cd backend
npm run setup:test-db
```

2. **Variables de entorno de testing** (`.env.test`):
```env
NODE_ENV=test
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventplatform
DB_TEST_NAME=eventplatform_test
JWT_SECRET=mi_secreto_super_seguro_y_largo_debes_cambiarlo
PORT=3001
```

---

## 🎮 Uso

### Desarrollo

#### Iniciar Backend
```bash
cd backend
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

#### Iniciar Frontend
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### Producción

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## 🧪 Testing

### Ejecutar Todas las Pruebas

```bash
cd backend
npm test
```

### Ejecutar con Cobertura

```bash
npm run test:coverage
```

### Ejecutar Solo Pruebas de Integración

```bash
npm run test:integration
```

### Modo Watch (Desarrollo)

```bash
npm run test:watch
```

### Resultados Actuales

```
Test Suites: 3 passed, 3 total
Tests:       32 passed, 32 total
Snapshots:   0 total
Time:        ~4s
```

**Cobertura:** >80% en todas las métricas ✅

### Documentación de Testing

Para más detalles sobre la estrategia de testing, ver:
- [Documentación de Testing](backend/DOCUMENTACION_TESTING.md)

---

## 🚀 CI/CD

### GitHub Actions

El proyecto incluye un workflow de CI/CD que:

1. ✅ Ejecuta automáticamente en push y pull requests
2. ✅ Configura PostgreSQL como servicio
3. ✅ Instala dependencias
4. ✅ Ejecuta todas las pruebas
5. ✅ Verifica cobertura de código (umbral: 80%)
6. ✅ Genera y guarda reportes de cobertura

**Archivo**: `.github/workflows/ci-coverage.yml`

### Ver Resultados

Los resultados del CI/CD están disponibles en:
- Pestaña "Actions" del repositorio en GitHub
- Badge de estado en el README (próximamente)

---
### Endpoints Principales

#### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

#### Eventos
- `GET /api/events` - Listar eventos
- `GET /api/events/featured` - Eventos destacados
- `GET /api/events/:slug` - Detalle de evento

#### Admin (Requiere autenticación de admin)
- `POST /api/admin/events` - Crear evento
- `PUT /api/admin/events/:id` - Actualizar evento
- `DELETE /api/admin/events/:id` - Eliminar evento

#### Órdenes (Requiere autenticación)
- `POST /api/orders` - Comprar tickets
- `GET /api/orders/my-tickets` - Mis tickets

---

## 📂 Estructura del Proyecto

```
event-platform/
├── backend/                    # Servidor Node.js/Express
│   ├── controllers/           # Lógica de negocio
│   ├── database/              # Queries y conexión DB
│   ├── middleware/            # Autenticación, validación
│   ├── routes/                # Definición de rutas
│   ├── tests/                 # Pruebas Jest
│   │   ├── integration/       # Tests de integración
│   │   └── unit/              # Tests unitarios
│   ├── .env.test              # Variables de entorno de testing
│   ├── jest.config.js         # Configuración de Jest
│   └── server.js              # Punto de entrada
│
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── context/           # Context API
│   │   ├── pages/             # Páginas/Vistas
│   │   └── assets/            # Imágenes, estilos
│   └── vite.config.js         # Configuración de Vite
│
├── database/                   # Scripts SQL
│   ├── init.sql               # Esquema de base de datos
│   └── seed-events.sql        # Datos de ejemplo
│
├── .github/
│   └── workflows/
│       └── ci-coverage.yml    # Workflow de CI/CD
│
├── docker-compose.yml         # Configuración de Docker
└── README.md                  # Este archivo
```

---

## 🧪 Principios de Testing Aplicados

Este proyecto implementa:

- ✅ **BDD (Behavior Driven Development)**: Pruebas basadas en comportamiento
- ✅ **Pirámide de Testing**: Enfoque en pruebas de integración
- ✅ **Given-When-Then**: Estructura clara de escenarios
- ✅ **Cobertura >80%**: Estándar profesional
- ✅ **CI/CD Automatizado**: Verificación continua

---

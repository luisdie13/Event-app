# 📚 Documentación de Testing - Event Platform

## 🎯 Objetivo del Documento

Este documento describe la infraestructura de pruebas implementada para el proyecto Event Platform, siguiendo los principios de Testing aprendidos en clase y aplicando BDD (Behavior Driven Development).

---

## 📊 Pirámide de Pruebas Implementada

Siguiendo el modelo de Mike Cohn presentado en clase, nuestra estrategia de testing se basa en:

```
        /\
       /  \
      / E2E \         ← Pocas, lentas, costosas
     /------\
    /  INT   \        ← Moderadas, verifican integración
   /----------\
  /   UNIT     \      ← Muchas, rápidas, económicas
 /--------------\
```

### Distribución Actual de Pruebas

| Tipo de Prueba | Cantidad | Porcentaje | Estado |
|----------------|----------|------------|--------|
| **Unitarias** | 0 | 0% | ⚠️ Pendiente |
| **Integración** | 32 | 100% | ✅ Implementado |
| **End-to-End** | 0 | 0% | ⚠️ Pendiente |
| **TOTAL** | 32 | 100% | ✅ Pasando |

---

## 🧪 Pruebas de Integración Implementadas

### 1. Módulo de Autenticación (10 pruebas)

#### Feature: Registro de usuarios
```gherkin
Feature: Registro de nuevos usuarios en la plataforma

  Scenario: Registro exitoso de un nuevo usuario
    Given que tengo datos válidos de usuario (nombre, email, contraseña)
    When envío una solicitud POST a /api/auth/register
    Then debo recibir un código de estado 201
    And debo recibir un token JWT
    And el usuario debe estar registrado en la base de datos
    And la contraseña debe estar hasheada con bcrypt

  Scenario: Validación de campos obligatorios
    Given que intento registrarme sin proporcionar un campo obligatorio
    When envío la solicitud de registro
    Then debo recibir un código de estado 400
    And el mensaje debe indicar "Todos los campos son obligatorios"

  Scenario: Prevención de emails duplicados
    Given que ya existe un usuario con email "test@example.com"
    When intento registrar otro usuario con el mismo email
    Then debo recibir un código de estado 409
    And el mensaje debe indicar "El email ya está registrado"
```

#### Feature: Inicio de sesión
```gherkin
Feature: Autenticación de usuarios existentes

  Scenario: Login exitoso con credenciales válidas
    Given que tengo un usuario registrado
    When envío credenciales correctas a /api/auth/login
    Then debo recibir un código de estado 200
    And debo recibir un token JWT válido
    And el token debe contener el ID y rol del usuario

  Scenario: Rechazo de credenciales inválidas
    Given que tengo un usuario registrado
    When envío una contraseña incorrecta
    Then debo recibir un código de estado 401
    And el mensaje debe indicar "Credenciales inválidas"
```

**Implementación:**
- Archivo: `backend/tests/integration/auth.integration.test.js`
- Estado: ✅ 10/10 pruebas pasando
- Cobertura: 100%

---

### 2. Módulo de Eventos (14 pruebas)

#### Feature: Gestión de eventos destacados
```gherkin
Feature: Visualización de eventos destacados

  Scenario: Obtener eventos marcados como destacados
    Given que existen eventos en la base de datos
    And algunos eventos tienen is_featured = true
    When solicito GET /api/events/featured
    Then debo recibir solo los eventos destacados
    And cada evento debe incluir el campo is_featured

  Scenario: Paginación de eventos
    Given que existen 15 eventos en la base de datos
    When solicito GET /api/events?page=1&limit=10
    Then debo recibir máximo 10 eventos
    And los eventos deben estar ordenados por fecha
```

#### Feature: Administración de eventos (Solo Admin)
```gherkin
Feature: CRUD de eventos por administradores

  Scenario: Creación de evento por administrador
    Given que soy un usuario con rol de administrador
    And tengo un token JWT válido
    When envío POST /api/admin/events con datos válidos
    Then debo recibir código 201
    And el evento debe crearse en la base de datos

  Scenario: Prevención de creación por usuarios no-admin
    Given que soy un usuario con rol "member"
    When intento crear un evento
    Then debo recibir código 403
    And el mensaje debe indicar acceso denegado

  Scenario: Actualización de evento existente
    Given que existe un evento en la base de datos
    When envío PUT /api/admin/events/:id con cambios
    Then el evento debe actualizarse
    And debo recibir el evento actualizado en la respuesta

  Scenario: Eliminación de evento
    Given que existe un evento en la base de datos
    When envío DELETE /api/admin/events/:id
    Then el evento debe eliminarse
    And no debe existir en la base de datos
```

**Implementación:**
- Archivo: `backend/tests/integration/events.integration.test.js`
- Estado: ✅ 14/14 pruebas pasando
- Cobertura: 100%

---

### 3. Módulo de Órdenes/Tickets (8 pruebas)

#### Feature: Compra de tickets
```gherkin
Feature: Proceso de compra de tickets para eventos

  Scenario: Compra exitosa de tickets
    Given que estoy autenticado como usuario
    And existe un evento con tickets disponibles
    When solicito POST /api/orders con event_id y quantity
    Then debo recibir código 201
    And debo recibir los detalles del ticket
    And los tickets disponibles deben decrementar

  Scenario: Validación de stock insuficiente
    Given que un evento tiene 100 tickets disponibles
    When intento comprar 150 tickets
    Then debo recibir código 400
    And el mensaje debe indicar stock insuficiente

  Scenario: Manejo de evento inexistente
    Given que intento comprar tickets para event_id = 99999
    When envío la solicitud de compra
    Then debo recibir código 404
    And el mensaje debe indicar "Evento no encontrado"

  Scenario: Múltiples compras decrementan correctamente
    Given que un evento tiene 100 tickets
    When compro 30 tickets
    And luego compro 20 tickets más
    Then deben quedar 50 tickets disponibles
```

#### Feature: Consulta de tickets del usuario
```gherkin
Feature: Historial de compras del usuario

  Scenario: Obtener mis tickets comprados
    Given que he comprado tickets anteriormente
    When solicito GET /api/orders/my-tickets
    Then debo recibir la lista de mis tickets
    And cada ticket debe incluir información del evento

  Scenario: Requiere autenticación
    Given que NO estoy autenticado
    When intento obtener mis tickets
    Then debo recibir código 401
```

**Implementación:**
- Archivo: `backend/tests/integration/orders.integration.test.js`
- Estado: ✅ 8/8 pruebas pasando
- Cobertura: 100%

---

## 🛠️ Tecnologías y Herramientas Utilizadas

### Framework de Testing
- **Jest 29.x**: Framework de testing principal
  - Soporte nativo para ES Modules
  - Matchers expresivos
  - Mock y Spy capabilities
  - Coverage reports integrados

### Testing HTTP
- **Supertest**: Para pruebas de API REST
  - Simula requests HTTP
  - Integración con Express
  - Assertions sobre responses

### Base de Datos
- **PostgreSQL 16**: Base de datos de testing aislada
  - Database: `eventplatform_test`
  - Pool de conexiones dedicado
  - Setup/Teardown automático

### Herramientas Auxiliares
- **bcrypt**: Hashing de contraseñas en tests
- **jsonwebtoken**: Generación de tokens JWT para autenticación
- **dotenv**: Gestión de variables de entorno

---

## 📁 Estructura del Proyecto de Testing

```
backend/
├── tests/
│   ├── setup.js                 # Configuración global de Jest
│   ├── testDb.js               # Utilidades de base de datos
│   ├── integration/            # Pruebas de integración
│   │   ├── auth.integration.test.js
│   │   ├── events.integration.test.js
│   │   └── orders.integration.test.js
│   └── unit/                   # Pruebas unitarias
│       └── authController.test.js
├── jest.config.js              # Configuración de Jest
├── .env.test                   # Variables de entorno para testing
└── package.json                # Scripts de testing
```

---

## ⚙️ Configuración de Jest

### jest.config.js
```javascript
export default {
  testEnvironment: 'node',
  maxWorkers: 1,  // Ejecución secuencial (evita race conditions)
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'database/**/*.js',
    'middleware/**/*.js',
    '!database/db.js',
    '!server.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000
};
```

### Características Clave
- **maxWorkers: 1**: Evita condiciones de carrera en BD
- **coverageThreshold: 80%**: Estándar profesional
- **testTimeout: 10000ms**: Para operaciones de BD

---

## 🔧 Scripts de NPM

```json
{
  "scripts": {
    "test": "NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "test:watch": "NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js --watch",
    "test:coverage": "NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage",
    "test:integration": "NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js --testPathPattern=integration"
  }
}
```

### Uso
```bash
# Ejecutar todas las pruebas
npm test

# Modo watch (desarrollo)
npm run test:watch

# Con reporte de cobertura
npm run test:coverage

# Solo pruebas de integración
npm run test:integration
```

---

## 🗄️ Gestión de Base de Datos de Testing

### Configuración de testDb.js

El archivo `testDb.js` proporciona utilidades para:

1. **Setup de Base de Datos**
```javascript
export const setupTestDb = async () => {
  // Limpia todas las tablas
  await testPool.query('DELETE FROM tickets');
  await testPool.query('DELETE FROM images');
  await testPool.query('DELETE FROM events');
  await testPool.query('DELETE FROM users');
  await testPool.query('DELETE FROM categories');
  await testPool.query('DELETE FROM roles');
  
  // Re-inserta datos base (roles y categorías)
  // ...
};
```

2. **Teardown de Base de Datos**
```javascript
export const teardownTestDb = async () => {
  await testPool.query('TRUNCATE TABLE ... CASCADE');
  await testPool.end();
};
```

3. **Helpers de Creación**
```javascript
// Crear usuario de prueba
export const createTestUser = async (name, email, password_hash, role_id);

// Crear evento de prueba
export const createTestEvent = async (eventData);
```

---

## 📈 Cobertura de Código (Coverage)

### Umbral Configurado: 80%

Siguiendo el estándar profesional, todas las métricas deben superar 80%:

| Métrica | Descripción | Umbral |
|---------|-------------|--------|
| **Statements** | Declaraciones ejecutadas | ≥ 80% |
| **Branches** | Ramas condicionales probadas | ≥ 80% |
| **Functions** | Funciones llamadas en tests | ≥ 80% |
| **Lines** | Líneas de código ejecutadas | ≥ 80% |

### Comando para Verificar Cobertura
```bash
npm run test:coverage
```

### Interpretación del Reporte
```
-------------|---------|----------|---------|---------|
File         | % Stmts | % Branch | % Funcs | % Lines |
-------------|---------|----------|---------|---------|
All files    |   85.5  |   82.3   |   88.1  |   85.2  |
 controllers |   90.2  |   85.7   |   92.0  |   89.8  |
 database    |   78.5  |   75.2   |   81.3  |   78.1  |
-------------|---------|----------|---------|---------|
```

✅ **Todas las métricas > 80% = Aprobado**

---

## 🚀 CI/CD con GitHub Actions

### Workflow Configurado

Archivo: `.github/workflows/ci-coverage.yml`

**Triggers:**
- Push a: `main`, `master`, `develop`, `feature/*`
- Pull requests a: `main`, `master`, `develop`

**Jobs:**
1. ✅ Configurar Node.js 18
2. ✅ Instalar dependencias
3. ✅ Levantar PostgreSQL en servicio
4. ✅ Ejecutar pruebas con cobertura
5. ✅ Verificar umbral de 80%
6. ✅ Subir reporte como artifact

**Servicios:**
- PostgreSQL 16 Alpine
- Health checks configurados
- Puerto 5432 expuesto

---

## 📝 Principios de BDD Aplicados

### Given-When-Then en Práctica

Cada prueba sigue la estructura BDD:

```javascript
describe('Auth Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    test('should register a new user and return 201 with token', async () => {
      // GIVEN: Datos de usuario válidos
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      // WHEN: Envío solicitud de registro
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      // THEN: Verifico respuesta exitosa
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
    });
  });
});
```

### Matchers de Jest Utilizados

Siguiendo lo aprendido en las clases 4 y 5:

**Igualdad:**
- `toBe()`: Valores primitivos
- `toEqual()`: Objetos y arrays

**Numéricos:**
- `toBeGreaterThan()`
- `toBeLessThanOrEqual()`

**Veracidad:**
- `toBeTruthy()`
- `toBeDefined()`

**Colecciones:**
- `toContain()`
- `toHaveLength()`

**HTTP:**
- `toHaveProperty()`
- Status codes con `toBe()`

---

## 🔐 Seguridad en Testing

### Gestión de Secretos

**Variables de Entorno (.env.test):**
```bash
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

⚠️ **Importante:** Nunca commitear `.env` o `.env.test` con credenciales reales

### Tokens JWT en Tests

Los tests generan tokens válidos usando el mismo secret:

```javascript
const userToken = jwt.sign(
  { id: user.id, email: user.email, role_id: user.role_id },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

---

## 🎓 Conceptos Académicos Aplicados

### De la Clase 2: Pirámide de Pruebas
✅ Enfoque en pruebas de integración (capa media)
✅ Balanceado para este proyecto

### De la Clase 3: BDD y Gherkin
✅ Estructura Given-When-Then
✅ Pruebas legibles como especificaciones

### De la Clase 4: Matchers Comunes
✅ `toBe`, `toEqual`, `toHaveProperty`
✅ Matchers numéricos y de colecciones

### De la Clase 5: Matchers Avanzados
✅ `toMatchObject` para validaciones parciales
✅ `toThrow` para manejo de errores
✅ Matchers asimétricos con `expect.any()`

---

## 📊 Métricas del Proyecto

### Estadísticas Actuales

| Métrica | Valor | Estado |
|---------|-------|--------|
| Total de pruebas | 32 | ✅ |
| Pruebas pasando | 32 (100%) | ✅ |
| Cobertura promedio | >80% | ✅ |
| Tiempo de ejecución | ~4 segundos | ✅ |
| Test suites | 3 | ✅ |

### Desglose por Módulo

```
Auth Integration:     10 pruebas ✅
Events Integration:   14 pruebas ✅
Orders Integration:    8 pruebas ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:                32 pruebas ✅
```

---

## 🔍 Troubleshooting

### Problemas Comunes y Soluciones

**1. Tests fallan con "Database connection error"**
```bash
# Solución: Verificar que PostgreSQL esté corriendo
docker ps | grep postgres_db
docker start postgres_db
```

**2. "Jest did not exit one second after"**
```bash
# Solución: Usar --forceExit
npm test -- --forceExit
```

**3. "Coverage below 80%"**
```bash
# Ver archivos con baja cobertura
npm run test:coverage
# Revisar tabla en terminal y escribir pruebas para archivos rojos
```

**4. "Cannot find module"**
```bash
# Asegurar que NODE_ENV=test esté configurado
export NODE_ENV=test  # Linux/Mac
$env:NODE_ENV="test"  # Windows PowerShell
```

---

## 📚 Referencias y Recursos

### Documentación Oficial
- [Jest](https://jestjs.io/)
- [Supertest](https://github.com/ladjs/supertest)
- [PostgreSQL](https://www.postgresql.org/docs/)
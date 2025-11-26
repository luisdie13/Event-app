# 🔧 Funcionalidades de Administración

Documentación de las características del panel de administración.

## 📋 Gestión de Eventos (AdminEventList)

### Búsqueda de Eventos

La sección de **Gestionar Eventos** incluye una barra de búsqueda en tiempo real que permite filtrar eventos de manera eficiente.

#### Características de la Búsqueda

- **Búsqueda en tiempo real**: Los resultados se actualizan mientras escribes
- **Campos de búsqueda**: 
  - Título del evento
  - Categoría
  - Ubicación

#### Funcionalidades

1. **Input con icono de búsqueda**: Interfaz intuitiva con icono de lupa
2. **Botón de limpiar**: Aparece cuando hay texto en la búsqueda para limpiarla rápidamente
3. **Contador de resultados**: Muestra cuántos eventos coinciden con la búsqueda
4. **Mensaje cuando no hay resultados**: Indica que no se encontraron coincidencias con opción para limpiar
5. **Búsqueda insensible a mayúsculas/minúsculas**: Coincide sin importar el uso de mayúsculas

#### Implementación Técnica

```javascript
// Estado para el término de búsqueda
const [searchTerm, setSearchTerm] = useState('');

// Filtrado de eventos
const filteredEvents = events.filter(event => {
    const searchLower = searchTerm.toLowerCase();
    return (
        event.title.toLowerCase().includes(searchLower) ||
        event.category_name.toLowerCase().includes(searchLower) ||
        (event.location && event.location.toLowerCase().includes(searchLower))
    );
});
```

#### Interfaz de Usuario

**Componentes visuales:**
- Input de texto con placeholder descriptivo
- Icono SVG de búsqueda (lupa) en el lado izquierdo
- Botón "X" para limpiar en el lado derecho (aparece solo cuando hay texto)
- Contador de resultados bajo el input
- Mensaje de "sin resultados" con icono y opción para limpiar

**Estilos aplicados:**
- Tailwind CSS para diseño responsive
- Focus ring con color primary
- Transiciones suaves en interacciones
- Bordes redondeados y sombras sutiles

#### Ejemplo de Uso

1. El administrador accede a la sección "Gestionar Eventos"
2. Escribe en la barra de búsqueda, por ejemplo: "concierto"
3. La tabla se filtra automáticamente mostrando solo eventos que contengan "concierto" en:
   - Título
   - Categoría
   - Ubicación
4. El contador muestra: "Mostrando 3 de 10 eventos"
5. Para limpiar, puede hacer clic en la "X" o borrar manualmente el texto

#### Casos de Uso

**Escenario 1: Buscar por título**
```
Input: "rock"
Resultado: Todos los eventos que contengan "rock" en el título
```

**Escenario 2: Buscar por categoría**
```
Input: "música"
Resultado: Todos los eventos de la categoría "Música"
```

**Escenario 3: Buscar por ubicación**
```
Input: "guatemala"
Resultado: Todos los eventos en ubicaciones que contengan "guatemala"
```

**Escenario 4: Sin resultados**
```
Input: "xyz123"
Resultado: Mensaje "No se encontraron eventos que coincidan con 'xyz123'"
         + Botón para limpiar la búsqueda
```

#### Ventajas

✅ **Eficiencia**: Filtrado instantáneo sin necesidad de llamadas al servidor
✅ **UX mejorada**: Feedback visual inmediato
✅ **Accesibilidad**: Placeholder descriptivo y botones claros
✅ **Performance**: Búsqueda optimizada con filtrado en memoria
✅ **Flexibilidad**: Busca en múltiples campos simultáneamente

#### Mejoras Futuras Sugeridas

- [ ] Filtros avanzados por fecha
- [ ] Ordenamiento de resultados
- [ ] Búsqueda por rango de precios
- [ ] Exportación de resultados filtrados
- [ ] Guardado de filtros favoritos

---

## 🎨 Componentes Relacionados

### AdminEventList
**Ubicación**: `frontend/src/components/AdminEventList.jsx`

**Props:**
- `startEdit`: Función para iniciar la edición de un evento
- `goToCreate`: Función para navegar al formulario de creación

**Estados:**
- `events`: Array de eventos obtenidos del servidor
- `searchTerm`: Término de búsqueda actual
- `isLoading`: Estado de carga
- `error`: Mensaje de error si hay problemas
- `message`: Mensajes de éxito/info

**Funciones principales:**
- `fetchEvents()`: Obtiene eventos del servidor
- `handleDelete(eventId)`: Elimina un evento
- `filteredEvents`: Computed value que filtra eventos según searchTerm

---

## 📱 Diseño Responsive

La barra de búsqueda se adapta a diferentes tamaños de pantalla:

- **Desktop**: Ancho completo con iconos y botones visibles
- **Tablet**: Se mantiene la funcionalidad completa
- **Mobile**: Input con padding ajustado, iconos escalables

---

## 🔒 Seguridad

- Solo accesible para usuarios con `role_id === 5` (Administradores)
- Verificación de autenticación mediante JWT
- Validación de permisos antes de renderizar

---

---

## 👥 Gestión de Usuarios (AdminUserList)

### Búsqueda de Usuarios

La sección de **Gestionar Usuarios** incluye una barra de búsqueda en tiempo real con las mismas características que la de eventos.

#### Características de la Búsqueda

- **Búsqueda en tiempo real**: Los resultados se actualizan mientras escribes
- **Campos de búsqueda**: 
  - Nombre del usuario
  - Email
  - Rol (administrator/member)

#### Funcionalidades

1. **Input con icono de búsqueda**: Interfaz intuitiva con icono de lupa
2. **Botón de limpiar**: Aparece cuando hay texto en la búsqueda
3. **Contador de resultados**: Muestra cuántos usuarios coinciden con la búsqueda
4. **Mensaje cuando no hay resultados**: Indica que no se encontraron coincidencias
5. **Búsqueda insensible a mayúsculas/minúsculas**: Coincide sin importar el formato

#### Implementación Técnica

```javascript
// Estado para el término de búsqueda
const [searchTerm, setSearchTerm] = useState('');

// Filtrado de usuarios
const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role_name.toLowerCase().includes(searchLower)
    );
});
```

#### Casos de Uso

**Escenario 1: Buscar por nombre**
```
Input: "juan"
Resultado: Todos los usuarios que contengan "juan" en su nombre
```

**Escenario 2: Buscar por email**
```
Input: "@gmail"
Resultado: Todos los usuarios con emails de Gmail
```

**Escenario 3: Buscar por rol**
```
Input: "admin"
Resultado: Todos los usuarios con rol de administrador
```

**Escenario 4: Sin resultados**
```
Input: "xyz@test.com"
Resultado: Mensaje "No se encontraron usuarios que coincidan con 'xyz@test.com'"
         + Botón para limpiar la búsqueda
```

#### Componente AdminUserList

**Ubicación**: `frontend/src/components/AdminUserList.jsx`

**Estados relacionados con búsqueda:**
- `users`: Array de usuarios obtenidos del servidor
- `searchTerm`: Término de búsqueda actual
- `filteredUsers`: Computed value que filtra usuarios según searchTerm

**Funciones principales:**
- `fetchUsers()`: Obtiene usuarios del servidor
- `handleRoleChange(userId, currentRoleName)`: Cambia el rol de un usuario
- `handleDeleteUser(userId, userName)`: Elimina un usuario del sistema
- `handleCreateUser(e)`: Crea un nuevo usuario

#### Eliminar Usuarios

La sección incluye funcionalidad para eliminar usuarios con las siguientes características de seguridad:

**Características de seguridad:**
- ✅ Previene que el administrador se elimine a sí mismo
- ✅ Confirmación obligatoria antes de eliminar
- ✅ Mensaje de advertencia indicando que la acción es irreversible
- ✅ Actualización inmediata de la lista tras eliminar
- ✅ Feedback visual (botón deshabilitado para el usuario actual)

**Flujo de eliminación:**
1. El administrador hace clic en el botón "🗑️ Eliminar"
2. Aparece un diálogo de confirmación: "¿Estás seguro de que deseas eliminar al usuario '[nombre]'? Esta acción no se puede deshacer."
3. Si confirma, se envía la solicitud al backend
4. El backend valida que no sea el mismo usuario
5. Se elimina el usuario de la base de datos
6. La lista se actualiza automáticamente
7. Se muestra un mensaje de éxito

**Backend:**
- Endpoint: `DELETE /api/admin/users/:userId`
- Validación: Impide que un admin se elimine a sí mismo
- Respuesta: Confirma la eliminación con el nombre del usuario eliminado

---

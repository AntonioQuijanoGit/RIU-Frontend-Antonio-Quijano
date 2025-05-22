<!-- markdownlint-disable MD022 MD025 MD041 -->

# RIU-Frontend-Antonio-Quijano

Aplicación SPA desarrollada en Angular para la gestión de superhéroes. Prueba técnica frontend para RIU desarrollada por Antonio Quijano.

---

## Descripción del Proyecto

Sistema completo de gestión de superhéroes que permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) con una interfaz moderna y responsiva. La aplicación incluye funcionalidades avanzadas como filtrado, paginación, dos modos de visualización y confirmaciones de seguridad.

---

## Funcionalidades

### Gestión de Superhéroes

- Registrar nuevo superhéroe con formulario validado
- Consultar todos los superhéroes con lista paginada
- Buscar superhéroe por ID específico
- Filtrar superhéroes por nombre (búsqueda parcial)
- Modificar información de superhéroes existentes
- Eliminar superhéroes con confirmación de seguridad

### Interfaz de Usuario

- Diseño responsive que se adapta a cualquier dispositivo
- Dos vistas disponibles: tarjetas (grid) y tabla (list)
- Paginación inteligente con opciones de elementos por página
- Búsqueda en tiempo real por nombre de superhéroe
- Filtros por editorial (Marvel Comics, DC Comics)
- Indicadores de carga durante las operaciones
- Navegación fluida entre secciones

---

## Tecnologías Utilizadas

### Frontend

- Angular 19.2 (última versión LTS)
- Angular Material para componentes UI
- Angular Router para navegación SPA
- RxJS para programación reactiva
- TypeScript para tipado estático
- SCSS para estilos avanzados

### Testing y Calidad

- Jasmine como framework de testing
- Karma como test runner
- Cobertura 81% con 76 tests unitarios
- ESLint para control de calidad de código

### DevOps

- Docker para containerización
- Nginx como servidor web
- Git para control de versiones con commits descriptivos

---

## Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm 9+
- Angular CLI 19+
- Docker (opcional)

### Instalación (Local o Docker)

```bash
# Clonar el repositorio
git clone https://github.com/AntonioQuijanoGit/RIU-Frontend-Antonio-Quijano.git

# Navegar al directorio
cd RIU-Frontend-Antonio-Quijano

# ------- Opción 1: Ejecutar localmente -------

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
ng serve

# La aplicación estará disponible en:
# http://localhost:4200


# ------- Opción 2: Usar Docker -------

# Construir la imagen Docker
docker build -t riu-frontend .

# Ejecutar el contenedor
docker run -p 8080:80 riu-frontend

# La aplicación estará disponible en:
# http://localhost:8080
```

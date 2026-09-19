# FinTrack — Personal Finance Manager

FinTrack es una aplicación web para gestionar de forma sencilla los ingresos y gastos personales. Permite registrar movimientos financieros, consultar el historial y eliminar transacciones.

## 🚀 Tecnologías

### Frontend
- **React 19**
- **React Bootstrap / Bootstrap 5**
- **Axios** para las peticiones HTTP
- **Recharts** para visualizaciones futuras
- **Rsbuild** como herramienta de desarrollo y build

### Backend
- **Node.js**
- **Express 5**
- **SQLite** mediante `better-sqlite3`
- **CORS** para permitir la comunicación con el frontend

## 📁 Estructura del proyecto

```text
FinTrack---Personal-Finance-Manager-master/
├── backend/
│   ├── database.js
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── favicon.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   └── TransactionList.jsx
│   │   ├── services/
│   │   │   └── transactionService.js
│   │   ├── App.css
│   │   └── App.jsx
│   ├── package.json
│   ├── package-lock.json
│   └── rsbuild.config.js
│
└── .gitignore
```

## ✨ Funcionalidades

Actualmente FinTrack permite:

- Registrar **ingresos** y **gastos**.
- Añadir importe, categoría, descripción y fecha.
- Consultar todas las transacciones registradas.
- Eliminar transacciones.
- Obtener una transacción concreta mediante su ID.
- Actualizar una transacción existente mediante la API.
- Persistir los datos en una base de datos SQLite local.
- Validar los datos enviados al backend.

## 🗄️ Modelo de datos

Las transacciones se almacenan en la tabla `transactions` de SQLite:

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | INTEGER | Identificador único autoincremental |
| `type` | TEXT | `income` o `expense` |
| `amount` | REAL | Importe positivo |
| `category` | TEXT | Categoría del movimiento |
| `description` | TEXT | Descripción opcional |
| `date` | TEXT | Fecha de la transacción |

La base de datos se crea automáticamente como `fintrack.db` al iniciar el backend.

## 🔌 API

La API está disponible por defecto en:

```text
http://localhost:3000
```

### Obtener todas las transacciones

```http
GET /api/transactions
```

### Obtener una transacción

```http
GET /api/transactions/:id
```

### Crear una transacción

```http
POST /api/transactions
Content-Type: application/json
```

Ejemplo:

```json
{
  "type": "expense",
  "amount": 25.5,
  "category": "Alimentación",
  "description": "Cena",
  "date": "2026-09-18"
}
```

### Actualizar una transacción

```http
PUT /api/transactions/:id
Content-Type: application/json
```

### Eliminar una transacción

```http
DELETE /api/transactions/:id
```

## 🛠️ Instalación

### Requisitos

Necesitas tener instalado:

- [Node.js](https://nodejs.org/)
- npm, incluido normalmente con Node.js

### 1. Clonar o descargar el proyecto

```bash
git clone <URL_DEL_REPOSITORIO>
cd FinTrack---Personal-Finance-Manager-master
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend

En otra terminal:

```bash
cd frontend
npm install
```

## ▶️ Ejecutar la aplicación

### Backend

Desde la carpeta `backend`:

```bash
npm start
```

El servidor se iniciará en:

```text
http://localhost:5000
```

Para desarrollo con reinicio automático:

```bash
npm run dev
```

### Frontend

Desde la carpeta `frontend`:

```bash
npm run dev
```

Rsbuild utiliza el puerto `3001`, por lo que la aplicación estará disponible normalmente en:

```text
http://localhost:3001
```

## 🏗️ Build de producción

Para generar la versión de producción del frontend:

```bash
cd frontend
npm run build
```

Los archivos generados se almacenarán en la carpeta `dist/`.

## 🔄 Funcionamiento

La aplicación sigue una arquitectura sencilla de cliente-servidor:

```text
┌──────────────────────┐
│      Frontend        │
│      React           │
│      :3001           │
└──────────┬───────────┘
           │ HTTP / Axios
           ▼
┌──────────────────────┐
│       Backend        │
│   Node.js + Express  │
│        :5000         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       SQLite         │
│    fintrack.db       │
└──────────────────────┘
```

El frontend realiza las peticiones a la API mediante Axios. El backend procesa las operaciones y utiliza SQLite para almacenar permanentemente las transacciones.

## 📌 Estado del proyecto

FinTrack se encuentra en desarrollo. La versión actual implementa la gestión básica de transacciones y proporciona la estructura necesaria para ampliar la aplicación con nuevas funcionalidades.

### Posibles mejoras

- Dashboard financiero con estadísticas.
- Gráficos de ingresos y gastos.
- Filtrado por fechas y categorías.
- Edición de transacciones desde la interfaz.
- Cálculo de saldo total.
- Presupuestos mensuales.
- Autenticación de usuarios.
- Diseño responsive más completo.
- Variables de entorno para configurar la URL de la API.
- Tests automatizados.
- Despliegue en producción.

## 📄 Licencia

Este proyecto no especifica actualmente una licencia. Si se publica como proyecto open source, se recomienda añadir una licencia adecuada, como MIT, según las necesidades del proyecto.

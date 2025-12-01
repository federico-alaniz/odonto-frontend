# Configuración del Backend - Solución de Errores

## Error: "bad auth : authentication failed" (MongoDB Atlas)

### Causa
Este error ocurre cuando el backend no puede autenticarse con MongoDB Atlas. Las causas más comunes son:

1. **Credenciales incorrectas** en las variables de entorno
2. **IP no autorizada** en MongoDB Atlas
3. **Usuario de base de datos no creado** o sin permisos
4. **String de conexión mal formado**

---

## Solución Paso a Paso

### 1. Verificar Variables de Entorno del Backend

El backend debe tener un archivo `.env` con la siguiente estructura:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Puerto del servidor
PORT=5000

# Otras configuraciones
NODE_ENV=development
```

**Importante:**
- Reemplaza `<username>` con tu usuario de MongoDB
- Reemplaza `<password>` con la contraseña (sin caracteres especiales o codificados en URL)
- Reemplaza `<cluster>` con el nombre de tu cluster
- Reemplaza `<database>` con el nombre de tu base de datos

### 2. Crear Usuario en MongoDB Atlas

1. Ve a **MongoDB Atlas Dashboard**
2. Selecciona tu cluster
3. Click en **Database Access** (en el menú lateral)
4. Click en **Add New Database User**
5. Configura:
   - **Authentication Method**: Password
   - **Username**: `medicore_user` (o el que prefieras)
   - **Password**: Genera una contraseña segura (sin caracteres especiales)
   - **Database User Privileges**: `Atlas admin` o `Read and write to any database`
6. Click en **Add User**

### 3. Autorizar IP en MongoDB Atlas

1. En **MongoDB Atlas Dashboard**
2. Click en **Network Access** (en el menú lateral)
3. Click en **Add IP Address**
4. Opciones:
   - **Para desarrollo local**: Click en "Add Current IP Address"
   - **Para permitir todas las IPs** (solo desarrollo): Ingresa `0.0.0.0/0`
5. Click en **Confirm**

⚠️ **Advertencia**: `0.0.0.0/0` permite acceso desde cualquier IP. Solo usar en desarrollo.

### 4. Verificar String de Conexión

El string de conexión debe tener este formato:

```
mongodb+srv://usuario:contraseña@cluster.xxxxx.mongodb.net/nombre_db?retryWrites=true&w=majority
```

**Si la contraseña tiene caracteres especiales**, codifícalos:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`

O mejor aún, usa una contraseña sin caracteres especiales.

### 5. Ejemplo de Configuración Correcta

```env
# .env del backend
MONGODB_URI=mongodb+srv://medicore_user:SecurePass123@cluster0.abc123.mongodb.net/medicore_db?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

### 6. Código del Backend (Conexión a MongoDB)

Asegúrate de que tu backend tenga algo similar a esto:

```javascript
// backend/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

```javascript
// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Conectar a MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Verificar que Funciona

### 1. Reiniciar el Backend

```bash
cd backend
npm install
node server.js
```

Deberías ver:
```
MongoDB Connected: cluster0-shard-00-01.abc123.mongodb.net
Server running on port 5000
```

### 2. Probar desde el Frontend

Abre el navegador en `http://localhost:3000/admin/users`

Si todo está bien, deberías ver la lista de usuarios (vacía al principio).

---

## Checklist de Verificación

- [ ] Usuario de MongoDB creado con permisos correctos
- [ ] IP autorizada en Network Access
- [ ] Variables de entorno configuradas correctamente
- [ ] String de conexión sin caracteres especiales en la contraseña
- [ ] Backend reiniciado después de cambios
- [ ] Puerto 5000 disponible (no usado por otra aplicación)
- [ ] Archivo `.env` en la raíz del proyecto backend
- [ ] Paquete `dotenv` instalado: `npm install dotenv`
- [ ] Paquete `mongoose` instalado: `npm install mongoose`

---

## Errores Comunes y Soluciones

### Error: "MongooseServerSelectionError"
**Causa**: No se puede conectar al cluster
**Solución**: Verifica que la IP esté autorizada en Network Access

### Error: "Authentication failed"
**Causa**: Usuario o contraseña incorrectos
**Solución**: Verifica las credenciales en MongoDB Atlas y en el `.env`

### Error: "ECONNREFUSED"
**Causa**: El backend no está corriendo
**Solución**: Inicia el servidor backend con `node server.js`

### Error: "Cannot find module 'dotenv'"
**Causa**: Paquete no instalado
**Solución**: `npm install dotenv`

---

## Estructura de Proyecto Backend Recomendada

```
backend/
├── .env                    # Variables de entorno
├── .gitignore             # Ignorar .env
├── package.json
├── server.js              # Punto de entrada
├── config/
│   └── database.js        # Configuración de MongoDB
├── models/
│   ├── User.js           # Modelo de Usuario
│   ├── Patient.js        # Modelo de Paciente
│   └── Clinic.js         # Modelo de Clínica
├── routes/
│   ├── users.js          # Rutas de usuarios
│   ├── patients.js       # Rutas de pacientes
│   └── auth.js           # Rutas de autenticación
├── controllers/
│   ├── userController.js
│   └── authController.js
└── middleware/
    ├── auth.js           # Middleware de autenticación
    └── multiTenancy.js   # Middleware de multi-tenancy
```

---

## Contacto

Si el error persiste después de seguir estos pasos, verifica:
1. Los logs completos del backend
2. La versión de Node.js (recomendado: v18+)
3. La versión de MongoDB (recomendado: 6.0+)
4. Que el cluster de MongoDB Atlas esté activo (no pausado)

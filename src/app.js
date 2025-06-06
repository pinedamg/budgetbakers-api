// /home/mpineda/Work/projects/node/budgetbakers-api/src/app.js
/**
 * Propósito: Archivo principal de la aplicación Express.
 * Configura la aplicación, middlewares, rutas y el servidor.
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // Para logging de peticiones HTTP
const config = require('./config');
const errorHandler = require('./middlewares/errorHandler.middleware');
const { formatErrorResponse } = require('./helpers/responseFormatter.helper');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');
// Importar rutas
const accountRoutes = require('./routes/accounts.routes');
const recordRoutes = require('./routes/records.routes');
const categoryRoutes = require('./routes/categories.routes');
const labelRoutes = require('./routes/labels.routes');
const authRoutes = require('./routes/auth.routes'); // Import auth routes

const app = express();

// Middlewares básicos
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json()); // Para parsear application/json
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded
app.use(morgan('dev')); // Logging de peticiones en consola (formato 'dev')
    
// Servir Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de la API
app.use(`${config.apiVersion}/accounts`, accountRoutes);
app.use(`${config.apiVersion}/records`, recordRoutes);
app.use(`${config.apiVersion}/categories`, categoryRoutes);
app.use(`${config.apiVersion}/labels`, labelRoutes);
app.use(`${config.apiVersion}/auth`, authRoutes); // Mount auth routes

// Middleware para rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json(formatErrorResponse('Endpoint not found'));
});

// Middleware de manejo de errores (debe ser el último middleware)
app.use(errorHandler);

module.exports = app; // Exportar para pruebas o para server.js
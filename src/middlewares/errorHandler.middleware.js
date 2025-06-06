// /home/mpineda/Work/projects/node/budgetbakers-api/src/middlewares/errorHandler.middleware.js
/**
 * Propósito: Middleware de manejo de errores centralizado.
 * Captura cualquier error no controlado y envía una respuesta JSON estandarizada.
 */
const { formatErrorResponse } = require('../helpers/responseFormatter.helper');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('ERROR:', err.message);
  if (process.env.NODE_ENV !== 'test') { // No mostrar stack en producción o desarrollo, solo si es necesario
      console.error(err.stack);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Para errores de validación (ej. Joi), se podría personalizar más el mensaje.
  // if (err.isJoi) {
  //   return res.status(400).json(formatErrorResponse(err.details.map(e => e.message).join(', '), err.details));
  // }

  res.status(statusCode).json(formatErrorResponse(message, err.details || null));
}

module.exports = errorHandler;
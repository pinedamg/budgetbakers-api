// /home/mpineda/Work/projects/node/budgetbakers-api/src/helpers/responseFormatter.helper.js
/**
 * Propósito: Proporcionar funciones para formatear respuestas JSON de manera consistente.
 */

/**
 * Formatea una respuesta exitosa.
 * @param {*} data - Los datos a enviar en la respuesta.
 * @param {string} [message] - Un mensaje opcional de éxito.
 * @returns {object} Objeto de respuesta formateado.
 */
function formatSuccessResponse(data, message = 'Operation successful') {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Formatea una respuesta de error.
 * @param {string} message - El mensaje de error.
 * @param {*|null} [details=null] - Detalles adicionales del error (opcional).
 * @returns {object} Objeto de respuesta de error formateado.
 */
function formatErrorResponse(message, details = null) {
  const errorResponse = {
    success: false,
    error: {
      message,
    },
  };
  if (details) {
    errorResponse.error.details = details;
  }
  return errorResponse;
}

module.exports = {
  formatSuccessResponse,
  formatErrorResponse,
};
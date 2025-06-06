// /home/mpineda/Work/projects/node/budgetbakers-api/src/helpers/database.helper.js
/**
 * Propósito: Centralizar la lógica de conexión y obtención de la instancia de la base de datos CouchDB.
 */
const nano = require('nano');
const authService = require('../services/authService');
// const config = require('../config'); // No se usa directamente aquí si Referer usa session.url

/**
 * Obtiene una instancia configurada de la base de datos CouchDB del usuario
 * y el ownerId de la sesión.
 * @returns {Promise<{db: import('nano').DocumentScope<any>, ownerId: string}>}
 * @throws {Error} Si no se pueden obtener los datos de sesión o hay un error al conectar.
 */
async function getUserDatabase() {
  const { session } = await authService.getAuthenticatedData();
  if (!session || !session.url || !session.dbName || !session.login || !session.token || !session.ownerId) {
    throw new Error('Datos de sesión de CouchDB incompletos o no disponibles desde authService.');
  }

  const couchDbUrlWithAuth = `${session.url.replace('https://', `https://${session.login}:${session.token}@`)}`;

  const nanoConfig = {
    url: couchDbUrlWithAuth,
    requestDefaults: { headers: { 'Referer': session.url } },
  };
  const dbClient = nano(nanoConfig);
  return {
    db: dbClient.use(session.dbName),
    ownerId: session.ownerId,
  };
}

module.exports = { getUserDatabase };
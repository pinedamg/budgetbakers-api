// /home/mpineda/Work/projects/node/budgetbakers-api/src/config/index.js
/**
 * Propósito: Centralizar toda la configuración de la aplicación.
 * Carga variables de entorno desde un archivo .env y exporta
 * las configuraciones necesarias como URLs, puertos y constantes.
 */
require('dotenv').config(); // Carga las variables de entorno desde .env

const config = {
  port: process.env.PORT || 3000,
  budgetBakersApiUrl: process.env.BUDGETBAKERS_API_URL,
  // Otras URLs o constantes de la API de BudgetBakers
  couchDbUrl: process.env.COUCHDB_URL,
  // Credenciales sensibles (aunque es mejor que authService las maneje directamente si son dinámicas)
  // budgetBakersUsername: process.env.BUDGETBAKERS_USERNAME,
  // budgetBakersPassword: process.env.BUDGETBAKERS_PASSWORD,

  // Constantes de la aplicación
  apiVersion: '/api/v1',
};

module.exports = config;
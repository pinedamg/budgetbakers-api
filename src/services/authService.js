// authService.js
/**
 * Propósito: Manejar la lógica de autenticación y gestión de la sesión con BudgetBakers.
 * Cachea credenciales y el cliente HTTP para reutilizar la sesión.
 * Exporta una función principal para obtener datos autenticados.
 */
const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const config = require('../config');
// const { Buffer } = require('node:buffer'); // Buffer no se usa aquí, se usa en accountService

// Variables para cachear la sesión
let sessionCache = {
  csrfToken: null,
  replicationData: null,
  cookieJar: new CookieJar(), // Nueva CookieJar para cada intento de autenticación completo
  isAuthenticated: false,
  authenticatedAxiosInstance: null,
};

// URLs de la API de BudgetBakers (ajustar si config.budgetBakersApiUrl es diferente)
const BASE_URL = config.budgetBakersApiUrl || 'https://web-new.budgetbakers.com';
const CSRF_URL = `${BASE_URL}/api/auth/csrf`;
const SIGN_IN_URL = `${BASE_URL}/api/auth/callback/sign-in`;
const SESSION_URL = `${BASE_URL}/api/auth/session`;
const LOGIN_PAGE_URL = `${BASE_URL}/es-ES/sign-in?callbackUrl=%2Fdashboard`; // Ajustar idioma si es necesario

/**
 * Orquesta la autenticación completa si no hay una sesión activa o si ha expirado.
 * Cachea el cliente axios autenticado y los datos de replicación de CouchDB.
 */
async function getAuthenticatedData() {
  // console.log('DEBUG: Inicio de getAuthenticatedData. Cache actual - isAuthenticated:', sessionCache.isAuthenticated, 'hasAxios:', !!sessionCache.authenticatedAxiosInstance, 'hasReplicationData:', !!sessionCache.replicationData);

  // TODO: Implementar lógica de expiración de sesión más robusta
  if (sessionCache.isAuthenticated && sessionCache.authenticatedAxiosInstance && sessionCache.replicationData) {
    // console.log('INFO: Usando sesión de BudgetBakers/CouchDB desde caché.');
    return {
      client: sessionCache.authenticatedAxiosInstance,
      session: sessionCache.replicationData,
      csrfToken: sessionCache.csrfToken,
    };
  }
  
  // Reiniciar cookieJar para un nuevo intento de autenticación
  // Solo reiniciamos la cookieJar si vamos a crear una nueva instancia de axios para esta autenticación.
  // Si authenticatedAxiosInstance ya existe de un login anterior (ej. vía /auth/login) pero falta replicationData,
  // podríamos intentar usar esa instancia. Sin embargo, para simplificar y asegurar limpieza para .env auth:
  const internalAuthCookieJar = new CookieJar();
  // Crear la instancia de axios que usará la cookieJar para todas las operaciones de esta sesión
  const internalAxiosInstance = wrapper(axios.create({ jar: internalAuthCookieJar, withCredentials: true }));


  const email = process.env.BUDGETBAKERS_EMAIL;
  const password = process.env.BUDGETBAKERS_PASSWORD;

  if (!email || !password) {
    throw new Error('Las variables de entorno BUDGETBAKERS_EMAIL y/o BUDGETBAKERS_PASSWORD no están definidas.');
  }

  // Paso 1: Obtener CSRF Token
  const csrfResponse = await internalAxiosInstance.get(CSRF_URL, { headers: { 'Referer': LOGIN_PAGE_URL } });
  const obtainedCsrfToken = csrfResponse.data.csrfToken;
  if (!obtainedCsrfToken) {
    throw new Error('No se pudo obtener el token CSRF del cuerpo de la respuesta.');
  }
  // console.log('DEBUG: Paso 1 (getAuthData) - Cookies después de obtener CSRF:', JSON.stringify(internalAuthCookieJar.toJSON(), null, 2));
  // console.log('INFO: Paso 1 (getAuthData) - Token CSRF obtenido del cuerpo:', obtainedCsrfToken);

  // Paso 2: Realizar Login
  const loginPayload = new URLSearchParams({ callbackUrl: '/es-ES/dashboard', redirect: 'false', email, password, csrfToken: obtainedCsrfToken, json: 'true' });
  const loginRequestHeaders = { 'Content-Type': 'application/x-www-form-urlencoded', 'Origin': BASE_URL, 'Referer': LOGIN_PAGE_URL };
  
  const loginResponse = await internalAxiosInstance.post(SIGN_IN_URL, loginPayload.toString(), { headers: loginRequestHeaders });

  if (loginResponse.status !== 200) {
    console.error('DEBUG: Paso 2 (getAuthData) - Respuesta de Login no exitosa:', JSON.stringify(loginResponse.data, null, 2));
    throw new Error(`Fallo en el login. Status: ${loginResponse.status}`);
  }
  // console.log('DEBUG: Paso 2 (getAuthData) - Cookies después del Login:', JSON.stringify(internalAuthCookieJar.toJSON(), null, 2));
  // console.log('INFO: Paso 2 (getAuthData) - Login exitoso.');

  // Paso 3: Obtener datos de sesión (y credenciales de CouchDB)
  const sessionRequestHeaders = { 'Referer': `${BASE_URL}/es-ES/dashboard` }; // Podríamos añadir 'Accept: application/json' si es necesario
  
  const sessionDataResponse = await internalAxiosInstance.get(SESSION_URL, { headers: sessionRequestHeaders });
  
  // console.log('DEBUG: Paso 3 (getAuthData) - Status de sessionResponse:', sessionDataResponse.status);
  // console.log('DEBUG: Paso 3 (getAuthData) - Contenido de sessionResponse.data:', JSON.stringify(sessionDataResponse.data, null, 2));

  if (sessionDataResponse.status !== 200 || !sessionDataResponse.data || Object.keys(sessionDataResponse.data).length === 0 || !sessionDataResponse.data.user || !sessionDataResponse.data.user.replication) {
    console.error('ERROR: Paso 3 (getAuthData) - La estructura de sessionResponse.data no es la esperada o está vacía. Data:', JSON.stringify(sessionDataResponse.data, null, 2));
    throw new Error('No se encontraron los datos de replicación de CouchDB en la sesión.');
  }

  // Actualizar el caché del servidor con la nueva sesión completamente establecida
  sessionCache.csrfToken = obtainedCsrfToken;
  sessionCache.cookieJar = internalAuthCookieJar;
  sessionCache.authenticatedAxiosInstance = internalAxiosInstance;
  sessionCache.replicationData = sessionDataResponse.data.user.replication;
  sessionCache.isAuthenticated = true;
  // console.log('INFO: Paso 3 (getAuthData) - Autenticación interna completada y sesión cacheada.');
  // console.log('DEBUG: Fin de getAuthenticatedData. Cache actualizado - isAuthenticated:', sessionCache.isAuthenticated, 'hasAxios:', !!sessionCache.authenticatedAxiosInstance, 'hasReplicationData:', !!sessionCache.replicationData);

  return {
    client: sessionCache.authenticatedAxiosInstance,
    session: sessionCache.replicationData,
    csrfToken: sessionCache.csrfToken,
  };
}

/**
 * Performs login with BudgetBakers and retrieves cookies to be set on the client.
 * @param {string} email User's email
 * @param {string} password User's password
 * @returns {Promise<Array<{name: string, value: string, options: object}>>} Array of cookie objects for res.cookie()
 */
async function loginAndRetrieveCookies(email, password) {
  // console.log('INFO: Attempting login via loginAndRetrieveCookies...');
  // Ensure a fresh cookieJar for this login attempt
  const loginCookieJar = new CookieJar();
  const loginAxiosInstance = wrapper(axios.create({ jar: loginCookieJar, withCredentials: true }));

  // Step 1: Get CSRF Token
  const csrfResponse = await loginAxiosInstance.get(CSRF_URL, { headers: { 'Referer': LOGIN_PAGE_URL } });
  const csrfTokenValue = csrfResponse.data.csrfToken;
  if (!csrfTokenValue) {
    throw new Error('Failed to obtain CSRF token during login.');
  }
  // console.log('INFO: CSRF token obtained for login.');

  // Step 2: Perform Login
  const loginPayload = new URLSearchParams({ callbackUrl: '/es-ES/dashboard', redirect: 'false', email, password, csrfToken: csrfTokenValue, json: 'true' });
  const loginRequestHeaders = { 'Content-Type': 'application/x-www-form-urlencoded', 'Origin': BASE_URL, 'Referer': LOGIN_PAGE_URL };
  const loginResponse = await loginAxiosInstance.post(SIGN_IN_URL, loginPayload.toString(), { headers: loginRequestHeaders });

  if (loginResponse.status !== 200) {
    console.error('ERROR: BudgetBakers login failed via loginAndRetrieveCookies:', JSON.stringify(loginResponse.data, null, 2));
    throw new Error(`BudgetBakers login failed. Status: ${loginResponse.status}`);
  }
  // console.log('INFO: BudgetBakers login successful via loginAndRetrieveCookies.');

  // Extract cookies to be set by Express
  const cookiesToSet = [];
  const toughCookies = loginCookieJar.getCookiesSync(BASE_URL); // Get all cookies for the domain

  toughCookies.forEach(tc => {
    // We are primarily interested in the session token and CSRF token for the client
    if (tc.key === '__Secure-next-auth.session-token' || tc.key === '__Host-next-auth.csrf-token') {
      cookiesToSet.push({
        name: tc.key,
        value: tc.value,
        options: {
          domain: tc.domain, // Let browser handle if null
          path: tc.path || '/',
          secure: tc.secure || false,
          httpOnly: tc.httpOnly || false, // CSRF is HttpOnly, Session is HttpOnly
          expires: tc.expires && tc.expires !== 'Infinity' ? new Date(tc.expires) : undefined,
          sameSite: tc.sameSite || 'lax', // Default to lax
        },
      });
    }
  });

  if (!cookiesToSet.find(c => c.name === '__Secure-next-auth.session-token')) {
    throw new Error('Session token cookie not found after login.');
  }

  // Also update the server-side session cache for internal service calls
  sessionCache.csrfToken = csrfTokenValue;
  sessionCache.cookieJar = loginCookieJar; // Use the jar from this successful login
  sessionCache.authenticatedAxiosInstance = loginAxiosInstance;
  // Fetch replication data to complete the server-side session state
  const sessionDataResponse = await sessionCache.authenticatedAxiosInstance.get(SESSION_URL, { headers: { 'Referer': `${BASE_URL}/es-ES/dashboard` } });
  if (sessionDataResponse.status !== 200 || !sessionDataResponse.data || !sessionDataResponse.data.user || !sessionDataResponse.data.user.replication) {
    console.error('ERROR: Could not fetch replication data for server-side session after /auth/login. Data:', JSON.stringify(sessionDataResponse.data, null, 2));
    sessionCache.replicationData = null; // Or handle more gracefully
  } else {
    sessionCache.replicationData = sessionDataResponse.data.user.replication;
  }
  sessionCache.isAuthenticated = true;
  return cookiesToSet;
}

module.exports = {
  getAuthenticatedData,
  loginAndRetrieveCookies,
};

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
  // TODO: Implementar lógica de expiración de sesión más robusta
  if (sessionCache.isAuthenticated && sessionCache.authenticatedAxiosInstance && sessionCache.replicationData) {
    console.log('INFO: Usando sesión de BudgetBakers/CouchDB desde caché.');
    return {
      client: sessionCache.authenticatedAxiosInstance,
      session: sessionCache.replicationData,
      csrfToken: sessionCache.csrfToken,
    };
  }

  console.log('INFO: No hay sesión en caché o ha expirado. Iniciando autenticación completa...');
  
  // Reiniciar cookieJar para un nuevo intento de autenticación
  sessionCache.cookieJar = new CookieJar();
  // Crear la instancia de axios que usará la cookieJar para todas las operaciones de esta sesión
  sessionCache.authenticatedAxiosInstance = wrapper(axios.create({ jar: sessionCache.cookieJar, withCredentials: true }));


  const email = process.env.BUDGETBAKERS_EMAIL;
  const password = process.env.BUDGETBAKERS_PASSWORD;

  if (!email || !password) {
    throw new Error('Las variables de entorno BUDGETBAKERS_EMAIL y/o BUDGETBAKERS_PASSWORD no están definidas.');
  }

  // Paso 1: Obtener CSRF Token
  console.log(`DEBUG: Paso 1 - Petición GET a CSRF_URL: ${CSRF_URL}`);
  const csrfResponse = await sessionCache.authenticatedAxiosInstance.get(CSRF_URL, { headers: { 'Referer': LOGIN_PAGE_URL } });
  sessionCache.csrfToken = csrfResponse.data.csrfToken;
  if (!sessionCache.csrfToken) {
    throw new Error('No se pudo obtener el token CSRF del cuerpo de la respuesta.');
  }
  console.log('DEBUG: Paso 1 - Cookies después de obtener CSRF:', JSON.stringify(sessionCache.cookieJar.toJSON(), null, 2));
  console.log('INFO: Paso 1 - Token CSRF obtenido del cuerpo:', sessionCache.csrfToken);

  // Paso 2: Realizar Login
  const loginPayload = new URLSearchParams({ callbackUrl: '/es-ES/dashboard', redirect: 'false', email, password, csrfToken: sessionCache.csrfToken, json: 'true' });
  const loginRequestHeaders = { 'Content-Type': 'application/x-www-form-urlencoded', 'Origin': BASE_URL, 'Referer': LOGIN_PAGE_URL };
  
  console.log(`DEBUG: Paso 2 - Petición POST a SIGN_IN_URL: ${SIGN_IN_URL}`);
  console.log('DEBUG: Paso 2 - Payload de Login:', loginPayload.toString());
  console.log('DEBUG: Paso 2 - Headers de Login:', JSON.stringify(loginRequestHeaders, null, 2));
  
  const loginResponse = await sessionCache.authenticatedAxiosInstance.post(SIGN_IN_URL, loginPayload.toString(), { headers: loginRequestHeaders });

  if (loginResponse.status !== 200) {
    // Podríamos querer loguear loginResponse.data aquí si el status no es 200
    console.error('DEBUG: Paso 2 - Respuesta de Login no exitosa:', JSON.stringify(loginResponse.data, null, 2));
    throw new Error(`Fallo en el login. Status: ${loginResponse.status}`);
  }
  console.log('DEBUG: Paso 2 - Cookies después del Login:', JSON.stringify(sessionCache.cookieJar.toJSON(), null, 2));
  console.log('INFO: Paso 2 - Login exitoso.');

  // Paso 3: Obtener datos de sesión (y credenciales de CouchDB)
  const sessionRequestHeaders = { 'Referer': `${BASE_URL}/es-ES/dashboard` }; // Podríamos añadir 'Accept: application/json' si es necesario
  console.log(`DEBUG: Paso 3 - Petición GET a SESSION_URL: ${SESSION_URL}`);
  console.log('DEBUG: Paso 3 - Headers para obtener sesión:', JSON.stringify(sessionRequestHeaders, null, 2));
  
  const sessionResponse = await sessionCache.authenticatedAxiosInstance.get(SESSION_URL, { headers: sessionRequestHeaders });
  
  console.log('DEBUG: Paso 3 - Status de sessionResponse:', sessionResponse.status);
  console.log('DEBUG: Paso 3 - Contenido de sessionResponse.data:', JSON.stringify(sessionResponse.data, null, 2));

  if (sessionResponse.status !== 200 || !sessionResponse.data || Object.keys(sessionResponse.data).length === 0 || !sessionResponse.data.user || !sessionResponse.data.user.replication) {
    console.error('ERROR: Paso 3 - La estructura de sessionResponse.data no es la esperada o está vacía.');
    throw new Error('No se encontraron los datos de replicación de CouchDB en la sesión.');
  }

  sessionCache.replicationData = sessionResponse.data.user.replication;
  sessionCache.isAuthenticated = true;
  console.log('INFO: Paso 3 - Credenciales de CouchDB obtenidas y cacheadas.');

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
  console.log('INFO: Attempting login via loginAndRetrieveCookies...');
  // Ensure a fresh cookieJar for this login attempt
  const loginCookieJar = new CookieJar();
  const loginAxiosInstance = wrapper(axios.create({ jar: loginCookieJar, withCredentials: true }));

  // Step 1: Get CSRF Token
  const csrfResponse = await loginAxiosInstance.get(CSRF_URL, { headers: { 'Referer': LOGIN_PAGE_URL } });
  const csrfTokenValue = csrfResponse.data.csrfToken;
  if (!csrfTokenValue) {
    throw new Error('Failed to obtain CSRF token during login.');
  }
  console.log('INFO: CSRF token obtained for login.');

  // Step 2: Perform Login
  const loginPayload = new URLSearchParams({ callbackUrl: '/es-ES/dashboard', redirect: 'false', email, password, csrfToken: csrfTokenValue, json: 'true' });
  const loginRequestHeaders = { 'Content-Type': 'application/x-www-form-urlencoded', 'Origin': BASE_URL, 'Referer': LOGIN_PAGE_URL };
  const loginResponse = await loginAxiosInstance.post(SIGN_IN_URL, loginPayload.toString(), { headers: loginRequestHeaders });

  if (loginResponse.status !== 200) {
    console.error('ERROR: BudgetBakers login failed via loginAndRetrieveCookies:', JSON.stringify(loginResponse.data, null, 2));
    throw new Error(`BudgetBakers login failed. Status: ${loginResponse.status}`);
  }
  console.log('INFO: BudgetBakers login successful via loginAndRetrieveCookies.');

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
    console.warn('WARN: Could not fetch replication data for server-side session after login.');
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

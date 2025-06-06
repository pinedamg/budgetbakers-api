// /home/mpineda/Work/projects/node/budgetbakers-api/server.js
/**
 * Propósito: Punto de entrada para iniciar el servidor de la aplicación.
 */
const app = require('./src/app');
const config = require('./src/config');

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}${config.apiVersion}`);
});
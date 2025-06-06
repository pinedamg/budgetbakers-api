// swagger.config.js
const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BudgetBakers API Wrapper',
      version: '1.0.0',
      description:
        'API RESTful para interactuar con la plataforma BudgetBakers y gestionar entidades financieras a través de su CouchDB.',
      contact: {
        name: 'Tu Nombre/Organización',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.apiVersion}`,
        description: 'Servidor de Desarrollo Local',
      },
    ],
    components: {
      schemas: {}, // Schemas will be defined in route files
      securitySchemes: {
        cookieAuth: { // Este es el que queremos
          type: 'apiKey',
          in: 'cookie',
          name: '__Secure-next-auth.session-token',
          description: "Session cookie set after successful login via the /auth/login endpoint. The browser will automatically send this cookie for subsequent requests. You typically don't need to set this manually here."
        }
        // Asegúrate de que no haya una definición de bearerAuth aquí si no la usas.
      }
    },
    security: [ // Aplica cookieAuth globalmente
      { cookieAuth: [] }
    ]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

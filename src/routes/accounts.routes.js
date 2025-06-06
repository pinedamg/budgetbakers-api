// /home/mpineda/Work/projects/node/budgetbakers-api/src/routes/accounts.routes.js
/**
 * Propósito: Definir los endpoints para la entidad 'Accounts'.
 * Mapea las rutas HTTP a las funciones del controlador correspondiente.
 */
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/account.controller');
// const { validateRequest } = require('../middlewares/validation.middleware'); // Ejemplo
// const { accountSchemas } = require('../validators/account.validator'); // Ejemplo

// Documentación de la entidad Account para Swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     Account:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la cuenta asignado por CouchDB.
 *         _rev:
 *           type: string
 *           description: Revisión del documento en CouchDB.
 *         name:
 *           type: string
 *           description: Nombre de la cuenta.
 *         accountType:
 *           type: integer
 *           description: "Tipo numérico de la cuenta (Ej: 0 Banco/Efectivo, 3 Tarjeta de Crédito)."
 *         currencyId:
 *           type: string
 *           description: ID de la moneda asociada a la cuenta.
 *         initAmount:
 *           type: integer
 *           description: Monto inicial de la cuenta.
 *         balance:
 *           type: integer
 *           nullable: true
 *           description: Balance actual (puede no estar presente, se calcula sumando registros).
 *         excludeFromStats:
 *           type: boolean
 *           description: Si la cuenta se excluye de las estadísticas.
 *         archived:
 *           type: boolean
 *           description: Si la cuenta está archivada.
 *         position:
 *           type: integer
 *           description: Orden de la cuenta en la interfaz de usuario.
 *         color:
 *           type: string
 *           description: Color asignado a la cuenta en la interfaz de usuario.
 *         creditCard:
 *           type: object
 *           nullable: true
 *           properties:
 *             limit:
 *               type: integer
 *             dueDay:
 *               type: integer
 *             balanceDisplayOption:
 *               type: integer
 *           description: Detalles específicos si es una tarjeta de crédito.
 *         reservedModelType:
 *           type: string
 *           default: Account
 *           description: Tipo de modelo de la entidad.
 *       example:
 *         _id: "-Account_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 *         name: "Cuenta Principal"
 *         accountType: 0
 *         currencyId: "-Currency_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 *         initAmount: 100000
 *         excludeFromStats: false
 *         archived: false
 *         position: 1000
 *         color: "#4CAF50"
 */

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: API para la gestión de cuentas financieras
 */

// GET /api/v1/accounts - Obtener un listado de todas las cuentas.
/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Lista todas las cuentas del usuario
 *     tags: [Accounts]
 *     parameters:
 *       - in: query
 *         name: nameStartsWith
 *         schema:
 *           type: string
 *         description: Filtrar cuentas cuyo nombre comience con el texto proporcionado.
 *     responses:
 *       200:
 *         description: Listado de cuentas exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Account'
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/', accountController.getAllAccounts);

// GET /api/v1/accounts/:id - Obtener los detalles de una cuenta específica.
/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Obtiene una cuenta específica por su ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID de la cuenta
 *     responses:
 *       200:
 *         description: Detalles de la cuenta.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       404:
 *         description: Cuenta no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id', accountController.getAccountById);

// POST /api/v1/accounts - Crear una nueva cuenta.
/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Crea una nueva cuenta (Placeholder - Lógica de servicio pendiente)
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Account' # Usar el esquema Account para el cuerpo
 *     responses:
 *       201:
 *         description: Cuenta creada exitosamente (Placeholder).
 *       400:
 *         description: Datos de entrada inválidos.
 *       500:
 *         description: Error interno del servidor / Lógica no implementada.
 */
router.post('/', /* validateRequest(accountSchemas.create), */ accountController.createAccount);

// PUT /api/v1/accounts/:id - Actualizar una cuenta existente.
/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Actualiza una cuenta existente (Placeholder - Lógica de servicio pendiente)
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID de la cuenta a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object # O un esquema específico para actualización
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cuenta actualizada exitosamente (Placeholder).
 *       404:
 *         description: Cuenta no encontrada.
 *       500:
 *         description: Error interno del servidor / Lógica no implementada.
 */
router.put('/:id', /* validateRequest(accountSchemas.update), */ accountController.updateAccount);

// DELETE /api/v1/accounts/:id - Archivar o eliminar una cuenta.
/**
 * @swagger
 * /accounts/{id}:
 *   delete:
 *     summary: Elimina o archiva una cuenta (Placeholder - Lógica de servicio pendiente)
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID de la cuenta a eliminar/archivar
 *     responses:
 *       200:
 *         description: Cuenta eliminada/archivada exitosamente (Placeholder).
 *       404:
 *         description: Cuenta no encontrada.
 *       500:
 *         description: Error interno del servidor / Lógica no implementada.
 */
router.delete('/:id', accountController.deleteAccount);

module.exports = router;
// /home/mpineda/Work/projects/node/budgetbakers-api/src/routes/records.routes.js
/**
 * Propósito: Definir los endpoints para la entidad 'Records' (Transacciones).
 * Mapea las rutas HTTP a las funciones del controlador correspondiente.
 */
const express = require('express');
const router = express.Router();
const recordController = require('../controllers/record.controller');

// Documentación de la entidad Record para Swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     Record:
 *       type: object
 *       required:
 *         - accountId
 *         - categoryId
 *         - amount
 *         - recordDate
 *         - currencyId
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único del registro asignado por CouchDB.
 *         _rev:
 *           type: string
 *           description: Revisión del documento en CouchDB.
 *         accountId:
 *           type: string
 *           description: ID de la cuenta a la que pertenece el registro.
 *         categoryId:
 *           type: string
 *           description: ID de la categoría del registro.
 *         currencyId:
 *           type: string
 *           description: ID de la moneda del registro.
 *         recordDate:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora del registro (ISO 8601).
 *         amount:
 *           type: integer
 *           description: Monto del registro (en la unidad mínima de la moneda, ej. centavos).
 *         type:
 *           type: integer
 *           description: "Tipo de registro (0: Ingreso, 1: Gasto, 2: Transferencia)."
 *         payee:
 *           type: string
 *           nullable: true
 *           description: Beneficiario o pagador.
 *         note:
 *           type: string
 *           nullable: true
 *           description: Notas adicionales.
 *         labels:
 *           type: array
 *           items:
 *             type: string
 *           description: Array de IDs de etiquetas (HashTags).
 *         reservedModelType:
 *           type: string
 *           default: Record
 *           description: Tipo de modelo de la entidad.
 *       example:
 *         accountId: "-Account_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 *         categoryId: "-Category_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 *         currencyId: "-Currency_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 *         recordDate: "2024-07-28T10:30:00.000Z"
 *         amount: -2550
 *         type: 1
 *         payee: "Supermercado"
 *         note: "Compra semanal"
 *
 */

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: API para la gestión de registros (transacciones)
 */

// GET /api/v1/records - Obtener listado de registros (con filtros por query params).
/**
 * @swagger
 * /records:
 *   get:
 *     summary: Lista todos los registros
 *     tags: [Records]
 *     parameters:
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *         description: Filtrar registros por ID de cuenta
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar registros desde esta fecha (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Listado de registros exitoso.
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
 *                     $ref: '#/components/schemas/Record'
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/', recordController.getAllRecords);

// GET /api/v1/records/:id - Obtener un registro específico.
/**
 * @swagger
 * /records/{id}:
 *   get:
 *     summary: Obtiene un registro por su ID
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID del registro
 *     responses:
 *       200:
 *         description: Detalles del registro.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record' # Asumiendo que la data es el objeto Record
 *       404:
 *         description: Registro no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id', recordController.getRecordById);

// POST /api/v1/records - Crear un nuevo registro.
/**
 * @swagger
 * /records:
 *   post:
 *     summary: Crea un nuevo registro
 *     tags: [Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Record' # Usar el esquema Record para el cuerpo
 *     responses:
 *       201:
 *         description: Registro creado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       400:
 *         description: Datos de entrada inválidos.
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', recordController.createRecord);

// PUT /api/v1/records/:id - Actualizar un registro existente.
/**
 * @swagger
 * /records/{id}:
 *   put:
 *     summary: Actualiza un registro existente
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID del registro a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object # O un esquema específico para actualización si es diferente
 *             properties:
 *               amount:
 *                 type: integer
 *               note:
 *                 type: string
 *               payee:
 *                 type: string
 *             # ... otros campos actualizables
 *     responses:
 *       200:
 *         description: Registro actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       400:
 *         description: Datos de entrada inválidos.
 *       404:
 *         description: Registro no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/:id', recordController.updateRecord);

// DELETE /api/v1/records/:id - Eliminar un registro.
/**
 * @swagger
 * /records/{id}:
 *   delete:
 *     summary: Elimina un registro
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID del registro a eliminar
 *     responses:
 *       200:
 *         description: Registro eliminado exitosamente.
 *       404:
 *         description: Registro no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete('/:id', recordController.deleteRecord);

module.exports = router;
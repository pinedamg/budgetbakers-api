// /home/mpineda/Work/projects/node/budgetbakers-api/src/routes/labels.routes.js
/**
 * Propósito: Definir los endpoints para la entidad 'Labels' (HashTags).
 */
const express = require('express');
const router = express.Router();
const labelController = require('../controllers/label.controller');

// Documentación de la entidad HashTag (Label) para Swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     HashTag:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la etiqueta asignado por CouchDB (ej. HashTag_uuid).
 *         _rev:
 *           type: string
 *           description: Revisión del documento en CouchDB.
 *         name:
 *           type: string
 *           description: Nombre de la etiqueta.
 *         reservedModelType:
 *           type: string
 *           default: HashTag
 *           description: Tipo de modelo de la entidad.
 *       example:
 *         name: "viaje_2024"
 */

/**
 * @swagger
 * tags:
 *   name: Labels
 *   description: API para la gestión de etiquetas (HashTags)
 */

// GET /api/v1/labels - Obtener listado de todas las etiquetas.
/**
 * @swagger
 * /labels:
 *   get:
 *     summary: Lista todas las etiquetas (HashTags)
 *     tags: [Labels]
 *     responses:
 *       200:
 *         description: Listado de etiquetas exitoso.
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
 *                     $ref: '#/components/schemas/HashTag'
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/', labelController.getAllLabels);

// GET /api/v1/labels/:id - Obtener una etiqueta específica.
/**
 * @swagger
 * /labels/{id}:
 *   get:
 *     summary: Obtiene una etiqueta por su ID
 *     tags: [Labels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID de la etiqueta (ej. HashTag_uuid)
 *     responses:
 *       200:
 *         description: Detalles de la etiqueta.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HashTag'
 *       404:
 *         description: Etiqueta no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id', labelController.getLabelById);

// POST /api/v1/labels - Crear una nueva etiqueta.
/**
 * @swagger
 * /labels:
 *   post:
 *     summary: Crea una nueva etiqueta (HashTag)
 *     tags: [Labels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *             example:
 *               name: "compras_online"
 *     responses:
 *       201:
 *         description: Etiqueta creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HashTag'
 *       400:
 *         description: Datos de entrada inválidos (ej. falta el nombre).
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', labelController.createLabel);

// PUT /api/v1/labels/:id - Actualizar una etiqueta.
/**
 * @swagger
 * /labels/{id}:
 *   put:
 *     summary: Actualiza una etiqueta existente
 *     tags: [Labels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID de la etiqueta a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             example:
 *               name: "compras_supermercado_api"
 *     responses:
 *       200:
 *         description: Etiqueta actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HashTag'
 *       400:
 *         description: Datos de entrada inválidos.
 *       404:
 *         description: Etiqueta no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/:id', labelController.updateLabel);

// DELETE /api/v1/labels/:id - Eliminar una etiqueta.
/**
 * @swagger
 * /labels/{id}:
 *   delete:
 *     summary: Elimina una etiqueta
 *     tags: [Labels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID de la etiqueta a eliminar
 *     responses:
 *       200:
 *         description: Etiqueta eliminada exitosamente.
 *       404:
 *         description: Etiqueta no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete('/:id', labelController.deleteLabel);

module.exports = router;
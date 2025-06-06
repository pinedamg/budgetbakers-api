// /home/mpineda/Work/projects/node/budgetbakers-api/src/routes/categories.routes.js
/**
 * Propósito: Definir los endpoints para la entidad 'Categories'.
 */
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Documentación de la entidad Category para Swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - envelopeId
 *       properties:
 *         _id:
 *           type: string
 *           description: ID único de la categoría asignado por CouchDB.
 *         _rev:
 *           type: string
 *           description: Revisión del documento en CouchDB.
 *         name:
 *           type: string
 *           description: Nombre de la categoría.
 *         color:
 *           type: string
 *           description: Color hexadecimal asignado a la categoría (ej. #FF6F00).
 *         iconName:
 *           type: string
 *           nullable: true
 *           description: Nombre del icono para la categoría.
 *         customCategory:
 *           type: boolean
 *           description: Indica si es una categoría personalizada (true) o del sistema (false).
 *         categoryType:
 *           type: integer
 *           description: "Tipo de categoría (0: Ingreso, 1: Gasto)."
 *         envelopeId:
 *           type: integer
 *           description: ID del "sobre" o grupo al que pertenece la categoría. Requerido para creación y relevante para la jerarquía.
 *         parentId:
 *           type: string
 *           nullable: true
 *           description: ID de la categoría padre (si es una subcategoría personalizada de otra personalizada).
 *         reservedModelType:
 *           type: string
 *           default: Category
 *           description: Tipo de modelo de la entidad.
 *       example:
 *         name: "Alimentación"
 *         color: "#4CAF50"
 *         iconName: "restaurant-menu-filled"
 *         customCategory: true
 *         categoryType: 1
 *         envelopeId: 3001
 */

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API para la gestión de categorías
 */

// GET /api/v1/categories - Obtener listado de todas las categorías.
/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Lista todas las categorías
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: customCategory
 *         schema:
 *           type: boolean
 *         description: Filtrar por categorías personalizadas (true) o del sistema (false).
 *     responses:
 *       200:
 *         description: Listado de categorías exitoso.
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
 *                     $ref: '#/components/schemas/Category'
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/', categoryController.getAllCategories);

// POST /api/v1/categories - Crear una nueva categoría.
/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Crea una nueva categoría
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Datos de entrada inválidos (ej. falta nombre o envelopeId, o envelopeId no válido).
 *       500:
 *         description: Error interno del servidor.
 */
router.post('/', categoryController.createCategory);

// PUT /api/v1/categories/:id - Actualizar una categoría.
/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Actualiza una categoría existente
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID de la categoría a actualizar
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
 *               iconName:
 *                 type: string
 *               envelopeId: # Si se permite cambiar, debe cumplir la regla
 *                 type: integer
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Datos de entrada inválidos o intento de modificar una categoría no permitida.
 *       404:
 *         description: Categoría no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/:id', categoryController.updateCategory);

// DELETE /api/v1/categories/:id - Eliminar una categoría.
/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Elimina una categoría
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: El ID de la categoría a eliminar
 *     responses:
 *       200:
 *         description: Categoría eliminada exitosamente.
 *       400:
 *         description: Intento de eliminar una categoría no permitida.
 *       404:
 *         description: Categoría no encontrada.
 *       500:
 *         description: Error interno del servidor.
 */
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
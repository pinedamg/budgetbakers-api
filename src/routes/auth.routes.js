// /home/mpineda/Work/projects/node/budgetbakers-api/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginCredentials:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's BudgetBakers email.
 *         password:
 *           type: string
 *           format: password
 *           description: User's BudgetBakers password.
 *       example:
 *         email: "user@example.com"
 *         password: "yourpassword"
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Logs in a user and sets session cookies
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       description: User credentials for login.
 *       content:
 *         application/x-www-form-urlencoded: # Changed from application/json
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful, session cookie set in browser.
 *       400:
 *         description: Invalid credentials or missing email/password.
 *       500:
 *         description: Internal server error during login process.
 */
router.post('/login', authController.login);

module.exports = router;
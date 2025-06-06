// /home/mpineda/Work/projects/node/budgetbakers-api/src/controllers/account.controller.js
/**
 * Propósito: Manejar la lógica de las peticiones y respuestas HTTP para la entidad 'Accounts'.
 * Recibe la petición, llama a los servicios necesarios y formula la respuesta.
 * No debe contener lógica de negocio compleja.
 */
const accountService = require('../services/accountService');
const { formatSuccessResponse, formatErrorResponse } = require('../helpers/responseFormatter.helper');
// const { validateInput } = require('../middlewares/validation.middleware'); // Ejemplo
// const { accountSchema } = require('../validators/account.validator'); // Ejemplo

exports.getAllAccounts = async (req, res, next) => {
  try {
    const filters = req.query; // Capturamos todos los query params
    const accounts = await accountService.fetchAllAccounts(filters);
    res.status(200).json(formatSuccessResponse(accounts));
  } catch (error) {
    next(error);
  }
};

exports.getAccountById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Aquí iría la validación del ID si es necesario antes de llamar al servicio
    const account = await accountService.fetchAccountById(id);
    if (!account) {
      return res.status(404).json(formatErrorResponse('Account not found'));
    }
    res.status(200).json(formatSuccessResponse(account));
  } catch (error) {
    next(error);
  }
};

exports.createAccount = async (req, res, next) => {
  try {
    // Aquí iría la validación de req.body (ej. usando Joi y un middleware de validación)
    // await validateInput(accountSchema.create, req.body);
    const newAccount = await accountService.createAccount(req.body);
    res.status(201).json(formatSuccessResponse(newAccount, 'Account created successfully'));
  } catch (error) {
    next(error);
  }
};

exports.updateAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Validar ID y req.body
    const updatedAccount = await accountService.updateAccount(id, req.body);
    if (!updatedAccount) {
      return res.status(404).json(formatErrorResponse('Account not found for update'));
    }
    res.status(200).json(formatSuccessResponse(updatedAccount, 'Account updated successfully'));
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Validar ID
    const result = await accountService.deleteAccount(id);
    if (!result || (result && result.success === false)) { // Ajustar según lo que devuelva el servicio
        return res.status(404).json(formatErrorResponse('Account not found for deletion or deletion failed'));
    }
    res.status(200).json(formatSuccessResponse(null, 'Account deleted successfully'));
  } catch (error) {
    next(error);
  }
};
// /home/mpineda/Work/projects/node/budgetbakers-api/src/controllers/record.controller.js
/**
 * Propósito: Manejar la lógica de las peticiones y respuestas HTTP para 'Records'.
 */
const recordService = require('../services/recordService');
const { formatSuccessResponse, formatErrorResponse } = require('../helpers/responseFormatter.helper');

exports.getAllRecords = async (req, res, next) => {
  try {
    const filters = req.query; // Para filtrar por fecha, cuenta, etc.
    const records = await recordService.fetchAllRecords(filters);
    res.status(200).json(formatSuccessResponse(records));
  } catch (error) {
    next(error);
  }
};

exports.getRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await recordService.fetchRecordById(id);
    if (!record) {
      return res.status(404).json(formatErrorResponse('Record not found'));
    }
    res.status(200).json(formatSuccessResponse(record));
  } catch (error) {
    next(error);
  }
};

exports.createRecord = async (req, res, next) => {
  try {
    const newRecord = await recordService.createRecord(req.body);
    res.status(201).json(formatSuccessResponse(newRecord, 'Record created successfully'));
  } catch (error) {
    next(error);
  }
};

exports.updateRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedRecord = await recordService.updateRecord(id, req.body);
    if (!updatedRecord) {
      return res.status(404).json(formatErrorResponse('Record not found for update'));
    }
    res.status(200).json(formatSuccessResponse(updatedRecord, 'Record updated successfully'));
  } catch (error) {
    next(error);
  }
};

exports.deleteRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
            const result = await recordService.deleteRecord(id);
            if (!result) { // Si el servicio devuelve null (no encontrado)
              return res.status(404).json(formatErrorResponse('Record not found for deletion'));
            }
            res.status(200).json(formatSuccessResponse(result, 'Record deleted successfully')); // Devolver el resultado del servicio
  } catch (error) {
    next(error);
  }
};
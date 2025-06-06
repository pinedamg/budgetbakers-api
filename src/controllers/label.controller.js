// /home/mpineda/Work/projects/node/budgetbakers-api/src/controllers/label.controller.js
/**
 * Propósito: Manejar la lógica de las peticiones y respuestas HTTP para 'Labels' (HashTags).
 */
const labelService = require('../services/labelService');
const { formatSuccessResponse, formatErrorResponse } = require('../helpers/responseFormatter.helper');

exports.getAllLabels = async (req, res, next) => {
  try {
    const labels = await labelService.fetchAllLabels();
    res.status(200).json(formatSuccessResponse(labels));
  } catch (error) {
    next(error);
  }
};

exports.getLabelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const label = await labelService.fetchLabelById(id);
    if (!label) {
      return res.status(404).json(formatErrorResponse('Label not found'));
    }
    res.status(200).json(formatSuccessResponse(label));
  } catch (error) {
    next(error);
  }
};

exports.createLabel = async (req, res, next) => {
  try {
    const newLabel = await labelService.createLabel(req.body);
    res.status(201).json(formatSuccessResponse(newLabel, 'Label created successfully'));
  } catch (error) {
    next(error);
  }
};

exports.updateLabel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedLabel = await labelService.updateLabel(id, req.body);
    if (!updatedLabel) {
      return res.status(404).json(formatErrorResponse('Label not found for update'));
    }
    res.status(200).json(formatSuccessResponse(updatedLabel, 'Label updated successfully'));
  } catch (error) {
    next(error);
  }
};

exports.deleteLabel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await labelService.deleteLabel(id);
    if (!result || (result && result.success === false)) {
        return res.status(404).json(formatErrorResponse('Label not found for deletion or deletion failed'));
    }
    res.status(200).json(formatSuccessResponse(null, 'Label deleted successfully'));
  } catch (error) {
    next(error);
  }
};
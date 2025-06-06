// /home/mpineda/Work/projects/node/budgetbakers-api/src/controllers/category.controller.js
/**
 * Propósito: Manejar la lógica de las peticiones y respuestas HTTP para 'Categories'.
 */
const categoryService = require('../services/categoryService');
const { formatSuccessResponse, formatErrorResponse } = require('../helpers/responseFormatter.helper');

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.fetchAllCategories();
    res.status(200).json(formatSuccessResponse(categories));
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const newCategory = await categoryService.createCategory(req.body);
    res.status(201).json(formatSuccessResponse(newCategory, 'Category created successfully'));
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedCategory = await categoryService.updateCategory(id, req.body);
    if (!updatedCategory) {
      return res.status(404).json(formatErrorResponse('Category not found for update'));
    }
    res.status(200).json(formatSuccessResponse(updatedCategory, 'Category updated successfully'));
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await categoryService.deleteCategory(id);
     if (!result || (result && result.success === false)) {
        return res.status(404).json(formatErrorResponse('Category not found for deletion or deletion failed'));
    }
    res.status(200).json(formatSuccessResponse(null, 'Category deleted successfully'));
  } catch (error) {
    next(error);
  }
};
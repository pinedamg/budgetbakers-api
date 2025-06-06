// /home/mpineda/Work/projects/node/budgetbakers-api/src/services/categoryService.js
/**
 * Propósito: Lógica de negocio para 'Categories'.
 */
const authService = require('./authService');
const nano = require('nano');
const config = require('../config');
const { randomUUID } = require('node:crypto');

async function getDb() {
  const { session } = await authService.getAuthenticatedData();
  if (!session || !session.url || !session.dbName || !session.login || !session.token) {
    throw new Error('No se pudieron obtener los datos completos de la sesión de CouchDB desde authService (categoryService).');
  }

  const couchDbUrlWithAuth = `${session.url.replace('https://', `https://${session.login}:${session.token}@`)}`;

  try {
    const nanoConfig = {
      url: couchDbUrlWithAuth,
      requestDefaults: { headers: { 'Referer': session.url } }
    };
    const dbClient = nano(nanoConfig);
    return {
      db: dbClient.use(session.dbName),
      ownerId: session.ownerId,
    };
  } catch (error) {
    console.error('Error al conectar con CouchDB usando nano (categoryService):', error);
    throw new Error(`Error al conectar con CouchDB (categoryService): ${error.message}`);
  }
}

exports.fetchAllCategories = async () => {
  const { db } = await getDb();
  let categories = [];
  try {
    const response = await db.list({ include_docs: true });
    if (response && response.rows) {
      categories = response.rows
        .map(row => row.doc)
        .filter(doc => doc && doc.reservedModelType === "Category");
    } else {
      console.warn('WARN: La respuesta de db.list para categorías no contiene rows o es inesperada:', response);
    }
  } catch (error) {
    console.error('Error al obtener categorías de CouchDB:', error);
    throw new Error(`No se pudieron obtener las categorías: ${error.message}`);
  }
  return categories;
};

exports.createCategory = async (categoryData) => {
  // BudgetBakers podría tener una forma específica de manejar esto,
  // podría no ser un simple insert en CouchDB si tienen IDs predefinidos o una API específica.
  // Por ahora, asumimos que podemos crear categorías personalizadas.
  const { db, ownerId } = await getDb();
  const now = new Date().toISOString();

  if (!categoryData.name || !categoryData.envelopeId) {
    throw new Error('Los campos "name" y "envelopeId" son obligatorios para crear una categoría.');
  }

  if (!String(categoryData.envelopeId).startsWith('3')) {
    throw new Error('La categoría solo puede crearse dentro de un envelopeId que comience con "3".');
  }

  const newCategoryDocument = {
    _id: `Category_${randomUUID()}`,
    reservedModelType: "Category",
    reservedOwnerId: ownerId,
    reservedAuthorId: ownerId,
    reservedCreatedAt: now,
    reservedUpdatedAt: now,
    name: categoryData.name,
    color: categoryData.color || '#CCCCCC', // Color por defecto
    icon: categoryData.icon || 'default_icon', // Icono por defecto
    customCategory: true, // Las categorías creadas vía API son personalizadas
    categoryType: categoryData.categoryType === undefined ? 1 : categoryData.categoryType, // 0: Ingreso, 1: Gasto (Gasto por defecto)
    // Otros campos que BudgetBakers pueda usar para categorías
    ...categoryData,
  };

  try {
    const response = await db.insert(newCategoryDocument);
    if (response.ok) {
      return { ...newCategoryDocument, _id: response.id, _rev: response.rev };
    } else {
      throw new Error('La creación de la categoría en CouchDB no fue exitosa.');
    }
  } catch (error) {
    console.error('Error al crear la categoría en CouchDB:', error);
    throw new Error(`No se pudo crear la categoría: ${error.message}`);
  }
};

exports.updateCategory = async (categoryId, updateData) => {
  const { db } = await getDb();
  const now = new Date().toISOString();
  try {
    const existingCategory = await db.get(categoryId);
    if (!existingCategory || existingCategory.reservedModelType !== "Category") {
      return null; // No encontrado o no es una categoría
    }

    if (!existingCategory.envelopeId || !String(existingCategory.envelopeId).startsWith('3')) {
      throw new Error('Esta categoría no pertenece a un envelope modificable (debe empezar con "3").');
    }

    // Si se intenta cambiar el envelopeId, validar que el nuevo también cumpla la regla
    if (updateData.envelopeId && !String(updateData.envelopeId).startsWith('3')) {
      throw new Error('El nuevo envelopeId no es válido (debe empezar con "3").');
    }

    const updatedCategoryDocument = {
      ...existingCategory,
      ...updateData,
      _id: existingCategory._id,
      _rev: existingCategory._rev,
      reservedUpdatedAt: now,
    };
    const response = await db.insert(updatedCategoryDocument);
    if (response.ok) {
      return { ...updatedCategoryDocument, _rev: response.rev };
    }
    throw new Error('La actualización de la categoría no fue exitosa.');
  } catch (error) {
    if (error.statusCode === 404) {
      return null; // No encontrado
    }
    console.error(`Error al actualizar categoría ${categoryId}:`, error);
    throw new Error(`No se pudo actualizar la categoría: ${error.message}`);
  }
};

exports.deleteCategory = async (categoryId) => {
  // Considerar si BudgetBakers permite eliminar categorías o solo archivarlas/ocultarlas.
  const { db } = await getDb();
  try {
    const categoryToDelete = await db.get(categoryId);
    if (!categoryToDelete || categoryToDelete.reservedModelType !== "Category") {
      return null; // No encontrado o no es una categoría
    }

    if (!categoryToDelete.envelopeId || !String(categoryToDelete.envelopeId).startsWith('3')) {
      throw new Error('Esta categoría no pertenece a un envelope eliminable (debe empezar con "3").');
    }

    const response = await db.destroy(categoryToDelete._id, categoryToDelete._rev);
    if (response.ok) return { success: true, id: response.id, rev: response.rev };
    throw new Error('La eliminación de la categoría no fue exitosa.');
  } catch (error) {
    if (error.statusCode === 404) {
      return null; // No encontrado
    }
    console.error(`Error al eliminar categoría ${categoryId}:`, error);
    throw new Error(`No se pudo eliminar la categoría: ${error.message}`);
  }
};
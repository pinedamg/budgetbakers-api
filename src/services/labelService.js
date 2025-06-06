// /home/mpineda/Work/projects/node/budgetbakers-api/src/services/labelService.js
/**
 * Propósito: Lógica de negocio para 'Labels' (HashTags).
 */
const authService = require('./authService');
const nano = require('nano');
const config = require('../config');
const { randomUUID } = require('node:crypto');

async function getDb() {
  const { session } = await authService.getAuthenticatedData();
  if (!session || !session.url || !session.dbName || !session.login || !session.token) {
    throw new Error('No se pudieron obtener los datos completos de la sesión de CouchDB desde authService (labelService).');
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
    console.error('Error al conectar con CouchDB usando nano (labelService):', error);
    throw new Error(`Error al conectar con CouchDB (labelService): ${error.message}`);
  }
}

exports.fetchAllLabels = async () => {
  const { db } = await getDb();
  let labels = [];
  try {
    const response = await db.list({ include_docs: true });
    if (response && response.rows) {
      labels = response.rows
        .map(row => row.doc)
        .filter(doc => doc && doc.reservedModelType === "HashTag");
    } else {
      console.warn('WARN: La respuesta de db.list para etiquetas no contiene rows o es inesperada:', response);
    }
  } catch (error) {
    console.error('Error al obtener etiquetas de CouchDB:', error);
    throw new Error(`No se pudieron obtener las etiquetas: ${error.message}`);
  }
  return labels;
};

exports.fetchLabelById = async (labelId) => {
  const { db } = await getDb();
  try {
    const label = await db.get(labelId);
    if (label && label.reservedModelType === "HashTag") {
      return label;
    } else if (label) {
      console.warn(`Documento con ID ${labelId} encontrado, pero no es de tipo "HashTag". Tipo: ${label.reservedModelType}`);
      return null;
    }
    return null; // No encontrado (aunque db.get lanzaría un error 404 que se captura abajo)
  } catch (error) {
    if (error.statusCode === 404) {
      return null; // Manejar el 'not found' de CouchDB devolviendo null
    }
    console.error(`Error al obtener etiqueta por ID ${labelId}:`, error);
    throw new Error(`No se pudo obtener la etiqueta: ${error.message}`);
  }
};

exports.createLabel = async (labelData) => {
  const { db, ownerId } = await getDb();
  const now = new Date().toISOString();

  if (!labelData.name) {
    throw new Error('El campo "name" es obligatorio para crear una etiqueta.');
  }

  const newLabelDocument = {
    _id: `HashTag_${randomUUID()}`,
    reservedModelType: "HashTag",
    reservedOwnerId: ownerId,
    reservedAuthorId: ownerId,
    reservedCreatedAt: now,
    reservedUpdatedAt: now,
    name: labelData.name,
    // Otros campos que BudgetBakers pueda usar para etiquetas
    ...labelData,
  };

  try {
    const response = await db.insert(newLabelDocument);
    if (response.ok) {
      return { ...newLabelDocument, _id: response.id, _rev: response.rev };
    } else {
      throw new Error('La creación de la etiqueta en CouchDB no fue exitosa.');
    }
  } catch (error) {
    console.error('Error al crear la etiqueta en CouchDB:', error);
    throw new Error(`No se pudo crear la etiqueta: ${error.message}`);
  }
};

exports.updateLabel = async (labelId, updateData) => {
  const { db } = await getDb();
  const now = new Date().toISOString();
  try {
    const existingLabel = await db.get(labelId);
    if (!existingLabel || existingLabel.reservedModelType !== "HashTag") return null;

    const updatedLabelDocument = {
      ...existingLabel,
      ...updateData,
      _id: existingLabel._id,
      _rev: existingLabel._rev,
      reservedUpdatedAt: now,
    };
    const response = await db.insert(updatedLabelDocument);
    if (response.ok) {
      return { ...updatedLabelDocument, _rev: response.rev };
    }
    throw new Error('La actualización de la etiqueta no fue exitosa.');
  } catch (error) {
    if (error.statusCode === 404) return null;
    console.error(`Error al actualizar etiqueta ${labelId}:`, error);
    throw new Error(`No se pudo actualizar la etiqueta: ${error.message}`);
  }
};

exports.deleteLabel = async (labelId) => {
  const { db } = await getDb();
  try {
    const labelToDelete = await db.get(labelId);
    if (!labelToDelete || labelToDelete.reservedModelType !== "HashTag") return null;
    const response = await db.destroy(labelToDelete._id, labelToDelete._rev);
    if (response.ok) return { success: true, id: response.id, rev: response.rev };
    throw new Error('La eliminación de la etiqueta no fue exitosa.');
  } catch (error) {
    if (error.statusCode === 404) return null;
    console.error(`Error al eliminar etiqueta ${labelId}:`, error);
    throw new Error(`No se pudo eliminar la etiqueta: ${error.message}`);
  }
};
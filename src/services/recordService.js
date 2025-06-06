// /home/mpineda/Work/projects/node/budgetbakers-api/src/services/recordService.js
/**
 * Propósito: Lógica de negocio para 'Records' (Transacciones).
 * Interactuará con BudgetBakers/CouchDB usando authService.
 */
const authService = require('./authService');
const nano = require('nano');
const config = require('../config');
const { randomUUID } = require('node:crypto'); // Para generar IDs únicos

async function getDb() {
  const { session } = await authService.getAuthenticatedData();
  if (!session || !session.url || !session.dbName || !session.login || !session.token) {
    throw new Error('No se pudieron obtener los datos completos de la sesión de CouchDB desde authService.');
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
      ownerId: session.ownerId, // Necesitaremos el ownerId para crear registros
    };
  } catch (error) {
    console.error('Error al conectar con CouchDB usando nano (recordService):', error);
    throw new Error(`Error al conectar con CouchDB (recordService): ${error.message}`);
  }
}


exports.fetchAllRecords = async (filters) => {
  const { db } = await getDb(); // Solo necesitamos la 'db' aquí, no el ownerId directamente.
  let records = [];

  try {
    console.log('DEBUG: Intentando obtener documentos de registros con db.list({ include_docs: true })');
    const response = await db.list({ include_docs: true });

    if (response && response.rows) {
      records = response.rows
        .map(row => row.doc)
        .filter(doc => doc && doc.reservedModelType === "Record");
    } else {
      console.warn('WARN: La respuesta de db.list para registros no contiene rows o es inesperada:', response);
      records = [];
    }
  } catch (error) {
    console.error('Error al obtener registros de CouchDB:', error);
    throw new Error(`No se pudieron obtener los registros: ${error.message}`);
  }

  // Aplicar filtros básicos en la aplicación (ejemplos)
  // Para filtros más complejos o eficientes, se necesitarían vistas de CouchDB o Mango Queries si _find funcionara.
  if (filters.accountId) {
    records = records.filter(record => record.accountId === filters.accountId);
  }
  if (filters.dateFrom) { // Asume formato YYYY-MM-DD
    records = records.filter(record => record.recordDate && new Date(record.recordDate) >= new Date(filters.dateFrom));
  }
  // Añadir más filtros según sea necesario (ej. dateTo, categoryId, type, etc.)

  return records;
};

exports.fetchRecordById = async (recordId) => {
  const { db } = await getDb();
  try {
    const record = await db.get(recordId);
    // Opcional: Verificar si es realmente un registro, aunque get por ID debería ser específico.
    // Si el ID no corresponde a un documento de tipo "Record", podría devolverlo igual
    // o podrías querer añadir una validación aquí.
    if (record && record.reservedModelType === "Record") {
      return record;
    } else if (record) {
      // El ID existe pero no es un 'Record'
      console.warn(`Documento con ID ${recordId} encontrado, pero no es de tipo "Record". Tipo: ${record.reservedModelType}`);
      return null; // O manejar como un error específico si se prefiere
    }
    return null; // No encontrado (aunque db.get lanzaría un error 404 que se captura abajo)
  } catch (error) {
    if (error.statusCode === 404) {
      return null; // Manejar el 'not found' de CouchDB devolviendo null
    }
    console.error(`Error al obtener registro por ID ${recordId}:`, error);
    throw new Error(`No se pudo obtener el registro: ${error.message}`);
  }
};

exports.createRecord = async (recordData) => {
  const { db, ownerId } = await getDb();
  const now = new Date().toISOString();

  // Validar que recordData contenga los campos mínimos necesarios
  if (!recordData.accountId || !recordData.categoryId || !recordData.amount || !recordData.recordDate) {
    throw new Error('Faltan campos obligatorios para crear el registro (accountId, categoryId, amount, recordDate).');
  }

  const newRecordDocument = {
    _id: `Record_${randomUUID()}`, // Generar un ID único para el registro
    reservedModelType: "Record",
    reservedOwnerId: ownerId,
    reservedAuthorId: ownerId, // Usualmente el mismo que ownerId
    reservedCreatedAt: now,
    reservedUpdatedAt: now,
    // Campos que vienen del request (recordData)
    accountId: recordData.accountId,
    categoryId: recordData.categoryId,
    amount: recordData.amount, // Debería ser un número. BudgetBakers lo maneja como entero (ej. 150075 para 1500.75)
    recordDate: recordData.recordDate, // Formato ISO String: "2025-06-05T15:00:00.000Z"
    // Campos adicionales según tu flujo documentado y necesidades
    currencyId: recordData.currencyId, // Importante
    type: recordData.type || (recordData.amount > 0 ? 0 : 1), // 0 ingreso, 1 gasto, 2 transferencia
    refAmount: recordData.refAmount || recordData.amount,
    paymentType: recordData.paymentType || 0,
    recordState: recordData.recordState || 1, // 1 activo
    transfer: recordData.transfer || false,
    payee: recordData.payee || null,
    note: recordData.note || null,
    labels: recordData.labels || [],
    reservedSource: recordData.reservedSource || "api_v1_script", // Opcional: para identificar el origen
    ...recordData // Permite pasar otros campos si es necesario, pero los definidos arriba tienen precedencia
  };

  try {
    const response = await db.insert(newRecordDocument);
    if (response.ok) {
      return { id: response.id, rev: response.rev, ...newRecordDocument };
    } else {
      throw new Error('La creación del registro en CouchDB no fue exitosa.');
    }
  } catch (error) {
    console.error('Error al crear el registro en CouchDB:', error);
    // Podrías querer formatear el error de CouchDB si es un error de conflicto (409) u otro.
    throw new Error(`No se pudo crear el registro: ${error.message}`);
  }
};

exports.updateRecord = async (recordId, updateData) => {
  const { db, ownerId } = await getDb(); // ownerId podría ser útil si necesitas revalidar la autoría
  const now = new Date().toISOString();

  try {
    const existingRecord = await db.get(recordId);
    if (!existingRecord || existingRecord.reservedModelType !== "Record") {
      // Si db.get no encuentra, lanzará un error 404 que se captura abajo.
      // Esta es una doble verificación o para el caso de que el ID exista pero no sea un Record.
      return null;
    }

    // Fusionar los datos existentes con los datos de actualización.
    // Los campos en updateData sobrescribirán los existentes.
    const updatedRecordDocument = {
      ...existingRecord,
      ...updateData,
      _id: existingRecord._id, // Asegurar que el _id no cambie
      _rev: existingRecord._rev, // ¡Muy importante para la actualización!
      reservedUpdatedAt: now,
      // Opcional: si quieres asegurar que reservedOwnerId y reservedAuthorId no se modifiquen por error desde updateData
      // reservedOwnerId: existingRecord.reservedOwnerId,
      // reservedAuthorId: existingRecord.reservedAuthorId,
    };

    const response = await db.insert(updatedRecordDocument);
    if (response.ok) {
      return { ...updatedRecordDocument, _rev: response.rev }; // Devolver el documento actualizado con el nuevo _rev
    } else {
      throw new Error('La actualización del registro en CouchDB no fue exitosa.');
    }
  } catch (error) {
    if (error.statusCode === 404) {
      return null; // El registro a actualizar no fue encontrado
    }
    console.error(`Error al actualizar el registro ${recordId} en CouchDB:`, error);
    // Podrías querer formatear el error de CouchDB si es un error de conflicto (409) u otro.
    throw new Error(`No se pudo actualizar el registro: ${error.message}`);
  }
};

exports.deleteRecord = async (recordId) => {
  const { db } = await getDb();

  try {
    // Primero, obtenemos el documento para conseguir su _rev actual.
    const recordToDelete = await db.get(recordId);

    if (!recordToDelete || recordToDelete.reservedModelType !== "Record") {
      // Si db.get no encuentra, lanzará un error 404 que se captura abajo.
      // Esta es una doble verificación o para el caso de que el ID exista pero no sea un Record.
      return null; // O false, o lanzar un error específico
    }

    const response = await db.destroy(recordToDelete._id, recordToDelete._rev);

    if (response.ok) {
      return { success: true, id: response.id, rev: response.rev };
    } else {
      throw new Error('La eliminación del registro en CouchDB no fue exitosa.');
    }
  } catch (error) {
    if (error.statusCode === 404) {
      return null; // El registro a eliminar no fue encontrado
    }
    console.error(`Error al eliminar el registro ${recordId} en CouchDB:`, error);
    throw new Error(`No se pudo eliminar el registro: ${error.message}`);
  }
};
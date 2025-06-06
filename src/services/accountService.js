// /home/mpineda/Work/projects/node/budgetbakers-api/src/services/accountService.js
/**
 * Propósito: Contener la lógica de negocio principal para la entidad 'Accounts'.
 * Interactúa con la API de BudgetBakers (a través de CouchDB o su API directa)
 * utilizando el cliente autenticado proporcionado por authService.
 */
const { getUserDatabase } = require('../helpers/database.helper');
// const config = require('../config'); // Podría no ser necesario aquí si no se usa directamente

exports.fetchAllAccounts = async (filters = {}) => {
  const { db } = await getUserDatabase(); // Usamos el helper
  let accounts = [];

  try {
    // Obtener todos los documentos. BudgetBakers podría tener un 'type' o 'reservedModelType' para filtrar cuentas.
    // Por ahora, asumimos que todos los documentos con un campo 'name' y un 'reservedModelType: "Account"' son cuentas.
    // Cambiamos de db.find a db.list para evitar el error "Only reserved document ids may start with underscore."
    // Esto es menos eficiente pero nos ayudará a diagnosticar.
    console.log('DEBUG: Intentando obtener documentos con db.list({ include_docs: true })');
    const response = await db.list({ include_docs: true });
    
    if (response && response.rows) {
      accounts = response.rows
        .map(row => row.doc)
        .filter(doc => doc && doc.reservedModelType === "Account"); // Asegurarse de que doc exista
    } else {
      console.warn('WARN: La respuesta de db.list no contiene rows o es inesperada:', response);
      accounts = [];
    }

  } catch (error) {
    console.error('Error al obtener cuentas de CouchDB:', error);
    throw new Error(`No se pudieron obtener las cuentas: ${error.message}`);
  }

  if (filters.nameStartsWith) {
    accounts = accounts.filter(account =>
      account.name && account.name.toLowerCase().startsWith(filters.nameStartsWith.toLowerCase())
    );
  }
  return accounts;
};

exports.fetchAccountById = async (accountId) => {
  // const db = await getDb();
  // return await db.get(accountId);
  console.warn('accountService.fetchAccountById: Implementación pendiente.');
  if (accountId === '1') return { id: '1', name: 'Account 1 Details' };
  return null;
};

exports.createAccount = async (accountData) => {
  // const db = await getDb();
  // const response = await db.insert(accountData);
  // return { id: response.id, ...accountData };
  console.warn('accountService.createAccount: Implementación pendiente.');
  return { id: `new_${Date.now()}`, ...accountData };
};

exports.updateAccount = async (accountId, updateData) => {
  // const db = await getDb();
  // const doc = await db.get(accountId);
  // const response = await db.insert({ ...doc, ...updateData, _rev: doc._rev });
  // return { id: response.id, ...updateData };
  console.warn('accountService.updateAccount: Implementación pendiente.');
  if (accountId === '1') return { id: '1', ...updateData };
  return null;
};

exports.deleteAccount = async (accountId) => {
  // const db = await getDb();
  // const doc = await db.get(accountId);
  // await db.destroy(accountId, doc._rev); // O marcar como archivado
  console.warn('accountService.deleteAccount: Implementación pendiente.');
  if (accountId === '1') return { success: true };
  return null;
};
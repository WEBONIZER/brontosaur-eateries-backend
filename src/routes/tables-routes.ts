
import { Router } from 'express';
import { getAllTables, getTableById, addOrderToTable, removeOrderFromTable } from '../controllers/tables-controllers'

const tables = Router();


tables.get('/', getAllTables);
tables.get('/:tableId', getTableById);
tables.post('/:tableId/orders', addOrderToTable);
tables.delete('/:tableId/orders/:orderId', removeOrderFromTable);

export default tables; 
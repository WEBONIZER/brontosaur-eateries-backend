
import { Router } from 'express';
import { getAllTables, getTableById, addOrderToTable } from '../controllers/tables-controllers'

const tables = Router();


tables.get('/', getAllTables);
tables.get('/:tableId', getTableById);
tables.post('/:tableId/orders', addOrderToTable);

export default tables; 
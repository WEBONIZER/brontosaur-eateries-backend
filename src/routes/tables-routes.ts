
import { Router } from 'express';
import { getAllTables, getTableById } from '../controllers/tables-controllers'

const tables = Router();


tables.get('/', getAllTables);
tables.get('/:tableId', getTableById);



export default tables; 
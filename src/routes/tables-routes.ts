
import { Router } from 'express';
import { 
    getAllTables, 
    getTableById, 
    addOrderToTable, 
    removeOrderFromTable, 
    updateTableBlocked, 
    updateUserCancelled, 
    deleteTableById,
    getAllTablesByBarId
} from '../controllers/tables-controllers'
import { authMiddleware } from '../middlewares/auth-middlewares';

const tables = Router();


tables.get('/', authMiddleware, getAllTables);
tables.get('/:tableId', authMiddleware, getTableById);
tables.get('/bar-id/:barId', authMiddleware, getAllTablesByBarId);
tables.delete('/:tableId', authMiddleware, deleteTableById);
tables.post('/:tableId/orders', authMiddleware, addOrderToTable);
tables.delete('/:tableId/orders/:orderId', authMiddleware, removeOrderFromTable);
tables.patch('/:tableId/blocked', authMiddleware, updateTableBlocked);
tables.patch('/:tableId/orders/:orderId/user-cancelled', authMiddleware, updateUserCancelled);

export default tables; 
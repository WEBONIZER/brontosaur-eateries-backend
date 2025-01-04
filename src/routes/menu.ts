import { Router } from 'express';
import {
    getAllMenuItems,
    getMenuItemByID,
    postOneMenuItem,
    updateMenuItem,
    deleteMenuItemByID
} from '../controllers/menu';
import { authMiddleware } from '../middlewares/auth-middlewares';

const menu = Router();

menu.get('/all-items', authMiddleware, getAllMenuItems);
menu.post('/all-items', authMiddleware, postOneMenuItem);
menu.get('/all-items/:menuItemId', authMiddleware, getMenuItemByID)
menu.put('/all-items/:menuItemId', authMiddleware, updateMenuItem);
menu.delete('/all-items/:menuItemId', authMiddleware, deleteMenuItemByID);

export default menu; 
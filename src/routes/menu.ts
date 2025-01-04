import { Router } from 'express';
import {
    getAllMenuItems,
    getMenuItemByID,
    postOneMenuItem,
    updateMenuItem,
    deleteMenuItemByID
} from '../controllers/menu';
import { authMenuMiddleware } from '../middlewares/menu-auth-middlewares';

const menu = Router();

menu.get('/all-items', authMenuMiddleware, getAllMenuItems);
menu.post('/all-items/:eateryId', authMenuMiddleware, postOneMenuItem);
menu.get('/all-items/:menuItemId', authMenuMiddleware, getMenuItemByID)
menu.put('/all-items/:menuItemId', authMenuMiddleware, updateMenuItem);
menu.delete('/all-items/:eateryId/:menuItemId', authMenuMiddleware, deleteMenuItemByID);

export default menu; 
import { Router } from 'express';
import multer from 'multer';
import {
    getAllMenuItems,
    getMenuItemByID,
    postOneMenuItem,
    updateMenuItem,
    deleteMenuItemByID,
    uploadFile,
    saveFileToMenuItem
} from '../controllers/menu';
import { authMenuMiddleware } from '../middlewares/menu-auth-middlewares';

const upload = multer();
const menu = Router();

menu.get('/all-items', authMenuMiddleware, getAllMenuItems);
menu.post('/all-items/:eateryId', authMenuMiddleware, postOneMenuItem);
menu.get('/all-items/:menuItemId', authMenuMiddleware, getMenuItemByID)
menu.put('/all-items/:menuItemId', authMenuMiddleware, updateMenuItem);
menu.delete('/all-items/:eateryId/:menuItemId', authMenuMiddleware, deleteMenuItemByID);
menu.post('/upload-image', upload.single('file'), uploadFile);
menu.post('/save-image', saveFileToMenuItem);

export default menu; 
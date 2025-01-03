import { Router } from 'express';
import {
    getAllOrders,
    getOrderByNumber,
    postOneOrder,
    removeOneOrder,
    getOrdersByUserId,
    getOrdersByBarId,
    updateConfirmationUser,
    updateUserCancelledUser,
    updateConfirmationAdmin,
    updateCancelledAdmin,
    updateTableNumberAdmin,
    updateStartTimeAdmin,
    updateEmdTimeAdmin,
    updateUserCancelledAdmin,
    unActiveOrderAdmin
} from '../controllers/orders-controller';
import { ordersAuthMiddleware } from '../middlewares/orders-auth-middlewares';

const orders = Router();

orders.get('/', ordersAuthMiddleware, getAllOrders);
orders.post('/', ordersAuthMiddleware, postOneOrder);
orders.get('/:userID', ordersAuthMiddleware, getOrdersByUserId);
orders.get('/orders-bar-id/:barId', ordersAuthMiddleware, getOrdersByBarId);
orders.delete('/:orderNumber', ordersAuthMiddleware, removeOneOrder)
orders.get('/:orderNumber', ordersAuthMiddleware, getOrderByNumber);

orders.patch('/:orderNumber/user/confirmation', ordersAuthMiddleware, updateConfirmationUser);
orders.patch('/:orderNumber/user/user-cancelled', ordersAuthMiddleware, updateUserCancelledUser);

orders.patch('/:orderNumber/admin/confirmation', ordersAuthMiddleware, updateConfirmationAdmin);
orders.patch('/:orderNumber/admin/cancelled', ordersAuthMiddleware, updateCancelledAdmin);
orders.patch('/:orderNumber/admin/tableNumber', ordersAuthMiddleware, updateTableNumberAdmin);
orders.patch('/:orderNumber/admin/startTime', ordersAuthMiddleware, updateStartTimeAdmin);
orders.patch('/:orderNumber/admin/endTime', ordersAuthMiddleware, updateEmdTimeAdmin);
orders.patch('/:orderNumber/admin/user-cancelled', ordersAuthMiddleware, updateUserCancelledAdmin);
orders.patch('/:orderNumber/admin/unactive-order', ordersAuthMiddleware, unActiveOrderAdmin);

export default orders; 
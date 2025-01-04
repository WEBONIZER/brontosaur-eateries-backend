import { Router } from 'express';
import {
    getAllOrders,
    getOrderByNumber,
    postOneOrder,
    removeOneOrder,
    getOrdersByUserId,
    getOrdersByBarId,
} from '../controllers/orders-controller';
import {
    userCancelledOrder,
    adminCancelledOrder,
    confirmationOrderFromAdmin,
    adminChangeOrder,
    adminCompletedOrder
} from '../controllers/modification-orders-controller'
import { ordersAuthMiddleware } from '../middlewares/orders-auth-middlewares';

const orders = Router();

orders.get('/', ordersAuthMiddleware, getAllOrders);
orders.post('/', ordersAuthMiddleware, postOneOrder);
orders.get('/:userID', ordersAuthMiddleware, getOrdersByUserId);
orders.get('/orders-bar-id/:barId', ordersAuthMiddleware, getOrdersByBarId);
orders.delete('/:orderNumber', ordersAuthMiddleware, removeOneOrder)
orders.get('/:orderNumber', ordersAuthMiddleware, getOrderByNumber);

orders.patch('/:id/user-cancelled', ordersAuthMiddleware, userCancelledOrder);

orders.patch('/:id/admin-cancelled', ordersAuthMiddleware, adminCancelledOrder);
orders.patch('/:id/admin-confirmation', ordersAuthMiddleware, confirmationOrderFromAdmin);
orders.patch('/:id/admin-completed-order', ordersAuthMiddleware, adminCompletedOrder);
orders.patch('/:id/admin-modification-order', ordersAuthMiddleware, adminChangeOrder);

export default orders; 
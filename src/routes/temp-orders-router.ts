import { Router } from 'express';
import {
  postTempOrder,
  getAllOrders,
  updateComment,
  updateActive,
  updateGuests,
  updateDate,
  updateStartTime,
  updateEndTime,
  updateMenuItemsBox,
  updateOrderSum,
  getOrderById,
  addItemToMenuItemsBox,
  updatetableNumber,
  deleteOrderById,
  updateConfirmation,
  updatePayment,
  updateConsentToDataProcessing
} from '../controllers/temp-orders-controller';

const tempOrders = Router();

tempOrders.patch('/:orderId/addToMenuItemsBox', addItemToMenuItemsBox);
tempOrders.post('/', postTempOrder);
tempOrders.get('/', getAllOrders);
tempOrders.patch('/:orderId/comment', updateComment);
tempOrders.patch('/:orderId/active', updateActive);
tempOrders.patch('/:orderId/confirmation', updateConfirmation);
tempOrders.patch('/:orderId/payment', updatePayment);
tempOrders.patch('/:orderId/consentToDataProcessing', updateConsentToDataProcessing);
tempOrders.patch('/:orderId/guests', updateGuests);
tempOrders.patch('/:orderId/date', updateDate);
tempOrders.patch('/:orderId/startTime', updateStartTime);
tempOrders.patch('/:orderId/endTime', updateEndTime);
tempOrders.patch('/:orderId/menuItemsBox', updateMenuItemsBox);
tempOrders.patch('/:orderId/orderSum', updateOrderSum);
tempOrders.patch('/:orderId/tableNumber', updatetableNumber);

tempOrders.get('/:orderId', getOrderById);
tempOrders.delete('/:orderId', deleteOrderById);

export default tempOrders;
import { Schema, model } from 'mongoose';
import { IOrder } from '../utils/orders-types';
import { menuSchema } from './menu-model'

const menuItemsSchema = new Schema({
  item: {
    type: menuSchema,
    required: false
  },
  quantiy: {
    type: Number,
    required: false
  },
});

const orderSchema = new Schema<IOrder>({
  comment: {
    type: String,
    required: false,
  },
  userID: {
    type: String,
    required: false,
  },
  userName: {
    type: String,
    required: true,
  },
  userPhone: {
    type: String,
    required: true,
  },
  tableId: {
    type: String,
    required: true,
  },
  orderNumber: {
    type: Number,
    required: false,
    unique: true,
  },
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
  confirmation: {
    type: Boolean,
    required: true,
    default: false,
  },
  cancelled: {
    type: Boolean,
    required: true,
    default: false,
  },
  userCancelled: {
    type: Boolean,
    required: true,
    default: false,
  },
  payment: {
    type: Boolean,
    required: true,
    default: false,
  },
  prepareFoodInAdvance: {
    type: Boolean,
    required: true,
    default: false,
  },
  guests: {
    type: Number,
    required: true,
  },
  tableNumber: {
    type: Number,
    required: true,
  },
  barId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  orderCloseDate: {
    type: Date,
    required: true,
    set: (value: any) => new Date(value),
  },
  startTime: {
    type: Number,
    required: true,
  },
  endTime: {
    type: Number,
    required: true,
  },
  menuItemsBox: {
    type: [menuItemsSchema],
    required: false, // Меняем на false, чтобы сделать необязательным
    default: []
  },
  orderSum: {
    type: Number,
    required: true,
  },
  orderSumWithServiceCharge: {
    type: Number,
    required: false,
    unique: false,
    default: 0 // Значение по умолчанию
  },
  userEmail: {
    type: String,
    required: false,
  },
  eaterieEmail: {
    type: String,
    required: false,
  },
  barName: {
    type: String,
    required: false,
  },
},
  {
    timestamps: true,
  });

const OrderModel = model<IOrder>('order', orderSchema);

export default OrderModel;
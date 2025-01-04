import { Schema, model } from 'mongoose';
import { IOrder } from '../utils/orders-types';

const orderSchema = new Schema<IOrder>({
  comment: {
    type: String,
    required: false,
  },
  userID: {
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
    type: [String],
    required: true,
  },
  orderSum: {
    type: Number,
    required: true,
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
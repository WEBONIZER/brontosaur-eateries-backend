import {
  Schema,
  model,
} from 'mongoose';
import { IOrder } from '../utils/orders-types';

const tempOrderSchema = new Schema<IOrder>({
  comment: {
    type: String,
    required: false,
  },
  userID: {
    type: String,
    required: false,
  },
  orderNumber: {
    type: Number,
    required: false,
  },
  active: {
    type: Boolean,
    required: true,
    default: false,
  },
  confirmation: {
    type: Boolean,
    required: true,
    default: false,
  },
  payment: {
    type: Boolean,
    required: true,
    default: false,
  },
  guests: {
    type: Number,
    required: false,
  },
  tableNumber: {
    type: Number,
    required: false,
  },
  barId: {
    type: String,
    required: false,
  },
  date: {
    type: String,
    required: false,
  },
  startTime: {
    type: Number,
    required: true,
  },
  endTime: {
    type: Number,
    required: false,
  },
  menuItemsBox: {
    type: [String],
    required: true,
  },
  orderSum: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: '40m' }
  }, // TTL индекс на 2 минуты
}, {
  timestamps: true,
});

tempOrderSchema.index({ userID: 1, barId: 1 }, { unique: true });

const TempOrderModel = model<IOrder>('temp-order', tempOrderSchema);

export default TempOrderModel;
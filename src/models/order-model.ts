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

const markExpiredOrdersAsInactive = async () => {
  try {
    // Получаем текущую дату в UTC
    const now = new Date();
    const nowUTC = new Date(now.toISOString());

    // Формируем строку с текущей датой без времени
    const todayUTCDateString = nowUTC.toISOString().split('T')[0];

    console.log(`Today UTC Date: ${todayUTCDateString}`);

    // Ищем заказы, у которых orderCloseDate совпадает с текущей датой (без времени)
    const matchedOrders = await OrderModel.find({
      active: true,
      $expr: {
        $eq: [
          { $dateToString: { format: '%Y-%m-%d', date: '$orderCloseDate' } },
          todayUTCDateString
        ]
      }
    });

    console.log(`Matched Orders to Update: ${matchedOrders.length}`);
    console.log('Matched Orders Details:', matchedOrders);

    // Если заказы найдены, обновляем их статус
    if (matchedOrders.length > 0) {
      const result = await OrderModel.updateMany(
        {
          active: true,
          $expr: {
            $eq: [
              { $dateToString: { format: '%Y-%m-%d', date: '$orderCloseDate' } },
              todayUTCDateString
            ]
          }
        },
        {
          $set: {
            active: false,
            cancelled: true,
            confirmation: true
          }
        }
      );

      console.log(`Orders updated: ${result.modifiedCount} orders marked as inactive.`);
    } else {
      console.log('No orders matched the conditions for update.');
    }
  } catch (error) {
    console.error('Error marking orders as inactive:', error);
  }
};

// Функция для вычисления времени до следующего запуска в 00:00 UTC
const scheduleFirstRunAtMidnightUTC = () => {
  const now = new Date();
  const midnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));

  // Время до следующего 00:00 UTC
  const timeToMidnight = midnightUTC.getTime() - now.getTime();

  console.log(`Next execution at midnight UTC in ${timeToMidnight / 1000 / 60 / 60} hours.`);

  // Запуск через timeToMidnight
  setTimeout(() => {
    markExpiredOrdersAsInactive();  // Выполняем первый запуск в 00:00 UTC
    setInterval(markExpiredOrdersAsInactive, 6 * 60 * 60 * 1000);  // Затем каждые 6 часов
  }, timeToMidnight);
};

// Запуск первой настройки
scheduleFirstRunAtMidnightUTC();

// Экспорт модели
export default OrderModel;
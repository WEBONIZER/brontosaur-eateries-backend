import {
    Schema,
    model
} from 'mongoose';
import OrderModel from './order-model'
import { ITable } from '../utils/types'

const tableSchema = new Schema<ITable>({
    number: {
        type: Number,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    hallId: {
        type: String,
        required: true
    },
    places: {
        type: Number,
        required: true
    },
    chairs: {
        type: String,
        required: true
    },
    orders: {
        type: [Schema.Types.ObjectId],
        ref: 'order',
        default: []
    },
    blocked: {
        type: Boolean,
        required: true,
        default: false
    },
    guests: {
        min: {
            type: Number,
            required: true
        },
        max: {
            type: Number,
            required: true
        },
    }
});

tableSchema.index({ hallId: 1, number: 1 }, { unique: true });

const TableModel = model<ITable>("table", tableSchema);

const markAndRemoveExpiredOrders = async () => {
    try {
        const now = new Date();
        const todayUTCDateString = now.toISOString().split('T')[0]; // Текущая дата в формате 'YYYY-MM-DD'

        // Находим все столы
        const tables = await TableModel.find().populate('orders'); // Заполняем заказы для каждого стола

        for (const table of tables) {
            // Проверка наличия заказов в столе
            if (!table.orders || table.orders.length === 0) {
                console.log(`No orders found for table ${table.number}.`);
                continue; // Переходим к следующему столу
            }

            // Фильтруем заказы, которые совпадают с текущей датой
            const expiredOrders = table.orders.filter((order: any) => {
                return order.active &&
                    new Date(order.orderCloseDate).toISOString().split('T')[0] === todayUTCDateString;
            });

            if (expiredOrders.length > 0) {
                // Обновляем неактивные заказы
                await OrderModel.updateMany(
                    { _id: { $in: expiredOrders.map((order: any) => order._id) } },
                    { $set: { active: false, cancelled: true, confirmation: true } }
                );

                // Удаляем заказы из стола
                table.orders = table.orders.filter((order: any) =>
                    !expiredOrders.some((expiredOrder: any) => expiredOrder._id.toString() === order._id.toString())
                );

                await table.save(); // Сохраняем изменения в столе
                console.log(`Updated and removed ${expiredOrders.length} orders from table ${table.number}.`);
            } else {
                console.log(`No expired orders for table ${table.number}.`);
            }
        }
    } catch (error) {
        console.error('Error marking and removing expired orders:', error);
    }
};

// Запуск функции каждые 3 часа
setInterval(markAndRemoveExpiredOrders, 3 * 60 * 60 * 1000);

export default TableModel;
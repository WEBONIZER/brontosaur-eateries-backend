import {
    Schema,
    model,
} from 'mongoose';

// Схема для заказа
interface IOrderToTable {
    guests: number;
    tableNumber: number;
    orderNumber?: number;
    barId: string;
    date: string;
    startTime: number;
    endTime: number;
    deleteAt?: Date;
    active: boolean;
    confirmation: boolean;
    payment: boolean;
}

const orderToTableSchema = new Schema<IOrderToTable>({
    guests: { type: Number, required: true },
    tableNumber: { type: Number, required: true },
    orderNumber: { type: Number },
    barId: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    active: { type: Boolean, required: true, default: false },
    confirmation: { type: Boolean, required: true, default: false },
    payment: { type: Boolean, required: true, default: false },
    deleteAt: { type: Date, required: true, index: { expires: '1d' } }
});

// Прежде чем сохранить документ, добавляем поле deleteAt
orderToTableSchema.pre('save', function (next) {
    const order = this as any;
    const date = new Date(order.date);

    if (isNaN(date.getTime())) {
        next(new Error('Invalid date format'));
    } else {
        order.deleteAt = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        next();
    }
});

// Схема для столика
interface ITable {
    number: number;
    hallId: string;
    photo?: string;
    places: number;
    chairs: string;
    orders?: IOrderToTable[];
    guests: {
        min: number;
        max: number;
    };
}

const tableSchema = new Schema<ITable>({
    number: { type: Number, required: true },
    photo: { type: String, required: true },
    hallId: { type: String, required: true },
    places: { type: Number, required: true },
    chairs: { type: String, required: true },
    orders: { type: [orderToTableSchema], default: [] },
    guests: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
    }
});

tableSchema.index({ hallId: 1, number: 1 }, { unique: true });

const TableModel = model<ITable>("table", tableSchema);

// Фоновая задача для удаления просроченных заказов
const removeExpiredOrders = async () => {
    const tables: any = await TableModel.find({});
    const now = new Date();

    for (const table of tables) {
        table.orders = table.orders.filter((order: any) => order.deleteAt > now);
        await table.save();
    }

    console.log('Expired orders removed at:', new Date());
};

// Запуск фоновой задачи каждые 5 часов
setInterval(removeExpiredOrders, 5 * 60 * 60 * 1000); // 5 минут

export default TableModel;
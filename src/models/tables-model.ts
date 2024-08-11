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
    createdAt?: Date;
}

const orderToTableSchema = new Schema<IOrderToTable>({
    guests: { type: Number, required: true },
    tableNumber: { type: Number, required: true },
    orderNumber: { type: Number, unique: false },
    barId: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: '60' } }
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

export default TableModel;
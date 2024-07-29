import mongoose, { Schema, model, Document } from 'mongoose';

const orderToTableSchema = new Schema({
    guests: { type: Number, required: true },
    tableNumber: { type: Number, required: true },
    orderNumber: { type: Number, unique: true },
    barId: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
});

interface IOrderToTable extends Document {
    guests: number;
    tableNumber: number;
    orderNumber?: number;
    barId: string;
    date: string;
    startTime: number;
    endTime: number;
}

// Типизация для основной модели Table
interface ITable extends Document {
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

// Основная схема для Table
const tableSchema = new Schema({
    number: { type: Number, required: true },
    photo: { type: String, required: true },
    hallId: { type: String, required: true, index: true },
    places: { type: Number, required: true },
    chairs: { type: String, required: true },
    orders: { type: [orderToTableSchema], default: [] },
    guests: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
    }
});

interface ITable extends Document {
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

// Создайте уникальный индекс для комбинации hallId и number
tableSchema.index({ hallId: 1, number: 1 }, { unique: true });

// Если orderNumber всегда уникален, используйте Sparse Index
tableSchema.index({ 'orders.orderNumber': 1 }, { unique: true, sparse: true });

const TableModel = mongoose.model<ITable>("Table", tableSchema);

export default TableModel;
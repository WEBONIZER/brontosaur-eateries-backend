import mongoose, { Schema, model, Document } from 'mongoose';

interface IOrderToTable extends Document {
    guests: number;
    tableNumber: number;
    orderNumber?: number;
    barId: string;
    date: string;
    startTime: number;
    endTime: number;
}

// Вложенная схема для OrderToTable
const orderToTableSchema = new Schema<IOrderToTable>({
    guests: { type: Number, required: true },
    tableNumber: { type: Number, required: true },
    orderNumber: { type: Number, unique: true },
    barId: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
});

// Типизация для основной модели Table
interface ITable extends Document {
    number: number;
    hallId: mongoose.Types.ObjectId;
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
const tableSchema = new Schema<ITable>({
    number: { type: Number, required: true, unique: true },
    hallId: { type: Schema.Types.ObjectId, ref: 'Hall', required: true },
    photo: { type: String },
    places: { type: Number, required: true },
    chairs: { type: String, required: true },
    orders: [orderToTableSchema],
    guests: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
    },
});



// Создание и экспорт модели
const TableModel = model<ITable>('Table', tableSchema);



export default TableModel;
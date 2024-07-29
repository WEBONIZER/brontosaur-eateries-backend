import {
    Schema,
    model,
  } from 'mongoose';
  
interface IOrderToTable {
    guests: number;
    tableNumber: number;
    orderNumber?: number;
    barId: string;
    date: string;
    startTime: number;
    endTime: number;
}

const orderToTableSchema = new Schema<IOrderToTable>({
    guests: { type: Number, required: true },
    tableNumber: { type: Number, required: true },
    orderNumber: { type: Number, unique: false },
    barId: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
});


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

// Основная схема для Table
const tableSchema = new Schema<ITable>({
    number: { type: Number, required: true },
    photo: { type: String, required: true },
    hallId: {
        type: String, required: true,
        //index: true 
    },
    places: { type: Number, required: true },
    chairs: { type: String, required: true },
    orders: { type: [orderToTableSchema], default: [] },
    guests: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
    }
});



// Создайте уникальный индекс для комбинации hallId и number
tableSchema.index({ hallId: 1, number: 1 }, { unique: true });

// Если orderNumber всегда уникален, используйте Sparse Index
//tableSchema.index({ 'orders.orderNumber': 1 }, { unique: true, sparse: true });

const TableModel = model<ITable>("table", tableSchema);

export default TableModel;
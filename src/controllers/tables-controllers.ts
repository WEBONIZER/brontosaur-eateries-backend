import {
    Response,
    NextFunction,
} from 'express';
import TableModel from '../models/tables-model'
import { RequestCustom } from '../utils/types';
import { NotFoundError } from '../utils/not-found-error-class'
import { BadRequestError } from '../utils/bad-request-error-class'

export const getAllTables = async (req: RequestCustom, res: Response, next: NextFunction) => {
    try {
        const tables = await TableModel.find({});

        if (!tables.length) {
            throw new NotFoundError('Не найдено ни одного стола');
        }

        res.status(200).send({
            status: 'success',
            data: tables,
        });
    } catch (error) {
        console.error('Ошибка при получении столов:', error); // Логирование ошибки
        next(error); // Передача оригинальной ошибки
    }
};

export const getTableById = (req: RequestCustom, res: Response, next: NextFunction) => {

    const { tableId } = req.params;

    TableModel.findOne({ _id: tableId })
        .then((foundBlog) => {
            if (!foundBlog) {
                throw new NotFoundError('Заведение не найдено');
            }

            res.status(200).send({
                status: 'success',
                data: foundBlog,
            });
        })
        .catch((error) => {
            if (error.name === 'CastError') {
                next(new BadRequestError('Некорректное название заведения'));
            } else {
                next(new Error('Произошла ошибка при получении данных заведения'));
            }
        });
};

interface RequestOrderCustom extends Request {
        guests: number;
        tableNumber: number;
        orderNumber?: number;
        barId: string;
        date: string; // Дата в формате строки
        startTime: number;
        endTime: number;
}

export const addOrderToTable = async (req: any, res: Response, next: NextFunction) => {
    const { tableId } = req.params;
    const order = req.body;

    console.log('Received order:', order);

    try {
        const table: any = await TableModel.findById(tableId);

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        // Проверка формата входной даты и преобразование её
        const orderDate = new Date(order.date);
        if (isNaN(orderDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        // Устанавливаем поле deleteAt для нового заказа
        order.deleteAt = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000); // Добавляем 24 часа (1 день)

        // Добавляем проверку на корректность установленного времени
        if (isNaN(order.deleteAt.getTime())) {
            return res.status(400).json({ message: 'Invalid deleteAt date' });
        }

        table.orders.push(order);
        await table.save();
        return res.status(201).json({ message: 'Order added successfully', table });
    } catch (error: any) {
        console.error('Error occurred:', error.message);
        next(error);
    }
};
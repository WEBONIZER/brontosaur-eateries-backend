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

export const addOrderToTable = async (req: RequestCustom, res: Response, next: NextFunction) => {
    const { tableId } = req.params;
    const order = req.body;

    try {
        const table: any = await TableModel.findById(tableId);

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }
        
        table.orders.push(order);
        await table.save();
        return res.status(201).json({ message: 'Order added successfully', table });
    } catch (error: any) {
        console.error('Error occurred:', error.message);
        next(error);
    }
};
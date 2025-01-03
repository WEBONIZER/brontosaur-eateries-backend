import {
    Response,
    NextFunction,
} from 'express';
import TableModel from '../models/tables-model'
import { NotFoundError } from '../utils/not-found-error-class'
import { BadRequestError } from '../utils/bad-request-error-class'

export const getAllTables = async (req: any, res: Response, next: NextFunction) => {
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

export const getTableById = (req: any, res: Response, next: NextFunction) => {

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

export const deleteTableById = (req: any, res: Response, next: NextFunction) => {
    const { tableId } = req.params;

    TableModel.findByIdAndDelete(tableId)
        .then((deletedTable) => {
            if (!deletedTable) {
                throw new NotFoundError('Стол не найден');
            }

            res.status(200).send({
                status: 'success',
                message: 'Стол успешно удалён',
                data: deletedTable, // Возвращаем данные удалённого стола (если нужно)
            });
        })
        .catch((error) => {
            if (error.name === 'CastError') {
                next(new BadRequestError('Некорректный идентификатор стола'));
            } else {
                next(new Error('Произошла ошибка при удалении стола'));
            }
        });
};

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

export const removeOrderFromTable = async (req: any, res: Response, next: NextFunction) => {
    const { tableId, orderId } = req.params;

    try {
        const table: any = await TableModel.findById(tableId);

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        // Ищем заказ по orderId и удаляем его
        const orderIndex = table.orders.findIndex((order: any) => order._id.toString() === orderId);

        if (orderIndex === -1) {
            return res.status(404).json({ message: 'Order not found' });
        }

        table.orders.splice(orderIndex, 1);
        await table.save();

        return res.status(200).json({ message: 'Order removed successfully', table });
    } catch (error: any) {
        console.error('Error occurred:', error.message);
        next(error);
    }
};

export const updateTableBlocked = async (req: any, res: Response) => {
    const { tableId } = req.params;
    const { blocked } = req.body;

    try {
        const table = await TableModel.findById(tableId);

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        table.blocked = blocked;
        await table.save();

        res.status(200).json({ message: 'Table status updated', table });
    } catch (error) {
        res.status(500).json({ message: 'Error updating table status', error });
    }
};

export const updateUserCancelled = async (req: any, res: Response, next: NextFunction) => {
    const { tableId, orderId } = req.params;
    const { userCancelled } = req.body;

    try {
        const table: any = await TableModel.findById(tableId);

        if (!table) {
            return res.status(404).json({ message: 'Table not found' });
        }

        // Ищем заказ по orderId
        const order = table.orders.find((order: any) => order._id.toString() === orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Изменяем поле userCancelled
        order.userCancelled = userCancelled !== undefined ? userCancelled : order.userCancelled;
        await table.save();

        return res.status(200).json({ message: 'Order updated successfully', table });
    } catch (error: any) {
        console.error('Error occurred:', error.message);
        next(error);
    }
};
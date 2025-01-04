import {
    Response,
    NextFunction,
} from 'express';
import OrderModel from '../models/order-model';
import { RequestCustom } from '../utils/types';
import { NotFoundError } from '../utils/not-found-error-class'
import { BadRequestError } from '../utils/bad-request-error-class'
import { sendMailToUser, sendMailToAdmin } from '../utils/functions'
import TableModel from '../models/tables-model'

export const userCancelledOrder = async (req: RequestCustom, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { confirmation, userCancelled } = req.body;

    try {
        // Обновляем запись в базе данных
        const data: any = await OrderModel.findOneAndUpdate(
            { _id: id },
            { confirmation, userCancelled },
            { new: true }
        );

        if (!data) {
            throw new NotFoundError('Заказ не найден');
        }

        sendMailToUser(data, 'order-user-cancel-template.html', 'Отмена резерва в Brontosaur')

        sendMailToAdmin(data, 'order-user-cancel-to-admin-template.html', 'Отмена резерва в Brontosaur')

        // Отправка успешного ответа
        res.status(200).send({ status: 'success', data });
    } catch (err) {
        if (err) {
            next(new BadRequestError('Некорректные данные'));
        } else {
            next(err);
        }
    }
};

export const adminCancelledOrder = async (req: RequestCustom, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { confirmation, userCancelled, active, cancelled } = req.body;

    try {
        // Обновляем запись в базе данных
        const data: any = await OrderModel.findOneAndUpdate(
            { _id: id },
            { confirmation, userCancelled, active, cancelled },
            { new: true }
        );

        if (!data) {
            throw new NotFoundError('Заказ не найден');
        }

        // Удаляем заказ из стола
        await TableModel.updateOne(
            { orders: id },
            { $pull: { orders: id } }
        );

        sendMailToUser(data, 'confirmation-order-cancel-template.html', 'Подтверждение отмены резерва в Brontosaur')

        sendMailToAdmin(data, 'confirmation-order-cancel-to-admin-template.html', 'Подтверждение отмены резерва в Brontosaur')

        // Отправка успешного ответа
        res.status(200).send({ status: 'success', data });
    } catch (err) {
        if (err) {
            next(new BadRequestError('Некорректные данные'));
        } else {
            next(err);
        }
    }
};

export const confirmationOrderFromAdmin = async (req: RequestCustom, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { confirmation, userCancelled, active, cancelled } = req.body;

    try {
        // Обновляем запись в базе данных
        const data: any = await OrderModel.findOneAndUpdate(
            { _id: id },
            { confirmation, userCancelled, active, cancelled },
            { new: true }
        );

        if (!data) {
            throw new NotFoundError('Заказ не найден');
        }

        sendMailToUser(data, 'confirmation-order-to-user-template.html', 'Подтверждение резерва в Brontosaur')

        sendMailToAdmin(data, 'confirmation-order-to-admin-template.html', 'Подтверждение резерва в Brontosaur')

        // Отправка успешного ответа
        res.status(200).send({ status: 'success', data });
    } catch (err) {
        if (err) {
            next(new BadRequestError('Некорректные данные'));
        } else {
            next(err);
        }
    }
};

export const adminChangeOrder = async (req: RequestCustom, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { confirmation, userCancelled, active, cancelled, tableNumber, startTime, endTime, date, guests } = req.body;
    
    try {
        // Получаем текущую запись из базы данных
        const currentOrder: any = await OrderModel.findById(id);
        
        if (!currentOrder) {
            throw new NotFoundError('Заказ не найден');
        }

        // Обновляем запись в базе данных с входящими данными
        const updatedFields: any = { 
            confirmation, 
            userCancelled, 
            active, 
            cancelled, 
            tableNumber, 
            startTime, 
            endTime, 
            date, 
            guests 
        };

        const data: any = await OrderModel.findOneAndUpdate(
            { _id: id },
            updatedFields,
            { new: true }
        );

        // Отправка уведомлений
        sendMailToUser(data, 'change-order-to-user-template.html', 'Заказ в Brontosaur изменён');
        sendMailToAdmin(data, 'change-order-to-admin-template.html', 'Заказ в Brontosaur изменён');

        // Отправка успешного ответа
        res.status(200).send({ status: 'success', data });
    } catch (err) {
        next(new BadRequestError('Некорректные данные'));
    }
};

export const adminCompletedOrder = async (req: RequestCustom, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { confirmation, userCancelled, active, cancelled } = req.body;
    
    try {
        // Получаем текущую запись из базы данных
        const currentOrder: any = await OrderModel.findById(id);
        
        if (!currentOrder) {
            throw new NotFoundError('Заказ не найден');
        }

        // Обновляем запись в базе данных с входящими данными
        const updatedFields: any = { 
            confirmation, 
            userCancelled, 
            active, 
            cancelled
        };

        const data: any = await OrderModel.findOneAndUpdate(
            { _id: id },
            updatedFields,
            { new: true }
        );

        // Отправка уведомлений
        sendMailToUser(data, 'completed-order-to-user-template.html', 'Заказ в Brontosaur завершён');
        sendMailToAdmin(data, 'completed-order-to-admin-template.html', 'Заказ в Brontosaur завершён');

        // Отправка успешного ответа
        res.status(200).send({ status: 'success', data });
    } catch (err) {
        next(new BadRequestError('Некорректные данные'));
    }
};


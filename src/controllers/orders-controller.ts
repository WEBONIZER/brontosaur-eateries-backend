import {
    Response,
    NextFunction,
} from 'express';
import OrderModel from '../models/order-model';
import TableModel from '../models/tables-model'
import { RequestCustom } from '../utils/types';
import { NotFoundError } from '../utils/not-found-error-class'
import { BadRequestError } from '../utils/bad-request-error-class'
import fs from 'fs';
import path from 'path';
import { transporter } from '../utils/functions'

export const getAllOrders = (req: RequestCustom, res: Response, next: NextFunction) => {
    OrderModel.find({})
        .then((data) => {
            if (!data.length) {
                throw new NotFoundError('Не найдено ни одного заведения');
            }
            res.status(200).send({
                status: 'success',
                data,
            });
        })
        .catch((error) => {
            next(new Error('Произошла ошибка при получении заведений'));
        });
};

export const getOrdersByUserId = (req: RequestCustom, res: Response, next: NextFunction) => {
    const userID = req.params.userID;

    OrderModel.find({ userID })
        .then((data) => {
            if (!data.length) {
                throw new NotFoundError(`Не найдено ни одного заказа для пользователя с ID: ${userID}`);
            }
            res.status(200).send({
                status: 'success',
                data,
            });
        })
        .catch((error) => {
            next(new Error('Произошла ошибка при получении заказов'));
        });
};

export const getOrdersByBarId = (req: RequestCustom, res: Response, next: NextFunction) => {
    const barId = req.params.barId;

    OrderModel.find({ barId })
        .then((data) => {
            if (!data.length) {
                throw new NotFoundError(`Не найдено ни одного заказа для пользователя с ID: ${barId}`);
            }
            res.status(200).send({
                status: 'success',
                data,
            });
        })
        .catch((error) => {
            next(new Error('Произошла ошибка при получении заказов'));
        });
};

export const getOrderByNumber = (req: RequestCustom, res: Response, next: NextFunction) => {

    const orderNumber = req.params.orderNumber;

    OrderModel.findOne({ orderNumber: orderNumber })
        .then((foundOrder) => {
            if (!foundOrder) {
                throw new NotFoundError('Заказ не найден');
            }

            res.status(200).send({
                status: 'success',
                data: foundOrder,
            });
        })
        .catch((error) => {
            if (error.name === 'CastError') {
                next(new BadRequestError('Некорректный номер заказа'));
            } else {
                next(new Error('Произошла ошибка при получении данных заказа'));
            }
        });
};

export const postOneOrder = async (req: RequestCustom, res: Response) => {
    try {
        const {
            tableId,
            comment,
            userID,
            userName,
            userPhone,
            active,
            tableNumber,
            confirmation,
            cancelled,
            userCancelled,
            payment,
            prepareFoodInAdvance,
            guests,
            barId,
            date,
            orderCloseDate,
            startTime,
            endTime,
            menuItemsBox,
            orderSum,
            orderSumWithServiceCharge,
            userEmail,
            eaterieEmail,
            barName,
        } = req.body;

        // Проверяем наличие tableId
        if (!tableId) {
            return res.status(400).json({ error: 'tableId is required' });
        }

        // Проверяем, существует ли стол с данным ID
        const table = await TableModel.findById(tableId);
        if (!table) {
            return res.status(404).json({ error: 'Table not found' });
        }

        // Получаем максимальный orderNumber из существующих заказов
        const maxOrderNumber = await OrderModel.findOne().sort({ orderNumber: -1 }).limit(1);

        let newOrderNumber: number = 1; // Начальное значение для первого заказа

        if (maxOrderNumber) {
            newOrderNumber = maxOrderNumber.orderNumber + 1;
        }

        // Создаем новый заказ
        const newOrder = new OrderModel({
            comment,
            userID,
            userName,
            userPhone,
            tableId,
            orderNumber: newOrderNumber,
            active,
            confirmation,
            cancelled,
            userCancelled,
            payment,
            prepareFoodInAdvance,
            guests,
            tableNumber,
            barId,
            date,
            orderCloseDate,
            startTime,
            endTime,
            menuItemsBox,
            orderSum,
            orderSumWithServiceCharge,
            userEmail,
            eaterieEmail,
            barName,
        });

        // Опционально: отправляем подтверждающее письмо пользователю
        const templatePath = path.join(__dirname, 'html-templates', 'order-to-user-template.html');
        let confirmationHtml = fs.readFileSync(templatePath, 'utf8')

        const customizedConfirmationHtml = confirmationHtml
            .replace('{{barName}}', barName)
            .replace('{{orderNumber}}', newOrderNumber.toString())
            .replace('{{guests}}', guests)
            .replace('{{tableNumber}}', tableNumber)
            .replace('{{date}}', date)
            .replace('{{startTime}}', startTime)

        const mailOptions = {
            from: `"Brontosaur" <${process.env.EMAIL_USER}>`,
            to: `${userEmail}`,
            subject: 'Заказ в BRONTOSAUR создан',
            html: customizedConfirmationHtml,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(`Error sending confirmation email to ${userEmail}:`, error);
            } else {
                console.log(`Confirmation email sent to ${userEmail}: ${info.response}`);
            }
        });

        // Опционально: отправляем подтверждающее письмо администратору
        const templateAdminPath = path.join(__dirname, 'html-templates', 'order-to-admin-template.html');
        let confirmationAdminHtml = fs.readFileSync(templateAdminPath, 'utf8')

        const customizedConfirmationAdminHtml = confirmationAdminHtml
            .replace('{{barName}}', barName)
            .replace('{{orderNumber}}', newOrderNumber.toString())
            .replace('{{guests}}', guests)
            .replace('{{tableNumber}}', tableNumber)
            .replace('{{date}}', date)
            .replace('{{startTime}}', startTime)

        const mailAdminOptions = {
            from: `"Brontosaur" <${process.env.EMAIL_USER}>`,
            to: `${eaterieEmail}`,
            subject: 'Заказ из BRONTOSAUR',
            html: customizedConfirmationAdminHtml,
        };

        transporter.sendMail(mailAdminOptions, (error, info) => {
            if (error) {
                console.error(`Error sending confirmation email to ${eaterieEmail}:`, error);
            } else {
                console.log(`Confirmation email sent to ${eaterieEmail}: ${info.response}`);
            }
        });

        const savedOrder = await newOrder.save();

        await TableModel.findByIdAndUpdate(
            tableId,
            { $push: { orders: savedOrder._id } },  // Добавляем ID нового заказа в массив orders
            { new: true }  // Возвращаем обновленный документ
        );

        // Возвращаем успешный ответ
        res.status(201).json({
            status: 'success',
            data: savedOrder,
        });

    } catch (error) {
        console.error('Error while creating order:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const removeOneOrder = (req: RequestCustom, res: Response, next: NextFunction) => {
    OrderModel.deleteOne({ orderNumber: req.params.orderNumber })
        .then((data) => {
            if (data.deletedCount === 0) {
                throw new NotFoundError('Заказ не найден');
            }
            res.status(200).send({
                status: 'success',
                message: 'Заказ удалён',
            });
        })
        .catch((err) => {
            if (err.name === 'CastError') {
                next(new BadRequestError('Некорректный номер заказа'));
            } else {
                next(err);
            }
        });
};

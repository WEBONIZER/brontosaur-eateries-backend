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
import nodemailer, { TransportOptions } from "nodemailer";
import dotenv from 'dotenv'
import path from 'path';

dotenv.config()

const transporter: nodemailer.Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true для порта 465, false для других портов
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    logger: true, // включение логирования в консоль
    debug: true   // включение расширенного отладочного режима
} as TransportOptions);

transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP configuration error:', error);
    } else {
        console.log('SMTP server is ready to take our messages');
    }
});

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

export const updateUserField = (field: string) => async (req: RequestCustom, res: Response, next: NextFunction) => {
    const { orderNumber } = req.params;
    const update = { [field]: req.body[field] };

    try {
        // Обновляем запись в базе данных
        const data = await OrderModel.findOneAndUpdate({ orderNumber }, update, { new: true });
        if (!data) {
            throw new NotFoundError('Заказ не найден');
        }

        // Получаем email пользователя из данных модели
        const eaterieEmail = data.eaterieEmail;
        if (!eaterieEmail) {
            throw new Error('Email пользователя не найден');
        }

        // Определяем путь к шаблону на основе поля и его значения
        let templateFileName = '';
        switch (field) {
            case 'userCancelled':
                if (req.body[field] === true) { // Проверяем значение
                    templateFileName = 'order-user-cancel-template.html';
                }
                break;
            default:
                // Для других полей письма не отправляются
                res.send({ status: 'success', data });
                return;
        }

        // Читаем HTML-шаблон
        const templatePath = path.join(__dirname, 'html-templates', templateFileName);
        const emailHtml = fs.readFileSync(templatePath, 'utf8');

        // Подставляем данные в шаблон
        const customizedEmailHtml = emailHtml
            .replace('{{barName}}', data.barName.toString())
            .replace('{{orderNumber}}', data.orderNumber.toString())
            .replace('{{guests}}', data.guests.toString())
            .replace('{{tableNumber}}', data.tableNumber.toString())
            .replace('{{date}}', data.date.toString())
            .replace('{{startTime}}', data.startTime.toString())
            .replace('{{endTime}}', data.endTime.toString());

        // Настраиваем параметры письма
        const mailOptions = {
            from: `"Brontosaur" <${process.env.EMAIL_USER}>`,
            to: eaterieEmail,
            subject: 'Пользователь отменил заказ',
            html: customizedEmailHtml,
        };

        // Отправляем email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(`Ошибка отправки email на ${eaterieEmail}:`, error);
            } else {
                console.log(`Письмо отправлено на ${eaterieEmail}: ${info.response}`);
            }
        });

        // Отправка успешного ответа
        res.send({ status: 'success', data });
    } catch (err) {
        if (err) {
            next(new BadRequestError('Некорректные данные'));
        } else {
            next(err);
        }
    }
};

export const updateAdminField = (field: string) => async (req: RequestCustom, res: Response, next: NextFunction) => {
    const { orderNumber } = req.params;
    const update = { [field]: req.body[field] };

    try {
        // Обновляем запись в базе данных
        const data = await OrderModel.findOneAndUpdate({ orderNumber }, update, { new: true });
        if (!data) {
            throw new NotFoundError('Заказ не найден');
        }

        // Получаем email пользователя из данных модели
        const userEmail = data.userEmail;
        if (!userEmail) {
            throw new Error('Email пользователя не найден');
        }

        // Определяем путь к шаблону на основе поля и его значения
        let templateFileName = '';
        switch (field) {
            case 'tableNumber':
                if (req.body[field]) { // Проверяем, что номер стола указан
                    templateFileName = 'order-table-update-template.html';
                }
                break;
            case 'startTime':
                if (req.body[field]) { // Проверяем, что время начала указано
                    templateFileName = 'order-start-time-update-template.html';
                }
                break;
            case 'endTime':
                if (req.body[field]) { // Проверяем, что время окончания указано
                    templateFileName = 'order-end-time-update-template.html';
                }
                break;
            case 'userCancelled':
                if (req.body[field] === true) { // Проверяем значение
                    templateFileName = 'order-user-cancel-template.html';
                }
                break;
            case 'active':
                if (req.body[field] === false) { // Если активность выключена
                    templateFileName = 'order-admin-cancel-template.html';
                } else if (req.body[field] === true) { // Если активность включена
                    templateFileName = 'order-admin-confirmed-template.html';
                } else {
                    // Если значение некорректное или не указано, не отправлять письмо
                    res.send({ status: 'success', data });
                    return;
                }
                break;
            default:
                // Для других полей письма не отправляются
                res.send({ status: 'success', data });
                return;
        }

        // Читаем HTML-шаблон
        const templatePath = path.join(__dirname, 'html-templates', templateFileName);
        const emailHtml = fs.readFileSync(templatePath, 'utf8');

        // Подставляем данные в шаблон
        const customizedEmailHtml = emailHtml
            .replace('{{barName}}', data.barName.toString())
            .replace('{{orderNumber}}', data.orderNumber.toString())
            .replace('{{guests}}', data.guests.toString())
            .replace('{{tableNumber}}', data.tableNumber.toString())
            .replace('{{date}}', data.date.toString())
            .replace('{{startTime}}', data.startTime.toString())
            .replace('{{endTime}}', data.endTime.toString());

        // Настраиваем параметры письма
        const mailOptions = {
            from: `"Brontosaur" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Обновление заказа в Brontosaur',
            html: customizedEmailHtml,
        };

        // Отправляем email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(`Ошибка отправки email на ${userEmail}:`, error);
            } else {
                console.log(`Письмо отправлено на ${userEmail}: ${info.response}`);
            }
        });

        // Отправка успешного ответа
        res.send({ status: 'success', data });
    } catch (err) {
        if (err) {
            next(new BadRequestError('Некорректные данные'));
        } else {
            next(err);
        }
    }
};

export const updateConfirmationUser = updateUserField('confirmation');
export const updateUserCancelledUser = updateUserField('userCancelled');

export const updateConfirmationAdmin = updateAdminField('confirmation');
export const updateCancelledAdmin = updateAdminField('cancelled');
export const updateTableNumberAdmin = updateAdminField('tableNumber');
export const updateStartTimeAdmin = updateAdminField('startTime');
export const updateEmdTimeAdmin = updateAdminField('endTime');
export const updateUserCancelledAdmin = updateAdminField('userCancelled');
export const unActiveOrderAdmin = updateAdminField('active');

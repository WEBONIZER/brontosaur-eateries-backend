import {
    Response,
    NextFunction,
} from 'express';
import TempOrderModel from '../models/temp-order-model';
import { RequestCustom } from '../utils/types';
import { NotFoundError } from '../utils/not-found-error-class'
import { BadRequestError } from '../utils/bad-request-error-class'

export const getAllOrders = (req: RequestCustom, res: Response, next: NextFunction) => {
    TempOrderModel.find({})
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

export const postTempOrder = async (req: RequestCustom, res: Response, next: NextFunction) => {
    const {
        comment,
        userID,
        barId,
        active,
        guests,
        tableNumber,
        date,
        startTime,
        endTime,
        menuItemsBox,
        orderSum,
        confirmation,
        payment,
        consentToDataProcessing
    } = req.body;

    try {
        // Поиск существующего заказа по userID и barId
        const existingOrder = await TempOrderModel.findOne({ userID, barId });

        if (existingOrder) {
            // Если заказ уже существует, вернуть этот заказ
            return res.status(200).send({
                status: 'success',
                data: existingOrder
            });
        } else {
            // Создание нового заказа, только если заказ с заданными userID и barId не найден
            const newOrder = new TempOrderModel({
                comment,
                userID,
                barId,
                active,
                guests,
                tableNumber,
                date,
                startTime,
                endTime,
                menuItemsBox,
                orderSum,
                confirmation,
                payment,
                consentToDataProcessing
            });

            await newOrder.save();

            res.status(201).send({
                status: 'success',
                data: newOrder
            });
        }
    } catch (err: any) {
        if (err.name === 'ValidationError') {
            return next(new BadRequestError('Некорректные данные'));
        }
        return next(err);
    }
};

export const getOrderById = (req: RequestCustom, res: Response, next: NextFunction) => {

    const orderId = req.params.orderId;

    TempOrderModel.findOne({ _id: orderId })
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

export const deleteOrderById = (req: RequestCustom, res: Response, next: NextFunction) => {
    const orderId = req.params.orderId;

    TempOrderModel.findOneAndDelete({ _id: orderId })
        .then((deletedOrder) => {
            if (!deletedOrder) {
                throw new NotFoundError('Заказ не найден');
            }

            res.status(200).send({
                status: 'success',
                message: 'Заказ успешно удален',
                data: deletedOrder,
            });
        })
        .catch((error) => {
            if (error.name === 'CastError') {
                next(new BadRequestError('Некорректный номер заказа'));
            } else {
                next(new Error('Произошла ошибка при удалении заказа'));
            }
        });
};

const updateField = (field: string) => (req: RequestCustom, res: Response, next: NextFunction) => {
    const orderId = req.params._id;
    const update = { [field]: req.body[field] };

    TempOrderModel.findOneAndUpdate({ orderId }, update, { new: true })
        .then((data) => {
            if (!data) {
                throw new NotFoundError('Заказ не найден');
            }
            res.send({ status: 'success', data });
        })
        .catch((err) => {
            if (err.name === 'ValidationError') {
                next(new BadRequestError('Некорректные данные'));
            } else {
                next(err);
            }
        });
};

export const addItemToMenuItemsBox = (req: RequestCustom, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const { newItem } = req.body;

    if (!newItem) {
        return next(new BadRequestError('Отсутствует элемент для добавления'));
    }

    TempOrderModel.findOneAndUpdate(
        { _id: orderId },
        { $push: { menuItemsBox: newItem } },
        { new: true, runValidators: true }
    )
        .then((updatedOrder) => {
            if (!updatedOrder) {
                throw new NotFoundError('Заказ не найден');
            }

            res.status(200).send({
                status: 'success',
                data: updatedOrder,
            });
        })
        .catch((error) => {
            console.error('Error occurred while updating order:', error);
            if (error.name === 'CastError') {
                next(new BadRequestError('Некорректный номер заказа'));
            } else {
                next(new Error('Произошла ошибка при обновлении данных заказа'));
            }
        });
};

export const updateComment = updateField('comment');
export const updateActive = updateField('active');
export const updateConfirmation = updateField('confirmation');
export const updatePayment = updateField('payment');
export const updateConsentToDataProcessing = updateField('consentToDataProcessing');
export const updateGuests = updateField('guests');
export const updateDate = updateField('date');
export const updateStartTime = updateField('startTime');
export const updateEndTime = updateField('endTime');
export const updateMenuItemsBox = updateField('menuItemsBox');
export const updateOrderSum = updateField('orderSum');
export const updatetableNumber = updateField('tableNumber');
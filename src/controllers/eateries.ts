import {
    Response,
    NextFunction,
} from 'express';
import EateriesModel from '../models/eateries';
import { RequestCustom } from '../utils/types';
import { NotFoundError } from '../utils/not-found-error-class'
import { BadRequestError } from '../utils/bad-request-error-class'

export const getAllEateries = (req: RequestCustom, res: Response, next: NextFunction) => {
    EateriesModel.find({})
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

export const getEateriesByName = (req: RequestCustom, res: Response, next: NextFunction) => {

    const eateriesRoute = req.params.eateriesRoute;

    EateriesModel.findOne({ route: eateriesRoute })
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

export const postOneEaterie = (req: RequestCustom, res: Response, next: NextFunction) => {
    const { name, title, deposit, description, city, adress, coordinates, averageBill, establishmentType, likes, viewsCount, disabledDates, kitchenType, openingHours, rating, metro, phone, yandexmap, route, menu, catalog, photo, halls } = req.body;
    EateriesModel.create({ name, title, deposit, description, city, adress, coordinates, averageBill, establishmentType, likes, viewsCount, disabledDates, kitchenType, openingHours, rating, metro, phone, yandexmap, route, menu, catalog, photo, halls })
        .then((data) => res.status(201).send({
            status: 'success',
            data,
        }))
        .catch((err) => {
            if (err.name === 'ValidationError') {
                next(new BadRequestError('Некорректные данные'));
            } else {
                next(err);
            }
        });
};

export const removeEaterie = (req: RequestCustom, res: Response, next: NextFunction) => {
    EateriesModel.deleteOne({ route: req.params.eateriesRoute })
        .then((data) => {
            if (data.deletedCount === 0) {
                throw new NotFoundError('Заведение не найдено');
            }
            res.status(200).send({
                status: 'success',
                message: 'Заведение удалено',
            });
        })
        .catch((err) => {
            if (err.name === 'CastError') {
                next(new BadRequestError('Некорректное имя'));
            } else {
                next(err);
            }
        });
};

export const addLikeToEaterie = (req: RequestCustom, res: Response, next: NextFunction) => {
    const eateriesRoute = req.params.eateriesRoute;
    const { like } = req.body;

    if (!like || typeof like !== 'string') {
        return next(new BadRequestError('Некорректные данные для лайка'));
    }

    EateriesModel.findOneAndUpdate(
        { route: eateriesRoute },
        { $addToSet: { likes: like } },
        { new: true }
    )
        .then((updatedEaterie) => {
            if (!updatedEaterie) {
                throw new NotFoundError('Заведение не найдено');
            }

            res.status(200).send({
                status: 'success',
                data: updatedEaterie,
            });
        })
        .catch((error) => {
            if (error.name === 'CastError') {
                next(new BadRequestError('Некорректное имя'));
            } else {
                next(new Error('Произошла ошибка при добавлении лайка'));
            }
        });
};

export const removeLikeFromEaterie = (req: RequestCustom, res: Response, next: NextFunction) => {
    const eateriesRoute = req.params.eateriesRoute;
    const { like } = req.body;

    if (!like || typeof like !== 'string') {
        return next(new BadRequestError('Некорректные данные для удаления лайка'));
    }

    EateriesModel.findOneAndUpdate(
        { route: eateriesRoute },
        { $pull: { likes: like } },
        { new: true }
    )
        .then((updatedEaterie) => {
            if (!updatedEaterie) {
                throw new NotFoundError('Заведение не найдено');
            }

            res.status(200).send({
                status: 'success',
                data: updatedEaterie,
            });
        })
        .catch((error) => {
            if (error.name === 'CastError') {
                next(new BadRequestError('Некорректное имя'));
            } else {
                next(new Error('Произошла ошибка при удалении лайка'));
            }
        });
};

export const addHallToEaterie = async (req: any, res: Response, next: NextFunction) => {
    const eateriesRoute = req.params.eateriesRoute;
    if (!eateriesRoute) {
        return res.status(400).json({ message: 'eateriesRoute param is required' });
    }

    const newHall = req.body.hall;
    if (!newHall) {
        return res.status(400).json({ message: 'No hall data provided' });
    }

    try {
        const eatery = await EateriesModel.findOne({ route: eateriesRoute });
        if (!eatery) {
            return res.status(404).json({ message: `Eatery "${eateriesRoute}" not found` });
        }

        eatery.halls.push(newHall);
        await eatery.save();

        res.status(200).json(eatery);
    } catch (error) {
        next(error);
    }
};

export const removeHallFromEaterie = async (req: any, res: Response, next: NextFunction) => {
    const { eateriesRoute, hallRoute } = req.params;

    try {
        const eatery = await EateriesModel.findOne({ route: eateriesRoute });
        if (!eatery) {
            return res.status(404).json({ message: "Eatery not found" });
        }

        eatery.halls = eatery.halls.filter(hall => hall.hallRoute !== hallRoute);
        await eatery.save();

        res.status(200).json(eatery);
    } catch (error) {
        next(error);
    }
};

export const addTableToHall = async (req: any, res: Response, next: NextFunction) => {
    const { eateriesRoute, hallRoute } = req.params;
    const newTable: any = req.body;

    if (!eateriesRoute || !hallRoute) {
        return res.status(400).json({ message: 'Both eateriesRoute and hallRoute params are required' });
    }

    if (!newTable) {
        return res.status(400).json({ message: 'Table data is required' });
    }

    try {
        const eatery = await EateriesModel.findOne({ route: eateriesRoute });
        if (!eatery) {
            console.log(`Eatery not found: ${eateriesRoute}`);
            return res.status(404).json({ message: `Eatery "${eateriesRoute}" not found` });
        }

        const hall = eatery.halls.find((hall: any) => hall.hallRoute === hallRoute);
        if (!hall) {
            console.log(`Hall not found: ${hallRoute}`);
            return res.status(404).json({ message: `Hall "${hallRoute}" not found in eatery "${eateriesRoute}"` });
        }

        hall.tables.push(newTable);
        await eatery.save();

        res.status(200).json(eatery);
    } catch (error: any) {
        console.error(`Error adding table to hall: ${error.message}`);
        next(error);
    }
};

export const removeTableFromHall = async (req: any, res: Response, next: NextFunction) => {
    const { eateriesRoute, hallRoute, tableNumber } = req.params;

    if (!eateriesRoute || !hallRoute || !tableNumber) {
        return res.status(400).json({ message: 'Eateries route, hall route, and table number params are required' });
    }

    try {
        const eatery = await EateriesModel.findOne({ route: eateriesRoute });
        if (!eatery) {
            console.log(`Eatery not found: ${eateriesRoute}`);
            return res.status(404).json({ message: `Eatery "${eateriesRoute}" not found` });
        }

        const hall = eatery.halls.find((hall: any) => hall.hallRoute === hallRoute);
        if (!hall) {
            console.log(`Hall not found: ${hallRoute}`);
            return res.status(404).json({ message: `Hall "${hallRoute}" not found in eatery "${eateriesRoute}"` });
        }

        const tableIndex = hall.tables.findIndex((table: any) => table.number === parseInt(tableNumber, 10));

        if (tableIndex === -1) {
            console.log(`Table not found: ${tableNumber}`);
            return res.status(404).json({ message: `Table number "${tableNumber}" not found in hall "${hallRoute}"` });
        }

        hall.tables.splice(tableIndex, 1);
        await eatery.save();

        res.status(200).json(eatery);
    } catch (error: any) {
        console.error(`Error removing table from hall: ${error.message}`);
        next(error);
    }
};

export const addOrderToTable = async (req: any, res: Response, next: NextFunction) => {
    const { eateriesRoute, hallRoute, tableNumber } = req.params;
    const newOrder = req.body;

    // Проверка отсутствующих параметров
    if (!eateriesRoute || !hallRoute || !tableNumber || !newOrder.orderNumber) {
        return res.status(400).json({ message: 'eateriesRoute, hallRoute, tableNumber, and orderNumber are required' });
    }

    try {
        // Поиск заведения по маршруту
        const eatery: any = await EateriesModel.findOne({ route: eateriesRoute });

        if (!eatery) {
            return res.status(404).json({ message: `Eatery with route "${eateriesRoute}" not found` });
        }

        // Проверка на существование заказа с таким номером
        const existingOrder: any = eatery.halls.some((hallItem: any) =>
            hallItem.tables.some((table: any) =>
                table.orders.some((order: any) => order.orderNumber === newOrder.orderNumber)
            )
        );
        if (existingOrder) {
            return res.status(400).json({ message: `Order number "${newOrder.orderNumber}" already exists` });
        }

        // Найти конкретную таблицу
        let tableFound: boolean = false;
        eatery.halls.forEach((hallItem: any) => {
            if (hallItem.hallRoute === hallRoute) {
                hallItem.tables.forEach((table: any) => {
                    if (table.number == tableNumber) {
                        table.orders.push(newOrder);
                        tableFound = true;
                    }
                });
            }
        });

        if (!tableFound) {
            return res.status(404).json({ message: `Table number "${tableNumber}" not found in hall "${hallRoute}" of eatery "${eateriesRoute}"` });
        }

        await eatery.save();

        res.status(200).json({ message: 'Order added successfully' });
    } catch (error) {
        next(error);
    }
};

export const removeOrderFromTable = async (req: any, res: Response, next: NextFunction) => {
    const { eateriesRoute, hallRoute, tableNumber, orderNumber } = req.params;

    try {
        const eatery: any = await EateriesModel.findOne({ route: eateriesRoute });

        if (!eatery) {
            return res.status(404).json({ message: `Eatery with route '${eateriesRoute}' not found` });
        }

        const hall: any = eatery.halls.find((h: any) => h.hallRoute === hallRoute);

        if (!hall) {
            return res.status(404).json({ message: `Hall with route '${hallRoute}' not found` });
        }

        const table: any = hall.tables.find((t: any) => t.number === parseInt(tableNumber, 10));

        if (!table) {
            return res.status(404).json({ message: `Table with number ${tableNumber} not found` });
        }

        const orderIndex: number = table.orders.findIndex((o: any) => o.orderNumber === parseInt(orderNumber, 10));

        if (orderIndex !== -1) {
            table.orders.splice(orderIndex, 1);
            await eatery.save();
            return res.json({ message: `Order ${orderNumber} successfully removed from table ${tableNumber}` });
        } else {
            return res.status(404).json({ message: `Order with number ${orderNumber} not found` });
        }
    } catch (error: any) {
        return res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

export const updateOrderInTable = async (req: any, res: Response, next: NextFunction) => {
    const { eateriesRoute, hallRoute, tableNumber, orderNumber } = req.params;
    const updatedOrder = req.body;

    // Проверка отсутствующих параметров
    if (!eateriesRoute || !hallRoute || !tableNumber || !orderNumber || !updatedOrder) {
        return res
            .status(400)
            .json({ message: 'eateriesRoute, hallRoute, tableNumber, orderNumber, and updatedOrder are required' });
    }

    try {
        // Поиск заведения по маршруту
        const eatery: any = await EateriesModel.findOne({ route: eateriesRoute });

        if (!eatery) {
            return res.status(404).json({ message: `Eatery with route "${eateriesRoute}" not found` });
        }

        // Поиск зала по маршруту
        const hall: any = eatery.halls.find((h: any) => h.hallRoute === hallRoute);

        if (!hall) {
            return res.status(404).json({ message: `Hall with route "${hallRoute}" not found` });
        }

        // Поиск стола по номеру
        const table: any = hall.tables.find((t: any) => t.number === parseInt(tableNumber, 10));

        if (!table) {
            return res.status(404).json({ message: `Table with number ${tableNumber} not found` });
        }

        // Поиск заказа по номеру
        const order: any = table.orders.find((o: any) => o.orderNumber === parseInt(orderNumber, 10));

        if (!order) {
            return res.status(404).json({ message: `Order with number ${orderNumber} not found` });
        }

        // Обновление свойств заказа
        order.guests = updatedOrder.guests;
        order.startTime = updatedOrder.startTime;
        order.endTime = updatedOrder.endTime;
        // Другие свойства заказа для обновления

        await eatery.save();

        res.status(200).json({ message: `Order ${orderNumber} updated successfully` });
    } catch (error: any) {
        next(error);
    }
};

export const addViewsToEaterie = (req: RequestCustom, res: Response, next: NextFunction) => {
    const eateriesRoute = req.params.eateriesRoute;
    const { viewsCount } = req.body;

    if (!viewsCount || typeof viewsCount !== 'string') {
        return next(new BadRequestError('Некорректные данные для лайка'));
    }

    EateriesModel.findOneAndUpdate(
        { route: eateriesRoute },
        { $addToSet: { viewsCount: viewsCount } },
        { new: true }
    )
        .then((updatedEaterie) => {
            if (!updatedEaterie) {
                throw new NotFoundError('Заведение не найдено');
            }

            res.status(200).send({
                status: 'success',
                data: updatedEaterie,
            });
        })
        .catch((error) => {
            if (error.name === 'CastError') {
                next(new BadRequestError('Некорректное имя'));
            } else {
                next(new Error('Произошла ошибка при добавлении лайка'));
            }
        });
};
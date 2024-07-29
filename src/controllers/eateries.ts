import {
    Response,
    NextFunction,
} from 'express';
import EateriesModel from '../models/eateries';
import TableModel from '../models/tables-model'
import { RequestCustom } from '../utils/types';
import { NotFoundError } from '../utils/not-found-error-class'
import { BadRequestError } from '../utils/bad-request-error-class'

export const getAllEateries = async (req: RequestCustom, res: Response, next: NextFunction) => {
    try {
        const eateries = await EateriesModel.find({}).populate({
            path: 'halls.tables'
        });

        if (!eateries.length) {
            throw new NotFoundError('Не найдено ни одного заведения');
        }

        res.status(200).send({
            status: 'success',
            data: eateries,
        });
    } catch (error) {
        next(new Error('Произошла ошибка при получении заведений'));
    }
};

export const getAllTables = async (req: RequestCustom, res: Response, next: NextFunction) => {
    try {
        const allTables = await TableModel.find();
        res.status(200).json(allTables);
    } catch (error) {
        console.error(error); // Логирование ошибки
        next(error);
    }
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
    const {
        name,
        title,
        deposit,
        description,
        city,
        adress,
        coordinates,
        averageBill,
        establishmentType,
        likes,
        viewsCount,
        disabledDates,
        kitchenType,
        openingHours,
        rating,
        metro,
        phone,
        yandexmap,
        route,
        menu,
        catalog,
        photo,
        halls,
        tagTitle,
        tagKeywords
    } = req.body;
    EateriesModel.create({
        name,
        title,
        deposit,
        description,
        city,
        adress,
        coordinates,
        averageBill,
        establishmentType,
        likes,
        viewsCount,
        disabledDates,
        kitchenType,
        openingHours,
        rating,
        metro,
        phone,
        yandexmap,
        route,
        menu,
        catalog,
        photo,
        halls,
        tagTitle,
        tagKeywords
    })
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
    const newTableData = req.body;

    try {
        const eatery = await EateriesModel.findOne({ route: eateriesRoute });
        if (!eatery) {
            return res.status(404).json({ message: `Eatery "${eateriesRoute}" not found` });
        }

        const hall = eatery.halls.find((hall) => hall.hallRoute === hallRoute);
        if (!hall) {
            return res.status(404).json({ message: `Hall "${hallRoute}" not found in eatery "${eateriesRoute}"` });
        }

        // Проверка данных стола перед сохранением
        console.log('New Table Data:', newTableData);
        
        const newTable: any = new TableModel(newTableData);
        newTable.save();

        console.log('Стол сохранился');

        hall.tables.push(newTable._id); // Добавление _id стола к массиву tables зала
        await eatery.save();

        res.status(200).json({ message: 'Table successfully added to hall' });
    } catch (error) {
        next(error);
    }
};

export const removeTableFromHall = async (req: any, res: Response, next: NextFunction) => {
    const { eateriesRoute, hallRoute, tableId } = req.params;

    try {
        const eatery: any = await EateriesModel.findOne({ route: eateriesRoute });
        if (!eatery) {
            return res.status(404).json({ message: `Eatery "${eateriesRoute}" not found` });
        }

        const hall: any = eatery.halls.find((hall: any) => hall.hallRoute === hallRoute);
        if (!hall) {
            return res.status(404).json({ message: `Hall "${hallRoute}" not found in eatery "${eateriesRoute}"` });
        }

        const table: any = await TableModel.findById(tableId);
        if (!table) {
            return res.status(404).json({ message: `Table with ID "${tableId}" not found in hall "${hallRoute}"` });
        }

        hall.tables = hall.tables.filter((currentTableId: any) => currentTableId.toString() !== tableId);
        await TableModel.deleteOne({ _id: tableId });
        await eatery.save();

        res.status(200).json({ message: 'Table successfully removed from hall' });
    } catch (error) {
        next(error);
    }
};

export const addOrderToTable = async (req: any, res: Response, next: NextFunction) => {
    const { eateriesRoute, tableNumber } = req.params;
    const newOrder = req.body;

    console.log('Received request to add order:', { eateriesRoute, tableNumber, newOrder });

    // Проверка параметров
    if (!eateriesRoute || !tableNumber) {
        console.log('Invalid parameters:', { eateriesRoute, tableNumber });
        return res.status(400).json({ message: "Invalid eateriesRoute or tableNumber" });
    }

    const tableNumberInt = parseInt(tableNumber, 10);  // Преобразуем tableNumber в число

    if (isNaN(tableNumberInt)) {
        console.error('Invalid table number format:', tableNumber);
        return res.status(400).json({ message: "Invalid table number format" });
    }

    try {
        const eatery: any = await EateriesModel.findOne({ route: eateriesRoute });

        if (!eatery) {
            console.error(`Eatery with route "${eateriesRoute}" not found`);
            return res.status(404).json({ message: `Eatery with route "${eateriesRoute}" not found` });
        }

        console.log('Found eatery:', eatery);

        // Найдем конкретную таблицу по номеру стола во всех залах
        let foundTable = null;
        for (const hall of eatery.halls) {
            const table = hall.tables.find((t: any) => t.number === tableNumberInt);
            if (table) {
                foundTable = table;
                break;
            }
        }

        if (!foundTable) {
            console.error(`Table with number "${tableNumber}" not found in eatery "${eateriesRoute}"`);
            return res.status(404).json({ message: `Table with number "${tableNumber}" not found in eatery "${eateriesRoute}"` });
        }

        console.log('Found table:', foundTable);

        foundTable.orders.push(newOrder);
        await eatery.save();

        console.log('Order added successfully');
        return res.status(200).json({ message: 'Order added successfully' });
    } catch (error) {
        console.error(`Error adding order to table: ${error}`);
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
    const { views } = req.body;

    if (!views || typeof views !== 'string') {
        return next(new BadRequestError('Некорректные данные для просмотра'));
    }

    EateriesModel.findOneAndUpdate(
        { route: eateriesRoute },
        { $push: { viewsCount: views } }, // Изменено с $addToSet на $push
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
                next(new Error('Произошла ошибка при добавлении просмотра'));
            }
        });
};
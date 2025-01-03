import {
    Response,
    NextFunction,
} from 'express';
import EateriesModel from '../models/eateries-model';
import TableModel from '../models/tables-model'
import { NotFoundError } from '../utils/not-found-error-class'
import { BadRequestError } from '../utils/bad-request-error-class'

export const getAllEateries = async (req: any, res: Response, next: NextFunction) => {
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

export const getEateriesByName = (req: any, res: Response, next: NextFunction) => {

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

export const getEateriesById = (req: any, res: Response, next: NextFunction) => {
    const eateryId = req.params.id;

    EateriesModel.findById(eateryId)
        .populate({
            path: 'halls.tables',
            populate: {
                path: 'orders', // Указываем, что хотим популяцию для поля 'orders'
            }
        })
        .then((foundEatery) => {
            if (!foundEatery) {
                throw new NotFoundError('Заведение не найдено');
            }

            res.status(200).send({
                status: 'success',
                data: foundEatery,
            });
        })
        .catch((error) => {
            console.error('Error fetching eatery by ID:', error);
            if (error.name === 'CastError') {
                next(new BadRequestError('Некорректный идентификатор заведения'));
            } else {
                next(new Error('Произошла ошибка при получении данных заведения'));
            }
        });
};

export const getEateriesByCity = (req: any, res: Response, next: NextFunction) => {
    const { city } = req.body;

    console.log(`Received city: ${city}`); // Для отладки

    if (!city) {
        return next(new BadRequestError('Поле "city" обязательно для заполнения'));
    }

    const decodedCity = decodeURIComponent(city); // Декодирование значения города

    EateriesModel.find({ city: decodedCity }).populate({
        path: 'halls.tables',
        populate: {
            path: 'orders', // Указываем, что хотим популяцию для поля 'orders'
        }
    })
        .then((eateries) => {
            if (!eateries.length) {
                return res.status(200).send({
                    status: 'success',
                    data: [],
                });
            }

            res.status(200).send({
                status: 'success',
                data: eateries,
            });
        })
        .catch((error) => {
            if (error.name === 'CastError') {
                next(new BadRequestError('Некорректное название города'));
            } else {
                next(new Error('Произошла ошибка при получении данных заведения'));
            }
        });
};

export const getAllUniqueCities = async (req: any, res: Response, next: NextFunction) => {
    try {
        const cities = await EateriesModel.distinct('city'); // Этот метод вернет уникальные значения

        if (!cities.length) {
            throw new NotFoundError('Не найдено ни одного города');
        }

        res.status(200).send({
            status: 'success',
            data: cities,
        });
    } catch (error) {
        next(new Error('Произошла ошибка при получении данных о городах'));
    }
};

export const postOneEaterie = (req: any, res: Response, next: NextFunction) => {
    const {
        name,
        email,
        title,
        deposit,
        description,
        city,
        adress,
        coordinates,
        averageBill,
        establishmentType,
        kitchenType,
        openingHours,
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
        email,
        title,
        deposit,
        description,
        city,
        adress,
        coordinates,
        averageBill,
        establishmentType,
        kitchenType,
        openingHours,
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

export const removeEaterie = (req: any, res: Response, next: NextFunction) => {
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

export const addLikeToEaterie = (req: any, res: Response, next: NextFunction) => {
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

export const removeLikeFromEaterie = (req: any, res: Response, next: NextFunction) => {
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
    const { eateriesRoute } = req.params;
    const newTableData = req.body;

    try {
        const eatery = await EateriesModel.findOne({ route: eateriesRoute });
        if (!eatery) {
            return res.status(404).json({ message: `Eatery "${eateriesRoute}" not found` });
        }

        // Проверка существования зала по hallId
        const hallExists = eatery.halls.some((hall: any) => hall._id.toString() === newTableData.hallId);
        if (!hallExists) {
            return res.status(404).json({ message: `Hall with id "${newTableData.hallId}" not found in eatery "${eateriesRoute}"` });
        }

        // Проверка данных стола перед сохранением
        console.log('New Table Data:', newTableData);

        try {
            const newTable = new TableModel(newTableData);
            await newTable.save();

            console.log('Стол сохранился');

            const hall: any = eatery.halls.find((hall: any) => hall._id.toString() === newTableData.hallId);
            hall.tables.push(newTable._id); // Добавление _id стола к массиву tables зала
            await eatery.save();

            res.status(200).json({ message: 'Table successfully added to hall', table: newTable });
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(400).json({ message: 'Table with this number already exists in the hall' });
            }
            throw error; // Если ошибка не связана с дублированием, пробросим дальше для обработки
        }
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

export const addViewsToEaterie = (req: any, res: Response, next: NextFunction) => {
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

export const addDisabledDatesToEaterie = (req: any, res: Response, next: NextFunction) => {
    const eateriesRoute = req.params.eateriesRoute;
    const { dates } = req.body;

    if (!dates || !Array.isArray(dates) || !dates.every(date => typeof date === 'string')) {
        return next(new BadRequestError('Некорректные данные для дат'));
    }

    EateriesModel.findOneAndUpdate(
        { route: eateriesRoute },
        { $addToSet: { disabledDates: { $each: dates } } }, // Use $each to add multiple dates
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
                next(new BadRequestError('Некорректный идентификатор заведения'));
            } else {
                next(new Error('Произошла ошибка при обновлении дат'));
            }
        });
};

export const removeDisabledDatesFromEaterie = (req: any, res: Response, next: NextFunction) => {
    const eateriesRoute = req.params.eateriesRoute;
    const { dates } = req.body;

    // Проверка входных данных
    if (!dates || !Array.isArray(dates) || !dates.every(date => typeof date === 'string')) {
        return next(new BadRequestError('Некорректные данные для дат'));
    }

    // Обновление документа в базе данных
    EateriesModel.findOneAndUpdate(
        { route: eateriesRoute },
        { $pull: { disabledDates: { $in: dates } } }, // Удаление дат из массива disabledDates
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
                next(new BadRequestError('Некорректный идентификатор заведения'));
            } else {
                next(new Error('Произошла ошибка при удалении дат'));
            }
        });
};

export const addRatingToEaterie = async (req: any, res: Response, next: NextFunction) => {
    const { eateriesRoute } = req.params;
    const { userId, score, orderId } = req.body;

    if (!userId || !score || typeof score !== 'number' || score < 1 || score > 5) {
        return next(new BadRequestError('Некорректные данные для оценки'));
    }

    try {
        // Проверяем существование заведения
        const eaterie = await EateriesModel.findOne({ route: eateriesRoute }).exec();
        if (!eaterie) {
            throw new NotFoundError('Заведение не найдено');
        }

        // Проверяем, оставил ли пользователь рейтинг раньше
        {/*const existingRating = eaterie.rating.find((rating: any) => rating.userId === userId);
        if (existingRating) {
            return next(new BadRequestError('Рейтинг уже был оставлен этим пользователем'));
        }*/}

        // Добавляем рейтинг
        const updatedEaterie = await EateriesModel.findOneAndUpdate(
            { route: eateriesRoute },
            {
                $push: {
                    rating: { userId, score, orderId },
                },
            },
            { new: true }
        ).exec();

        if (!updatedEaterie) {
            throw new NotFoundError('Заведение не найдено');
        }

        res.status(200).send({
            status: 'success',
            message: 'Рейтинг добавлен!',
            data: updatedEaterie,
        });
    } catch (error: any) {
        if (error.name === 'CastError') {
            next(new BadRequestError('Некорректные данные'));
        } else {
            next(new Error('Произошла ошибка при добавлении рейтинга'));
        }
    }
};

export const deleteRatingInEaterie = (req: any, res: Response, next: NextFunction) => {
    const { eateriesRoute, ratingId } = req.params; // Маршрут заведения

    EateriesModel.findOneAndUpdate(
        { route: eateriesRoute },
        { $pull: { rating: { _id: ratingId } } }, // Удаляем рейтинг по ratingId и userId
        { new: true }
    )
        .then((updatedEaterie) => {
            if (!updatedEaterie) {
                throw new NotFoundError('Заведение с указанным рейтингом не найдено');
            }

            res.status(200).send({
                status: 'success',
                message: 'Рейтинг удален!',
                data: updatedEaterie,
            });
        })
        .catch((error) => {
            if (error.name === 'CastError') {
                next(new BadRequestError('Некорректные данные'));
            } else {
                next(new Error('Произошла ошибка при удалении рейтинга'));
            }
        });
};

export const getRatingByUserAndEateriesRoute = async (req: any, res: Response, next: NextFunction) => {
    const { eateriesRoute, userId, orderId } = req.params;

    try {
        if (!eateriesRoute || !userId || !orderId) {
            return next(new BadRequestError('Не указаны необходимые параметры (eateriesRoute или userId)'));
        }

        // Поиск заведения по маршруту
        const eaterie = await EateriesModel.findOne({ route: eateriesRoute }).exec();
        if (!eaterie) {
            return next(new NotFoundError('Заведение не найдено'));
        }

        // Проверка рейтинга пользователя в данном заведении
        const userRating = eaterie.rating.find((rating: any) => rating.userId === userId && rating.orderId === orderId);
        if (!userRating) {
            return res.status(200).send({
                status: 'not-found',
                data: {
                    eateriesRoute: eaterie.route,
                    userId: userId,
                    orderId: ''
                },
            });
        }

        res.status(200).send({
            status: 'success',
            data: {
                eateriesRoute: eaterie.route,
                userId: userId,
                score: userRating.score,
                orderId: orderId
            },
        });
        
    } catch (error: any) {
        next(new Error('Произошла ошибка при получении рейтинга'));
    }
};
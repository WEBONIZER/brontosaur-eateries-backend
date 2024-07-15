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
    const { name, title, deposit, description, city, adress, averageBill, establishmentType, likes, disabledDates, kitchenType, openingHours, rating, metro, phone, yandexmap, route, menu, catalog, photo, halls } = req.body;
    EateriesModel.create({ name, title, deposit, description, city, adress, averageBill, establishmentType, likes, disabledDates, kitchenType, openingHours, rating, metro, phone, yandexmap, route, menu, catalog, photo, halls })
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

export const addHallToEaterie = async (req: RequestCustom, res: Response, next: NextFunction) => {
    const { eateriesRoute } = req.params;
    const newHall = req.body.hall;

    try {
        console.log(`Trying to find eatery: ${eateriesRoute}`);
        const eatery = await EateriesModel.findOne({ name: eateriesRoute });
        if (!eatery) {
            console.log(`Eatery not found: ${eateriesRoute}`);
            return res.status(404).json({ message: `Eatery "${eateriesRoute}" not found` });
        }

        eatery.halls.push(newHall);
        console.log(`Adding new hall: ${JSON.stringify(newHall)}`);
        await eatery.save();

        res.status(200).json(eatery);
    } catch (error: any) {
        console.error(`Error adding hall to eatery: ${error.message}`);
        next(error);
    }
};

export const removeHallFromEaterie = async (req: RequestCustom, res: Response, next: NextFunction) => {
    const { eateriesRoute, hallName } = req.params;

    try {
        const eatery = await EateriesModel.findOne({ name: eateriesRoute });
        if (!eatery) {
            return res.status(404).json({ message: "Eatery not found" });
        }

        eatery.halls = eatery.halls.filter(hall => hall.name !== hallName);
        await eatery.save();

        res.status(200).json(eatery);
    } catch (error) {
        next(error);
    }
};
import { Router } from 'express';
import {
    getAllEateries,
    getEateriesByName,
    postOneEaterie,
    removeEaterie,
    addLikeToEaterie,
    removeLikeFromEaterie,
    addHallToEaterie,
    removeHallFromEaterie,
    addTableToHall,
    removeTableFromHall,
    removeOrderFromTable,
    updateOrderInTable,
    addViewsToEaterie,
    getEateriesByCity,
    getAllUniqueCities,
    getEateriesById,
    addDisabledDatesToEaterie,
    removeDisabledDatesFromEaterie,
    addRatingToEaterie,
    deleteRatingInEaterie,
    getRatingByUserAndEateriesRoute
} from '../controllers/eateries-controllers';
import { authMiddleware } from '../middlewares/auth-middlewares';

const eateries = Router();

eateries.get('/', authMiddleware, getAllEateries);
eateries.post('/by-city', authMiddleware, getEateriesByCity);
eateries.get('/unique-cities', authMiddleware, getAllUniqueCities);
eateries.post('/', authMiddleware, postOneEaterie);
eateries.delete('/:eateriesRoute', authMiddleware, removeEaterie)
eateries.get('/:eateriesRoute', authMiddleware, getEateriesByName);
eateries.get('/get-eaterie/:id', authMiddleware, getEateriesById);
eateries.patch('/:eateriesRoute/like', authMiddleware, addLikeToEaterie);
eateries.delete('/:eateriesRoute/like', authMiddleware, removeLikeFromEaterie);

// Добавление и удаление залов
eateries.post('/:eateriesRoute/halls', authMiddleware, addHallToEaterie);
eateries.delete('/:eateriesRoute/halls/:hallRoute', authMiddleware, removeHallFromEaterie); // Удалить зал по имени

eateries.post('/:eateriesRoute/halls/:hallRoute/tables', authMiddleware, addTableToHall);
eateries.delete('/:eateriesRoute/halls/:hallRoute/tables/:tableId', authMiddleware, removeTableFromHall);

eateries.delete('/:eateriesRoute/halls/:hallRoute/tables/:tableNumber/orders/:orderNumber', authMiddleware, removeOrderFromTable);
eateries.patch('/:eateriesRoute/halls/:hallRoute/tables/:tableNumber/orders/:orderNumber', authMiddleware, updateOrderInTable);

eateries.patch('/:eateriesRoute/views', authMiddleware, addViewsToEaterie);

eateries.post('/:eateriesRoute/disabled-dates', authMiddleware, addDisabledDatesToEaterie);
eateries.delete('/:eateriesRoute/disabled-dates', authMiddleware, removeDisabledDatesFromEaterie);

eateries.post('/:eateriesRoute/add-rating', authMiddleware, addRatingToEaterie);
eateries.delete('/:eateriesRoute/delete-rating/:ratingId', authMiddleware, deleteRatingInEaterie);
eateries.get('/:eateriesRoute/rating/:userId/:orderId', authMiddleware, getRatingByUserAndEateriesRoute);

export default eateries; 
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
    updateRatingInEaterie,
    getRatingsByUserId
} from '../controllers/eateries-controllers';

const eateries = Router();

eateries.get('/', getAllEateries);
eateries.post('/by-city', getEateriesByCity);
eateries.get('/unique-cities', getAllUniqueCities);
eateries.post('/', postOneEaterie);
eateries.delete('/:eateriesRoute', removeEaterie)
eateries.get('/:eateriesRoute', getEateriesByName);
eateries.get('/get-eaterie/:id', getEateriesById);
eateries.patch('/:eateriesRoute/like', addLikeToEaterie);
eateries.delete('/:eateriesRoute/like', removeLikeFromEaterie);

// Добавление и удаление залов
eateries.post('/:eateriesRoute/halls', addHallToEaterie);
eateries.delete('/:eateriesRoute/halls/:hallRoute', removeHallFromEaterie); // Удалить зал по имени

eateries.post('/:eateriesRoute/halls/:hallRoute/tables', addTableToHall);
eateries.delete('/:eateriesRoute/halls/:hallRoute/tables/:tableId', removeTableFromHall);

eateries.delete('/:eateriesRoute/halls/:hallRoute/tables/:tableNumber/orders/:orderNumber', removeOrderFromTable);
eateries.patch('/:eateriesRoute/halls/:hallRoute/tables/:tableNumber/orders/:orderNumber', updateOrderInTable);

eateries.patch('/:eateriesRoute/views', addViewsToEaterie);

eateries.post('/:eateriesRoute/disabled-dates', addDisabledDatesToEaterie);
eateries.delete('/:eateriesRoute/disabled-dates', removeDisabledDatesFromEaterie);

eateries.post('/:eateriesRoute/add-rating', addRatingToEaterie);
eateries.patch('/:eateriesRoute/update-rating', updateRatingInEaterie);
eateries.get('/rating/:userId', getRatingsByUserId);

export default eateries; 
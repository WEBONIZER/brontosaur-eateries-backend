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
    addViewsToEaterie
} from '../controllers/eateries-controllers';

const eateries = Router();

eateries.get('/', getAllEateries);
eateries.post('/', postOneEaterie);
eateries.delete('/:eateriesRoute', removeEaterie)
eateries.get('/:eateriesRoute', getEateriesByName);
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

export default eateries; 
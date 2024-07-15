import { Router } from 'express';
import {
    getAllEateries,
    getEateriesByName,
    postOneEaterie,
    removeEaterie,
    addLikeToEaterie,
    removeLikeFromEaterie,
    addHallToEaterie,
    removeHallFromEaterie
} from '../controllers/eateries';

const eateries = Router();

eateries.get('/', getAllEateries);
eateries.post('/', postOneEaterie);
eateries.delete('/:eateriesRoute', removeEaterie)
eateries.get('/:eateriesRoute', getEateriesByName);
eateries.patch('/:eateriesRoute/like', addLikeToEaterie);
eateries.delete('/:eateriesRoute/like', removeLikeFromEaterie);

// Добавление и удаление залов
eateries.post('/:eateriesRoute/halls', addHallToEaterie); // Добавить зал
eateries.delete('/:eateriesRoute/halls/:hallName', removeHallFromEaterie); // Удалить зал по имени

export default eateries; 
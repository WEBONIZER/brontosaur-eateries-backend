import { Router } from 'express';
import { getAllEateries, getEateriesByName, postOneEaterie, removeEaterie, addLikeToEaterie, removeLikeFromEaterie } from '../controllers/eateries';

const eateries = Router();

eateries.get('/', getAllEateries);
eateries.post('/', postOneEaterie);
eateries.delete('/:eateriesRoute', removeEaterie)
eateries.get('/:eateriesRoute', getEateriesByName);
eateries.patch('/:eateriesRoute/like', addLikeToEaterie);
eateries.delete('/:eateriesRoute/like', removeLikeFromEaterie);
//eateries.patch('/:blogRoute/unlike', removeLikeFromBlog);
//eateries.patch('/:blogRoute/unviewing', removeViewingFromBlog);

export default eateries; 
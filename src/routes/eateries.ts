import { Router } from 'express';
import { getAllEateries, getEateriesByName, postOneEaterie, removeEaterie, addLikeToEaterie } from '../controllers/eateries';

const eateries = Router();

eateries.get('/', getAllEateries);
eateries.post('/', postOneEaterie);
eateries.delete('/:eateriesRoute', removeEaterie)
eateries.get('/:eateriesRoute', getEateriesByName);
eateries.patch('/:eateriesRoute/like', addLikeToEaterie);
//eateries.patch('/:blogRoute/viewing', addViewingToBlog);
//eateries.patch('/:blogRoute/unlike', removeLikeFromBlog);
//eateries.patch('/:blogRoute/unviewing', removeViewingFromBlog);

export default eateries; 
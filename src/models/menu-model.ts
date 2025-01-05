import {
  Schema,
  model,
} from 'mongoose';
import { IMenu } from '../utils/types';

const nutrientsSchema = new Schema({
  calories:{ type: Number },
  protein:{ type: Number },
  fat:{ type: Number },
  carbohydrates:{ type: Number },
});

export const menuSchema = new Schema<IMenu>({
  name: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: false,
  },
  manufacturer: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  restaurant: {
    type: String,
    required: true,
  },
  available: {
    type: Boolean,
    required: true,
  },
  nutrients: {
    type: nutrientsSchema,
    required: false,
  },
  new: {
    type: Boolean,
    required: false,
  },
},
{
  timestamps: true,
});

const MenuModel = model<IMenu>('menu', menuSchema);

export default MenuModel; 
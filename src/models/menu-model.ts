import {
  Schema,
  model,
} from 'mongoose';
import { IMenu } from '../utils/types';

const nutrientsSchema = new Schema({
  calories:{ 
    type: Number,
    default: 0
  },
  protein:{ 
    type: Number,
    default: 0
  },
  fat:{ 
    type: Number,
    default: 0 
  },
  carbohydrates:{ 
    type: Number,
    default: 0
  },
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
    required: false,
    default: ''
  },
  category: {
    type: String,
    required: true,
  },
  restaurant: {
    type: String,
    required: true,
  },
  moderate: {
    type: Boolean,
    required: false,
    default: false
  },
  available: {
    type: Boolean,
    required: true,
  },
  nutrients: {
    type: nutrientsSchema,
    required: false,
    default: {}
  },
  new: {
    type: Boolean,
    required: false,
    default: true
  },
},
{
  timestamps: true,
});

const MenuModel = model<IMenu>('menu', menuSchema);

export default MenuModel; 
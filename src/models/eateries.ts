import {
  Schema,
  model,
} from 'mongoose';
import { IEateries } from '../utils/types';

const openingHoursSchema = new Schema({
  closing: { type: Number },
  opening: { type: Number },
});

const photoSchema = new Schema({
  src: { type: String },
  alt: { type: String },
});

const photoToHallSchema = new Schema({
  src: { type: String },
  alt: { type: String },
});

const startTimeSchema = new Schema({
  hours: { type: Number },
  minutes: { type: Number },
});

const endTimeSchema = new Schema({
  hours: { type: Number },
  minutes: { type: Number },
});

const orderToTableSchema = new Schema({
  guests: { type: Number },
  tableNumber: { type: Number },
  orderNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  barName: { type: String },
  date: { type: String },
  startTime: { type: startTimeSchema },
  endTime: { type: endTimeSchema },
});

const guestsToTableSchema = new Schema({
  min: { type: Number },
  max: { type: Number },
});

const tableToHallSchema = new Schema({
  number: { 
    type: Number,    
    required: true,
    unique: true,
  },
  photo: { type: String },
  places: { type: Number },
  chairs: { type: String },
  orders: { type: [orderToTableSchema] },
  guests: { type: guestsToTableSchema },
});

const hallSchema = new Schema({
  hallRoute:{ type: String },
  name: { type: String },
  video: { type: String },
  photos: { type: [photoToHallSchema] },
  tables: { type: [tableToHallSchema] },
});

const eateriesSchema = new Schema<IEateries>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  deposit: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  adress: {
    type: String,
    required: true,
  },
  averageBill: {
    type: Number,
    required: true,
  },
  establishmentType: {
    type: String,
    required: true,
  },
  likes: {
    type: [String],
    required: true,
  },
  disabledDates: {
    type: [String],
    required: true,
  },
  kitchenType: {
    type: String,
    required: true,
  },
  openingHours: {
    type: openingHoursSchema,
    required: true,
  },
  rating: {
    type: [String],
    required: true,
  },
  metro: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  yandexmap: {
    type: String,
    required: true,
  },
  route: {
    type: String,
    required: true,
  },
  menu: {
    type: String,
    required: true,
    unique: true,
  },
  catalog: {
    type: Boolean,
    required: true,
  },
  photo: {
    type: photoSchema,
    required: true,
  },
  halls: {
    type: [hallSchema],
    required: true,
  },
});

const EateriesModel = model<IEateries>('eaterie', eateriesSchema);

export default EateriesModel; 
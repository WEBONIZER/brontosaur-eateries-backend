import { ObjectId } from 'mongoose';
import { Request } from 'express';

export interface RequestCustom extends Request {
  user?: {
    _id: string;
  };
}

interface IOpeningHours {
  closing: number;
  opening: number;
}

interface IPhoto {
  src: string;
  alt: string;
}

interface IPhotoToHall {
  src: string;
  alt: string;
}

interface IOrderToTable {
  guests: number;
  orderNumber: number;
  tableNumber: number;
  barId: string;
  date: string;
  startTime: number;
  endTime: number;
  active: boolean;
  confirmation: boolean;
  payment: boolean;
  userCancelled: boolean;
}

interface IGuestsToTable {
  min: number;
  max: number;
}

export interface ITable {
  number: number;
  orders: IOrderToTable[];
  photo: string;
  places: number;
  chairs: string;
  guests: IGuestsToTable;
}

interface IHall {
  hallRoute: string;
  name: string;
  video: string;
  photos: IPhotoToHall[];
  tables: ITable[];
}

interface IRestaurant {
  lat: number;
  lon: number;
}

export interface IRating {
  userId: string;
  score: number;
}

export interface IEateries {
  name: string;
  deposit: number;
  title: string;
  description: string;
  city: string;
  adress: string;
  coordinates: IRestaurant;
  averageBill: number;
  establishmentType: string;
  likes: string[];
  viewsCount: string[];
  disabledDates: string[];
  kitchenType: string;
  openingHours: IOpeningHours;
  rating: IRating[];
  metro: string;
  phone: string;
  yandexmap: string;
  photo: IPhoto;
  route: string;
  menu: string;
  catalog: boolean;
  halls: IHall[];
  tagTitle: string;
  tagKeywords: string;
  eateriesAdminId: string;
  email: string;
  payment: boolean;
}

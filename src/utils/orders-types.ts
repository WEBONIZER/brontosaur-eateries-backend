import { Request } from 'express';
import { ObjectId } from 'mongoose';
import { IMenu } from './types'

export interface RequestCustom extends Request {
  user?: {
    _id: string;
  };
}

interface IOrderTime {
  hours: number;
  minutes: string;
}

interface ImenuItemsBoxArr {
  item: IMenu;
  quantiy: number;
}

export interface IOrder {
  comment: string;
  userID: string;
  tableId: string;
  orderNumber: number;
  active: boolean;
  confirmation: boolean;
  cancelled: boolean;
  userCancelled: boolean;
  payment: boolean;
  prepareFoodInAdvance: boolean;
  guests: number;
  tableNumber: number;
  barId: string;
  date: string;
  orderCloseDate: Date;
  startTime: number;
  endTime: number;
  menuItemsBox?: ImenuItemsBoxArr[];
  orderSum: number;
  createdAt?: any;
  userEmail: string;
  eaterieEmail: string;
  barName: string;
}
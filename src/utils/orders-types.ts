import { Request } from 'express';

export interface RequestCustom extends Request {
  user?: {
    _id: string;
  };
}

interface IOrderTime {
  hours: number;
  minutes: string;
}

export interface IOrder {
  comment: string;
  userID: string;
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
  menuItemsBox: string[];
  orderSum: number;
  createdAt?: any;
  userEmail: string;
  eaterieEmail: string;
  barName: string;
}
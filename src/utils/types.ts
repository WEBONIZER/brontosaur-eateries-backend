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

interface IGuestsToTable {
  min: number;
  max: number;
}

export interface ITable {
  number: number;
  hallId: string;
  photo?: string;
  places: number;
  chairs: string;
  orders?: ObjectId[];
  blocked: boolean;
  guests: {
      min: number;
      max: number;
  };
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
  orderId: string;
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
  menuItems?: ObjectId[];
}

interface Inutrients {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}

export interface IMenu {
  name: string;
  weight: number;
  manufacturer: string;
  description: string;
  price: number;
  photo: string;
  category: string;
  restaurant: string;
  available: boolean;
  nutrients: Inutrients;
  new: boolean;
  _id?: string;
}

export interface IRating {
  userId: string;
  score: number;
}

export interface IDataProcessing {
  consentToDataProcessing: boolean,
  acceptedUserAgreement: boolean,
  acceptedPrivacyPolicy: boolean,
  consentGivenAt: Date,
  userAgreementVersion: string,
  dataProcessingVersion: string,
  privacyPolicyVersion: string,
  userIpAdress: string,
}

export interface IUser {
  userRole: string,
  orders: string[],
  phoneNumber: string,
  fullName: string,
  email: string,
  passwordHash: string;
  favourites: string[],
  verificationCode: string,
  isEmailVerified: boolean,
  phoneVerificationCode: string,
  isPhoneVerified: boolean,
  eateriesAdmin: string,
  userDataProcessing: IDataProcessing,
}

export interface IEstablishmentNotFound {
  name: string;
  city: string;
}
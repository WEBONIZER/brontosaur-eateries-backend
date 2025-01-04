import {
  Schema,
  model,
} from 'mongoose';
import { IUser, IDataProcessing } from '../utils/types'

const ratingSchema = new Schema({
  userId: { type: String, required: true }, // Кто поставил оценку
  score: { type: Number, min: 1, max: 5, required: true }, // Оценка от 1 до 5
});

const dataProcessingSchema = new Schema<IDataProcessing>({
  consentToDataProcessing: {
    type: Boolean,
    required: true,
  },
  acceptedUserAgreement: {
    type: Boolean,
    required: true,
  },
  acceptedPrivacyPolicy: {
    type: Boolean,
    required: true,
  },
  consentGivenAt: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  userAgreementVersion: {
    type: String,
    required: true,
  },
  dataProcessingVersion: {
    type: String,
    required: true,
  },
  privacyPolicyVersion: {
    type: String,
    required: true,
  },
  userIpAdress: {
    type: String,
    required: true,
  },
});

const UserSchema = new Schema<IUser>(
  {
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: false,
      default: '',
    },
    email: {
      type: String,
      required: false,
      unique: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: false,
      default: 'User',
    },
    orders: {
      type: [String],
      required: false,
    },
    favourites: {
      type: [String],
      required: false,
    },
    verificationCode: {
      type: String,
      required: false,
    },
    isEmailVerified: {
      type: Boolean,
      required: false,
      default: false,
    },
    phoneVerificationCode: {
      type: String,
      required: false,
    },
    isPhoneVerified: {
      type: Boolean,
      required: false,
      default: true,
    },
    eateriesAdmin: {
      type: String,
      required: false,
    },
    userDataProcessing: {
      type: dataProcessingSchema,
      required: true,
      default: {}
    }
  },
  {
    timestamps: true,
  },
);

export const UserModel = model<IUser>('user', UserSchema);
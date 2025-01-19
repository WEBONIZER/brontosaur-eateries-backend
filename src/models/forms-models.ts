import {
    Schema,
    model,
} from 'mongoose';
import { IEstablishmentNotFound } from '../utils/types'

const EstablishmentNotFoundhema = new Schema<IEstablishmentNotFound>(
    {
        name: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        comment: {
            type: String,
            required: false,
            default: ''
        }
    },
    {
        timestamps: true,
    },
);

export const EstablishmentNotFoundModel = model<IEstablishmentNotFound>('form', EstablishmentNotFoundhema);
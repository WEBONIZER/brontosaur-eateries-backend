import { Schema, model, Document } from 'mongoose';
import { IEateries } from '../utils/types';

// Предполагая, что IEateries уже содержит все нижеперечисленные поля
interface IEaterieDocument extends Document, IEateries {
  removeExpiredDates(): Promise<void>;
}

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

const hallSchema = new Schema({
  hallRoute: { type: String },
  name: { type: String },
  video: { type: String },
  photos: { type: [photoToHallSchema] },
  tables: [{
    type: Schema.Types.ObjectId,
    ref: 'table',
  }],
});

const coordinatesSchema = new Schema({
  lat: {
    type: Number,
    required: false,
  },
  lon: {
    type: Number,
    required: false,
  },
});

const eateriesSchema = new Schema<IEaterieDocument>({
  name: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  deposit: { type: Number, required: true },
  description: { type: String, required: true },
  city: { type: String, required: true },
  adress: { type: String, required: true },
  coordinates: coordinatesSchema,
  averageBill: { type: Number, required: true },
  establishmentType: { type: String, required: true },
  likes: { type: [String], required: true },
  viewsCount: { type: [String], required: true },
  disabledDates: { type: [String], required: true }, // Или Date[], если это возможно
  kitchenType: { type: String, required: true },
  openingHours: { type: openingHoursSchema, required: true },
  rating: { type: [String], required: true },
  metro: { type: String, required: true },
  phone: { type: String, required: true },
  yandexmap: { type: String, required: true },
  route: { type: String, required: true },
  menu: { type: String, required: true, unique: true },
  catalog: { type: Boolean, required: true },
  photo: { type: photoSchema, required: true },
  halls: { type: [hallSchema], required: true },
  tagTitle: { type: String, required: false },
  tagKeywords: { type: String, required: false },
  eateriesAdminId: { type: String, required: true, default: '' }
});

// Метод для удаления устаревших дат в disabledDates
eateriesSchema.methods.removeExpiredDates = async function() {
  const currentDate = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // Один день в миллисекундах

  this.disabledDates = this.disabledDates.filter((date: string) => {
    const diffTime = currentDate.getTime() - new Date(date).getTime();
    return diffTime < oneDay;
  });

  await this.save();
};

const EateriesModel = model<IEaterieDocument>('eaterie', eateriesSchema);

// Функция для обновления устаревших дат во всех экземплярах модели
const checkAndRemoveExpiredDates = async () => {
  try {
    const allEateries = await EateriesModel.find({});

    const updatePromises = allEateries.map((eatery: IEaterieDocument) => eatery.removeExpiredDates());
    await Promise.all(updatePromises);
    console.log('Removed expired dates successfully');
  } catch (error) {
    console.error('Error removing expired dates:', error);
  }
};

// Запуск задачи каждые 5 минут
setInterval(checkAndRemoveExpiredDates, 5 * 60 * 1000);

export default EateriesModel;

import {
  Response,
  NextFunction,
} from 'express';
import MenuModel from '../models/menu-model';
import EateriesModel from '../models/eateries-model'
import { NotFoundError } from '../utils/not-found-error-class'
import { RequestCustom } from '../utils/types';
import { v4 as uuidv4 } from 'uuid';
import { s3, deleteFileFromS3 } from '../utils/functions'
import { PutObjectCommandInput, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

export const getAllMenuItems = (req: any, res: Response, next: NextFunction) => {
  MenuModel
    .find({})
    .then((data) => {
      if (!data.length) {
        throw new NotFoundError('Не найдено ни одного пункта меню');
      }
      res.status(200).send({
        status: 'success',
        data,
      });
    })
    .catch((error) => {
      next(new Error('Произошла ошибка при получении пунктов меню'));
    });
};

export const getMenuItemByID = (req: any, res: Response, next: NextFunction) => {
  const { menuItemId } = req.params;

  MenuModel.findById(menuItemId)
    .then((menuItem) => {
      if (!menuItem) {
        return res.status(404).json({ message: 'Пункт меню не найден' });
      }
      res.status(200).json({ status: 'success', data: menuItem });
    })
    .catch((error) => {
      next(new Error('Произошла ошибка при получении пункта меню'));
    });
};

export const postOneMenuItem = (req: any, res: Response, next: NextFunction) => {
  const eateryId = req.params.eateryId; // Получаем идентификатор заведения из параметров
  const menuItem = req.body;

  // Сначала создаем новый пункт меню
  MenuModel.create(menuItem)
    .then((newMenuItem) => {
      // Затем находим заведение и добавляем новый пункт меню в menuItems
      return EateriesModel.findByIdAndUpdate(
        eateryId,
        { $push: { menuItems: newMenuItem._id } }, // Добавляем ID нового пункта меню в массив menuItems
        { new: true, useFindAndModify: false } // Возвращаем обновленный объект заведения
      );
    })
    .then((updatedEatery) => {
      if (!updatedEatery) {
        throw new NotFoundError('Заведение не найдено');
      }

      res.status(201).json({ status: 'success', data: updatedEatery });
    })
    .catch((error) => {
      console.error('Error adding menu item:', error);
      next(new Error('Произошла ошибка при добавлении пункта меню'));
    });
};

export const updateMenuItem = (req: any, res: Response, next: NextFunction) => {
  const { menuItemId } = req.params;
  const updateData = req.body;

  MenuModel.findByIdAndUpdate(menuItemId, updateData, { new: true })
    .then((updatedMenuItem) => {
      if (!updatedMenuItem) {
        return res.status(404).json({ status: 'fail', message: 'Пункт меню не найден' });
      }
      res.status(200).json({ status: 'success', data: updatedMenuItem });
    })
    .catch((error) => {
      next(new Error('Произошла ошибка при обновлении пункта меню'));
    });
};

export const deleteMenuItemByID = (req: RequestCustom, res: Response, next: NextFunction) => {
  const { menuItemId, eateryId } = req.params;

  // Поиск заведения по eateryId и удаление menuItemId из его массива menuItems
  EateriesModel.findByIdAndUpdate(
    eateryId,
    { $pull: { menuItems: menuItemId } },
    { new: true, useFindAndModify: false }
  )
    .then((data: any) => {

      // Удаление пункта меню из базы данных
      return MenuModel.findByIdAndDelete(menuItemId);
    })
    .then((deletedMenuItem) => {
      if (!deletedMenuItem) {
        // Если пункт меню не был найден
        return res.status(404).json({ message: 'Пункт меню не найден в базе данных' });
      }

      res.status(200).json({ status: 'success', message: 'Пункт меню успешно удалён' });
    })
    .catch((error) => {
      console.error('Error deleting menu item:', error);
      next(new Error('Произошла ошибка при удалении пункта меню'));
    });
};

// API для загрузки файла (без сохранения в пункт меню)
export const uploadFile = async (req: any, res: Response, next: NextFunction) => {
  const { restaurant } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "File is required" });
  }

  const bucketName = "3aaacc647142-brontosaur";
  const fileName = `${restaurant}/menu/${uuidv4()}-${file.originalname}`;

  try {
    // Настройка параметров загрузки
    const uploadParams: PutObjectCommandInput = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype,
      ContentDisposition: "inline",
    };

    const upload = new Upload({
      client: s3,
      params: uploadParams,
    });

    const result = await upload.done();

    // Возвращаем URL загруженного файла
    res.status(200).json({
      url: result.Location, // Ссылка на загруженное изображение
      message: "Изображение успешно загружено",
    });
  } catch (error) {
    console.error("Ошибка при загрузке:", error);
    next(new Error("Произошла ошибка при загрузке изображения"));
  }
};

// API для сохранения URL в пункте меню
export const saveFileToMenuItem = async (req: any, res: Response, next: NextFunction) => {
  const { menuItemId, url } = req.body;

  try {
    const menuItem = await MenuModel.findById(menuItemId);

    if (!menuItem) {
      return res.status(404).json({ status: "fail", message: "Пункт меню не найден" });
    }

    // Предварительная обработка для удаления лишней приставки
    const prefixToRemove = "https://s3.ru1.storage.beget.cloud/3aaacc647142-brontosaur/";
    const photoUrl = menuItem.photo;

    if (photoUrl && photoUrl.includes(prefixToRemove)) {
      const oldFileName = photoUrl.replace(prefixToRemove, "");
      console.log("Удаляем файл из S3:", oldFileName);

      await deleteFileFromS3(oldFileName);
    }

    const updatedMenuItem = await MenuModel.findByIdAndUpdate(
      menuItemId,
      { photo: url },
      { new: true }
    );

    res.status(200).json({
      message: "Изображение успешно сохранено",
      menuItem: updatedMenuItem,
    });
  } catch (error) {
    console.error("Ошибка при сохранении:", error);
    next(new Error("Произошла ошибка при сохранении изображения"));
  }
};
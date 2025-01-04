import {
  Response,
  NextFunction,
} from 'express';
import MenuModel from '../models/menu-model';
import EateriesModel from '../models/eateries-model'
import { NotFoundError } from '../utils/not-found-error-class'
import { RequestCustom } from '../utils/types';

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
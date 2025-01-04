import {
  Response,
  NextFunction,
} from 'express';
import MenuModel from '../models/menu-model';
import { RequestCustom } from '../utils/types';
import { NotFoundError } from '../utils/not-found-error-class'

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
  const menuItem = req.body;

  MenuModel.create(menuItem)
    .then((newMenuItem) => {
      res.status(201).json({ status: 'success', data: newMenuItem });
    })
    .catch((error) => {
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

export const deleteMenuItemByID = (req: any, res: Response, next: NextFunction) => {
  const { menuItemId } = req.params;

  MenuModel.findByIdAndDelete(menuItemId)
    .then((menuItem) => {
      if (!menuItem) {
        return res.status(404).json({ message: 'Пункт меню не найден' });
      }
      res.status(200).json({ status: 'success', message: 'Пункт меню успешно удалён' });
    })
    .catch((error) => {
      next(new Error('Произошла ошибка при удалении пункта меню'));
    });
};
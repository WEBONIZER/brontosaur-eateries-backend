import { body } from 'express-validator';

export const loginValidation = [
    body('phoneNumber', 'Номер телефона должен быть в формате 81234567898 и состоять только из цифр').matches(/^(8|\+7)\d{10}$/),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 5 }),
];

export const registerValidation = [
    body('phoneNumber', 'Номер телефона должен быть в формате 81234567898 и состоять только из цифр').matches(/^(8|\+7)\d{10}$/),
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({ min: 5 }),
];

export const emailValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('fullName', 'Укажите имя').isLength({ min: 3 }),
    body('avatarUrl', 'Неверная ссылка на аватарку').optional().isURL(),
];

export const fullNameValidation = [
    body('fullName', 'Укажите имя').isLength({ min: 3 }),
];

export const avatarUrlValidation = [
    body('avatarUrl', 'Неверная ссылка на аватарку').optional().isURL(),
];

export const phoneValidation = [
    body('phoneNumber', 'Номер телефона должен быть в формате 81234567898 и состоять только из цифр').matches(/^(8|\+7)\d{10}$/)
];
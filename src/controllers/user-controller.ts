import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import {
    Response,
} from 'express';
import { UserModel } from '../models/user';
import { transporter } from '../utils/functions'

export const register = async (req: any, res: Response) => {
    try {
        const password = req.body.password; // Получаем пароль из запроса
        const salt = await bcrypt.genSalt(10); // Генерируем соль
        const hash = await bcrypt.hash(password, salt); // Создаем хэш пароля

        // Создаем объект пользователя
        const doc = new UserModel({
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            fullName: req.body.fullName,
            passwordHash: hash, // Сохраняем только хэш пароля
            isPhoneVerified: req.body.isPhoneVerified || false,
            isEmailVerified: req.body.isEmailVerified || false,
            userRole: req.body.userRole || 'user',
            orders: req.body.orders || [],
            eateriesAdmin: req.body.eateriesAdmin || '',
            userDataProcessing: req.body. userDataProcessing
        });

        // Сохраняем пользователя в базе данных
        const user: any = await doc.save();

        // === Загружаем HTML-шаблон ===
        const templatePath = path.join(__dirname, 'html-templates', 'register-email-template.html');
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        // === Загружаем HTML-шаблон ===
        const templateAdminPath = path.join(__dirname, 'html-templates', 'register-email-to-admin-template.html');
        const htmlAdminTemplate = fs.readFileSync(templateAdminPath, 'utf-8');

        // === Подставляем значения в шаблон ===
        const customizedHtml = htmlTemplate
            .replace('{{phoneNumber}}', req.body.phoneNumber)
            .replace('{{password}}', password);

            // === Подставляем значения в шаблон ===
        const customizedAdminHtml = htmlAdminTemplate
        .replace('{{phoneNumber}}', req.body.phoneNumber)
        .replace('{{password}}', password);

        // Отправляем письмо
        const emailSent = await transporter.sendMail({
            from: `"Brontosaur" <${process.env.EMAIL_USER}>`, // От кого отправляем
            to: `${req.body.email}`, // Кому
            subject: 'Регистрация в сервисе Brontosaur', // Тема письма
            html: customizedHtml, // Используем измененный HTML
        });

        const emailToAdminSent = await transporter.sendMail({
            from: `"Brontosaur" <${process.env.EMAIL_USER}>`, // От кого отправляем
            to: `fox.spb@bk.ru`, // Кому
            subject: 'Новый пользователь в Brontosaur', // Тема письма
            html: customizedAdminHtml, // Используем измененный HTML
        });

        if (!emailSent || !emailToAdminSent) {
            throw new Error('Не удалось отправить письмо с учетными данными.');
        }

        // Генерируем токен
        const token = jwt.sign(
            { _id: user._id }, // Данные, которые будут зашиты в токен
            process.env.JWT_SECRET || 'secret123', // Используем секрет из env
            { expiresIn: '30d' }, // Срок действия токена
        );

        // Исключаем хэш пароля из ответа
        const { passwordHash, ...userData } = user._doc;

        // Возвращаем данные пользователя и токен
        res.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.error(err);

        // Возвращаем ошибку при сбое
        res.status(500).json({
            message: 'Не удалось зарегистрироваться. Попробуйте снова.',
        });
    }
};

export const login = async (req: any, res: Response) => {
    try {
        const user: any = await UserModel.findOne({ phoneNumber: req.body.phoneNumber });

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);

        if (!isValidPass) {
            return res.status(400).json({
                message: 'Неверный логин или пароль',
            });
        }

        const token = jwt.sign(
            {
                _id: user._id,
            },
            'secret123',
            {
                expiresIn: '30d',
            },
        );

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось авторизоваться',
        });
    }
};

export const getMe = async (req: any, res: Response) => {
    try {
        const user: any = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        const { passwordHash, ...userData } = user._doc;

        res.json(userData);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Нет доступа',
        });
    }
};

export const passwordRecovery = async (req: any, res: Response) => {
    try {
        const { phoneNumber, password } = req.body;

        // Проверяем наличие пользователя с данным номером телефона
        const user = await UserModel.findOne({ phoneNumber });

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь с таким номером телефона не найден.',
            });
        }

        // Генерируем новую соль и новый хэш пароля
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(password, salt);

        // Обновляем информацию о пользователе в базе данных
        user.passwordHash = newPasswordHash;
        await user.save();

        // === Загружаем HTML-шаблон для отправки письма ===
        const templatePath = path.join(__dirname, 'html-templates', 'register-email-template.html');
        const htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        // === Подставляем значения в шаблон ===
        const customizedHtml = htmlTemplate
            .replace('{{phoneNumber}}', phoneNumber)
            .replace('{{password}}', password);

        // Отправляем письмо
        const emailSent = await transporter.sendMail({
            from: `"Brontosaur" <${process.env.EMAIL_USER}>`, // От кого отправляем
            to: `${user.email}`, // Кому отправляем
            subject: 'Восстановление пароля в сервисе Brontosaur', // Тема письма
            html: customizedHtml,
        });

        if (!emailSent) {
            throw new Error('Не удалось отправить письмо с подтверждением.');
        }

        // Генерируем новый токен
        const token = jwt.sign(
            { _id: user._id }, // ID пользователя
            process.env.JWT_SECRET || 'secret123', // Секретный ключ
            { expiresIn: '30d' } // Токен действует 30 дней
        );

        // Исключаем хэш пароля из ответа
        const { passwordHash, ...userData } = (user as unknown as any)._doc;

        // Возвращаем данные пользователя и токен
        res.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: 'Не удалось восстановить пароль. Попробуйте снова.',
        });
    }
};

//При изменении данных пользователя обязательно передавать токен

export const createNewUser = async (req: any, res: Response) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const doc = new UserModel({
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash,
            isPhoneVerified: req.body.isPhoneVerified,
            isEmailVerified: req.body.isEmailVerified,
            userRole: req.body.userRole,
            orders: req.body.orders,
            eateriesAdmin: req.body.eateriesAdmin,
            userDataProcessing: req.body. userDataProcessing
        });

        const user: any = await doc.save();

        const token = jwt.sign(
            {
                _id: user._id,
            },
            'secret123',
            {
                expiresIn: '30d',
            },
        );

        const { passwordHash, ...userData } = user._doc;

        res.json({
            ...userData,
            token,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось зарегистрироваться',
        });
    }
};

export const getAllUsers = async (req: any, res: Response) => {
    try {
        const users = await UserModel.find().select('-passwordHash'); // Исключаем поле passwordHash
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Ошибка при получении пользователей',
        });
    }
};

export const getUserById = async (req: any, res: Response) => {
    try {
        const { id } = req.params; // Используем "id" вместо "phoneNumber"
        const user = await UserModel.findById(id).select('-passwordHash');

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
            });
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error fetching user',
        });
    }
};

export const findUsersByPartialPhoneNumber = async (req: any, res: Response) => {
    try {
        const { phoneNumber } = req.query;

        if (!phoneNumber) {
            return res.status(400).json({ message: 'Частичный номер телефона обязателен' });
        }

        // Экранирование знака плюс
        const escapedPhoneNumber = phoneNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const users = await UserModel.find({
            phoneNumber: { $regex: new RegExp(`^${escapedPhoneNumber}`, 'i') }
        })
            .sort({ phoneNumber: 1 }) // Сортировка по возрастанию
            .limit(15) // Ограничение результата до 5 объектов
            .select('-passwordHash');

        if (users.length === 0) {
            res.json({ message: 'Пользователи не найдены' });
        } else {
            res.json(users);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при поиске пользователей по частичному номеру телефона' });
    }
};

export const updateUser = async (req: any, res: Response) => {
    try {
        const { userId } = req.body; // _id пользователя
        const { fullName, phoneNumber, email } = req.body; // получаем новое fullName, phoneNumber и email из запроса

        // Проверяем, передан ли userId
        if (!userId) {
            return res.status(400).json({
                message: 'ID пользователя не указан',
            });
        }

        // Находим пользователя в базе данных
        const user: any = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        let hasChanges = false;

        // Проверяем и обновляем полное имя пользователя
        if (fullName && fullName !== user.fullName) {
            user.fullName = fullName;
            hasChanges = true;
        }

        // Проверяем и обновляем номер телефона
        if (phoneNumber && phoneNumber !== user.phoneNumber) {
            user.phoneNumber = phoneNumber;
            user.isPhoneVerified = false; // сбрасываем подтверждение номера
            hasChanges = true;
        }

        // Проверяем и обновляем email
        if (email && email !== user.email) {
            user.email = email;
            user.isEmailVerified = false; // сбрасываем подтверждение email
            hasChanges = true;
        }

        // Проверяем, были ли изменения и сохраняем их
        if (hasChanges) {
            await user.save();
        }

        const { passwordHash, ...userData } = user._doc;

        // Возвращаем обновлённого пользователя
        res.json({ message: 'Пользователь успешно обновлён', user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Ошибка при обновлении данных пользователя',
        });
    }
};

export const updateEmail = async (req: any, res: Response) => {
    try {
        const userId = await UserModel.findById(req.userId);
        const { email } = req.body; // новое имя пользователя

        if (!email) {
            return res.status(400).json({
                message: 'email не указан или указан некорректно',
            });
        }

        const user: any = await UserModel.findByIdAndUpdate(
            userId,
            { email },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        const { passwordHash, ...userData } = user._doc;

        res.json({ message: 'email успешно обновлено', user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Ошибка при обновлении email',
        });
    }
};

export const updatePhone = async (req: any, res: Response) => {
    try {
        const userId = await UserModel.findById(req.userId);
        const { phoneNumber } = req.body; // новое имя пользователя

        if (!phoneNumber) {
            return res.status(400).json({
                message: 'Номер телефона не указан или указан некорректно',
            });
        }

        const user: any = await UserModel.findByIdAndUpdate(
            userId,
            { phoneNumber },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        const { passwordHash, ...userData } = user._doc;

        res.json({ message: 'Номер телефона успешно обновлен', user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Ошибка при обновлении номера телефона',
        });
    }
};

export const confirmedPhoneReplace = async (req: any, res: Response) => {
    try {
        const userId = await UserModel.findById(req.userId);
        const { confirmedPhone } = req.body; // новое значение confirmed-phone

        if (!confirmedPhone) {
            return res.status(400).json({
                message: 'Новая ссылка не указана или указана некорректно',
            });
        }

        const user: any = await UserModel.findByIdAndUpdate(
            userId,
            { confirmedPhone },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        const { passwordHash, ...userData } = user._doc;

        res.json({ message: 'Аватарка успешно обновлена', user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Ошибка при обновлении аватарки',
        });
    }
};

export const confirmedEmailReplace = async (req: any, res: Response) => {
    try {
        const userId = await UserModel.findById(req.userId);
        const { confirmedEmail } = req.body; // новое значение confirmed-email

        if (!confirmedEmail) {
            return res.status(400).json({
                message: 'Новая ссылка не указана или указана некорректно',
            });
        }

        const user: any = await UserModel.findByIdAndUpdate(
            userId,
            { confirmedEmail },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        const { passwordHash, ...userData } = user._doc;

        res.json({ message: 'Аватарка успешно обновлена', user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Ошибка при обновлении аватарки',
        });
    }
};

export const addOrderToUser = async (req: any, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                message: 'Нет доступа',
            });
        }

        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                message: 'Необходимо указать ID заказа',
            });
        }

        const user: any = await UserModel.findByIdAndUpdate(
            userId,
            {
                $push: { orders: orderId }
            },
            {
                new: true,
                upsert: true
            }
        );

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        const { passwordHash, ...userData } = user._doc;

        res.json({ message: 'Заказ успешно добавлен', user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Ошибка при добавлении заказа',
        });
    }
};

export const addFavourite = async (req: any, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is missing' });
        }

        const { favourite } = req.body;

        if (!favourite) {
            return res.status(400).json({
                message: 'Не указана строка для добавления в избранное',
            });
        }

        const user: any = await UserModel.findByIdAndUpdate(
            userId,
            {
                $addToSet: {
                    favourites: favourite
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        const { passwordHash, ...userData } = user._doc;
        res.json({ message: 'Строка успешно добавлена в избранное', user: userData });
    } catch (err) {
        console.error("Error during the process:", err);
        res.status(500).json({
            message: 'Ошибка при добавлении строки в избранное',
        });
    }
};

export const removeFavourite = async (req: any, res: Response) => {
    try {
        const userId = req.userId;
        const { favourite } = req.body;

        if (!favourite) {
            return res.status(400).json({
                message: 'Не указана строка для удаления из избранного',
            });
        }

        const user: any = await UserModel.findByIdAndUpdate(
            userId,
            {
                $pull: {
                    favourites: favourite
                }
            }, // Используем $pull чтобы удалить строку из массива
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден',
            });
        }

        const { passwordHash, ...userData } = user._doc;

        res.json({ message: 'Строка успешно удалена из избранного', user: userData });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Ошибка при удалении строки из избранного',
        });
    }
};
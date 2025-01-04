import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';

const { API_MENU_KEY } = process.env

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];

    // Проверяем наличие API ключа
    if (!apiKey) {
        return res.status(401).json({ message: "Unauthorized: Missing API key" });
    }

    // Сравниваем переданный ключ с валидным ключом
    const validApiKey = API_MENU_KEY; // Загружаем ключ из .env
    if (apiKey !== validApiKey) {
        return res.status(403).json({ message: `Неверный API key` });
    }

    // Если ключ валидный, пропускаем запрос дальше
    next();
};
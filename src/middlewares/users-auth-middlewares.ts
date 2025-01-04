import { Request, Response, NextFunction } from 'express';

const { API_USERS_KEY } = process.env

export const authUsersMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];

    // Проверяем наличие API ключа
    if (!apiKey) {
        return res.status(401).json({ message: "Unauthorized: Missing API key" });
    }

    // Сравниваем переданный ключ с валидным ключом
    const validApiKey = API_USERS_KEY; // Загружаем ключ из .env
    if (apiKey !== validApiKey) {
        return res.status(403).json({ message: "Forbidden: Invalid API key" });
    }

    // Если ключ валидный, пропускаем запрос дальше
    next();
};
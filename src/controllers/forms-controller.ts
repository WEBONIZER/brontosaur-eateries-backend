import {
    Response,
} from 'express';
import { EstablishmentNotFoundModel } from '../models/forms-models'
import { transporter } from '../utils/functions'

export const saveAndSendEmail = async (req: any, res: Response) => {
    const { name, city } = req.body;

    // Проверка на наличие всех необходимых полей
    if (!name || !city) {
        return res.status(400).send('Название или город не указаны');
    }

    try {
        // Сохранение данных в базу
        const establishment = new EstablishmentNotFoundModel({ name, city });
        await establishment.save();

        // Настройки письма
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'fox.spb@bk.ru',
            subject: 'Новое заведение для добавления',
            html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h1>Заведение не было найдено</h1>
            <p><strong>Название:</strong> ${name}</p>
            <p><strong>Город:</strong> ${city}</p>
          </div>
        `,
        };

        // Отправка email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email sending error:', error);
                return res.status(500).send('Failed to send email');
            } else {
                console.log('Email sent:', info.response);
                return res.status(200).json({
                    message: 'Data saved and email sent',
                    data: {
                        name,
                        city
                    }
                });
            }
        });
    } catch (err: any) {
        console.error('Error saving data and sending email:', err);
        return res.status(500).send('Internal server error');
    }
};
import fs from 'fs';
import nodemailer, { TransportOptions } from "nodemailer";
import dotenv from 'dotenv'
import path from 'path';

dotenv.config()

export const transporter: nodemailer.Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true', // true для порта 465, false для других портов
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    logger: true, // включение логирования в консоль
    debug: true   // включение расширенного отладочного режима
} as TransportOptions);

transporter.verify((error, success) => {
    if (error) {
    } else {
        console.log('SMTP server is ready to take our messages');
    }
});

export const sendMailToUser = (data: any, template: string, subject: string) => {
    // Получаем email пользователя из данных модели
    const userEmail = data.userEmail;
    if (!userEmail) {
        throw new Error('Email пользователя не найден');
    }

    // Читаем HTML-шаблон пользователя
    const templateUserPath = path.join(__dirname, '../controllers', 'html-templates', template);
    const emailUserHtml = fs.readFileSync(templateUserPath, 'utf8');

    // Подставляем данные в шаблон пользователю
    const customizedUserEmailHtml = emailUserHtml
        .replace('{{barName}}', data.barName)
        .replace('{{orderNumber}}', data.orderNumber)
        .replace('{{guests}}', data.guests)
        .replace('{{tableNumber}}', data.tableNumber)
        .replace('{{date}}', data.date)
        .replace('{{startTime}}', data.startTime)
        .replace('{{endTime}}', data.endTime);

    // Настраиваем параметры письма пользователю
    const mailUserOptions = {
        from: `"Brontosaur" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: subject,
        html: customizedUserEmailHtml,
    };

    // Отправляем email пользователю
    transporter.sendMail(mailUserOptions, (error, info) => {
        if (error) {
            console.error(`Ошибка отправки email на ${userEmail}:`, error);
        } else {
            console.log(`Письмо отправлено на ${userEmail}: ${info.response}`);
        }
    });
}

export const sendMailToAdmin = (data: any, template: string, subject: string) => {
    // Получаем email админа из данных модели
    const adminEmail = data.eaterieEmail;
    if (!adminEmail) {
        throw new Error('Email пользователя не найден');
    }

    // Читаем HTML-шаблон админа
    const templateAdminPath = path.join(__dirname, '../controllers', 'html-templates', template);
    const emailAdminHtml = fs.readFileSync(templateAdminPath, 'utf8');

    // Подставляем данные в шаблон админу
    const customizedAdminEmailHtml = emailAdminHtml
        .replace('{{barName}}', data.barName)
        .replace('{{orderNumber}}', data.orderNumber)
        .replace('{{guests}}', data.guests)
        .replace('{{tableNumber}}', data.tableNumber)
        .replace('{{date}}', data.date)
        .replace('{{startTime}}', data.startTime)
        .replace('{{endTime}}', data.endTime);

    // Настраиваем параметры письма админу
    const mailAdminOptions = {
        from: `"Brontosaur" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: subject,
        html: customizedAdminEmailHtml,
    };

    // Отправляем email админу
    transporter.sendMail(mailAdminOptions, (error, info) => {
        if (error) {
            console.error(`Ошибка отправки email на ${adminEmail}:`, error);
        } else {
            console.log(`Письмо отправлено на ${adminEmail}: ${info.response}`);
        }
    });
}
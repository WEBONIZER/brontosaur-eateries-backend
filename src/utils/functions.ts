import fs from 'fs';
import nodemailer, { TransportOptions } from "nodemailer";
import dotenv from 'dotenv'
import path from 'path';
import { S3Client, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

dotenv.config()

const { S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env

if (!S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY || !S3_ENDPOINT) {
    throw new Error("Отсутствует значение одной или нескольких необходимых переменных окружения для конфигурации S3Client");
}

export const s3 = new S3Client({
    region: "ru-1", // Регион (проверьте в документации вашего хранилища)
    endpoint: S3_ENDPOINT, // Путь до S3 сервиса
    credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // Аналог s3ForcePathStyle
});

export const deleteFileFromS3 = async (fileKey: string) => {
    // Формируем параметры удаления динамически
    const deleteParams = {
        Bucket: "3aaacc647142-brontosaur", // Ваш установленный Bucket
        Key: fileKey,
    };

    console.log("Параметры удаления:", deleteParams); // Логируем параметры

    try {
        // Выполняем удаление
        const result = await s3.send(new DeleteObjectCommand(deleteParams));
        console.log("Результат удаления:", result); // Успешное удаление
    } catch (error) {
        console.error("Ошибка при удалении файла из S3:", error); // Обрабатываем исключения
    }
};

const checkIfFileExists = async (fileName: string) => {
    const params = {
        Bucket: "3aaacc647142-brontosaur",
        Key: fileName,
    };

    try {
        await s3.send(new HeadObjectCommand(params));
        console.log("Файл всё ещё существует:", fileName);
    } catch (err: any) {
        if (err.name === "NotFound") {
            console.log("Файл успешно удалён:", fileName);
        } else {
            console.error("Ошибка при проверке объекта:", err);
        }
    }
};

// Вызов функции проверки
checkIfFileExists(
    "hinkali-proletarskaya/menu/9001e2f9-819f-4f24-b63d-f072db97e4d3-1.png"
);

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
import {
    Response,
} from 'express';
import fs from 'fs';
import axios from 'axios';
import { UserModel } from '../models/user'
import dotenv from 'dotenv'
import path from 'path';
import { transporter } from '../utils/functions'

dotenv.config()

const { VP_API_KEY, VP_API_URL } = process.env;

if (!VP_API_KEY || !VP_API_URL) {
    throw new Error('Отсутствуют необходимые переменные окружения: VP_API_KEY или VP_API_URL');
}

export const sendCode = async (req: any, res: Response) => {
    const { phoneNumber } = req.body;

    try {
        // Формируем тело POST-запроса
        const body = {
            number: phoneNumber,
            capacity: 4,
            callback_url: 'https://brontosaur.ru/callback',
            security: {
                apiKey: VP_API_KEY,
            },
        };

        // Выполняем запрос к Voice Password API
        const response = await axios.post(VP_API_URL, body, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': VP_API_KEY,
            },
        });

        const { result, code, id, price } = response.data;

        if (result === 'ok') {
            // Сохраняем код и статус в базу данных
            const user = await UserModel.findOneAndUpdate(
                { phoneNumber }, // Найти пользователя по номеру телефона
                {
                    phoneVerificationCode: code,
                    isPhoneVerified: false
                }, // Обновить код
                { new: true, upsert: true } // Обновить или создать, если нет
            );

            // Возвращаем пользователю успех
            res.json({ success: true, code, user: user });
        } else {
            res.json({ success: false, error: 'Не удалось отправить голосовой код, обратитесь к администратору' });
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, error: 'Ошибка при отправке голосового кода' });
    }
};

// Контроллер для проверки кода
export const verifyCode = async (req: any, res: Response) => {
    const { phoneNumber, verificationCode } = req.body;

    try {
        // Находим пользователя с указанным номером
        const user: any = await UserModel.findOne({ phoneNumber });

        // Проверяем совпадение кода
        if (user && String(user.phoneVerificationCode) === String(verificationCode)) {
            // Обновляем статус верификации
            user.isPhoneVerified = true;
            user.phoneVerificationCode = undefined; // Удаляем код
            await user.save();

            res.json({ success: true, user: user });
        } else {
            // Ответ клиенту о неверном коде
            res.json({ success: false, error: 'Неверный код, попробуйте отправить новый через 2 минуты', code: verificationCode });

            // Удаляем код через 2 минуты
            if (user && user.phoneVerificationCode) {
                setTimeout(async () => {
                    try {
                        // Проверяем, код не был перезаписан
                        const currentUser: any = await UserModel.findOne({ phoneNumber });
                        if (currentUser.phoneVerificationCode === user.phoneVerificationCode) {
                            currentUser.phoneVerificationCode = undefined; // Удаляем код
                            await currentUser.save();
                            console.log(`Код для пользователя с номером ${phoneNumber} удалён`);
                        }
                    } catch (error) {
                        console.error('Ошибка при удалении phoneVerificationCode через таймер:', error);
                    }
                }, 2 * 60 * 1000); // 2 минуты
            }
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, error: 'Ошибка при проверке кода' });
    }
};

export const sendVerificationCode = async (req: any, res: Response) => {
    const { email } = req.body;

    // Генерация случайного четырехзначного кода
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    try {
        // Обновляем/добавляем запись для верификации в модели User
        const user = await UserModel.findOneAndUpdate(
            { email },
            { email, verificationCode, isEmailVerified: false },
            { new: true, upsert: true }
        );

        // Отправляем успешный HTTP-ответ
        res.status(200).json({ success: true, user: user });

        // Отправляем письмо с кодом для верификации (обновите функцию отправки письма)
        sendMail(email, verificationCode, 'verification');
    } catch (err) {
        console.error('Error sending verification code:', err);
        return res.status(500).json({ message: 'Error sending verification code' });
    }
};


// Функция для отправки писем
const sendMail = async (email: string, verificationCode: string | null, type: 'verification' | 'confirmation') => {
  try {
    // Читаем HTML-шаблон из файла
    const templatePath = path.join(__dirname, 'html-templates', 'send-verification-email-template.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    // Подставляем значение verificationCode
    htmlContent = htmlContent.replace('{{verificationCode}}', verificationCode || '');

    // Определяем параметры письма
    const mailOptions = {
      from: `"Brontosaur" <${process.env.EMAIL_USER}>`,
      to: `${email}`,
      subject: 'BRONTOSAUR Проверка e-mail',
      html: htmlContent,
    };

    // Отправка письма
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error(`${type} email sending error:`, error);
  }
};

export const verifyEmail = async (req: any, res: Response) => {
  const { email, verificationCode } = req.body;

  try {
      // Находим пользователя по email
      const user: any = await UserModel.findOne({ email: email.trim().toLowerCase() });

      if (user && String(user.verificationCode) === String(verificationCode)) {
          // Обновляем статус верификации
          user.isEmailVerified = true;
          user.verificationCode = undefined; // Удаляем код
          await user.save();

          // Лог успешной обработки
          console.log(`Email verification successful for: ${email}`);

          // Опционально: отправляем подтверждающее письмо
          const templatePath = path.join(__dirname, 'html-templates', 'verification-email-template.html');
          const confirmationHtml = fs.readFileSync(templatePath, 'utf8');
          const mailOptions = {
              from: `"Brontosaur" <${process.env.EMAIL_USER}>`,
              to: `${email}`,
              subject: 'BRONTOSAUR Email подтверждён',
              html: confirmationHtml,
          };

          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  console.error(`Error sending confirmation email to ${email}:`, error);
              } else {
                  console.log(`Confirmation email sent to ${email}: ${info.response}`);
              }
          });

          return res.json({ success: true, user });
      } else {
          // Ответ клиенту о неверном коде
          console.error(`Invalid verification code for email: ${email}`);
          res.json({ success: false, error: 'Неверный код, попробуйте отправить новый через 2 минуты', code: verificationCode });

          // Удаление кода через 2 минуты, если требуется
          if (user && user.verificationCode) {
              setTimeout(async () => {
                  try {
                      // Убеждаемся, что код не был перезаписан
                      const currentUser: any = await UserModel.findOne({ email: email.trim().toLowerCase() });
                      if (currentUser && currentUser.verificationCode === user.verificationCode) {
                          currentUser.verificationCode = undefined;
                          await currentUser.save();
                          console.log(`Verification code cleared for email: ${email}`);
                      }
                  } catch (error) {
                      console.error('Error clearing verification code via timer:', error);
                  }
              }, 2 * 60 * 1000); // 2 минуты
          }
      }
  } catch (error) {
      // Логирование ошибки
      console.error('Error verifying email:', error);
      res.status(500).json({ success: false, error: 'Ошибка при проверке email' });
  }
};
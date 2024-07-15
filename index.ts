import express from 'express';
import mongoose from "mongoose";
import cors from 'cors';
import errorMdlwr from './src/middlewares/error';
import eateries from './src/routes/eateries';
import fs from 'fs';
import https from 'https';
import 'dotenv/config';

const { PORT, MONGO_URL } = process.env;
const MONGO_CONNECT = MONGO_URL ? MONGO_URL : 'mongodb://localhost:27017/eateriesdb';
const app = express();

mongoose.set("strictQuery", false);
mongoose.connect(MONGO_CONNECT);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/eateries", eateries);

app.use("*", (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Страница не найдена</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #f8f9fa;
          }
          .container {
            text-align: center;
          }
          h1 {
            font-size: 48px;
            color: #343a40;
          }
          p {
            font-size: 18px;
            color: #6c757d;
          }
          a {
            font-size: 18px;
            color: #007bff;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>404 - Страница не найдена</h1>
          <p>
            Запрашиваемая страница не найдена. Возможно, она была перемещена или
            удалена.
          </p>
          <p><a href="/">Перейти на главную страницу</a></p>
        </div>
      </body>
    </html>
    `;
    res.status(404).send(htmlContent);
});

app.use(errorMdlwr);

const httpsOptions = {
    key: fs.readFileSync("../brontosaur-certificate/brontosaur.ru.key"),
    cert: fs.readFileSync("../brontosaur-certificate/fullchain.cer"),
};

https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
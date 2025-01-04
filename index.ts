import cors from "cors";
import 'dotenv/config';
import express from 'express';
import { readFileSync } from 'fs';
import https from 'https';
import mongoose from "mongoose";
import errorMdlwr from "./src/middlewares/error";
import eateries from './src/routes/eateries-routes';
import tables from './src/routes/tables-routes';
import orders from './src/routes/orders-router'
import menu from './src/routes/menu';
import OrderModel from './src/models/order-model';
import { autRouter } from './src/routes/aut-routers';
import { formsRouter } from './src/routes/forms-router';
import { verificationRouter } from './src/routes/verification-router';
import { WebSocketServer } from 'ws';

const { WS_PORT, PORT, MONGO_URL } = process.env;
const MONGO_CONNECT = MONGO_URL ? MONGO_URL : '';

if (!MONGO_URL) {
  console.error('MongoDB URL is not defined in the env file.');
  process.exit(1);
}

(async (expressServer) => {
  const crt = {
    key: readFileSync("../.env/brontosaur.ru.key"),
    cert: readFileSync("../.env/fullchain.cer"),
  };

  const httpsServer = https.createServer(crt, expressServer);

  httpsServer.listen(PORT, async () => {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGO_CONNECT);

    try {
      expressServer
        .use(cors())
        .use(express.json())
        .use(express.urlencoded({ extended: true }))
        .use("/eateries", eateries)
        .use("/tables", tables)
        .use('/orders', orders)
        .use("/menu", menu)
        .use("/auth", autRouter)
        .use("/verification", verificationRouter)
        .use("/forms", formsRouter)
        .use('*', (req, res) => {
          res.status(404).json({ message: 'Not Found' });
        })
        .use(errorMdlwr)
        .post('/send-message', async (req, res, next) => {
          try {
            const { content } = req.body;
            const newMessage = new OrderModel({ content });
            await newMessage.save();

            // Отправка сообщения всем подключенным клиентам
            wss.clients.forEach(client => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'newMessage', data: newMessage }));
              }
            });

            res.status(201).json({ message: 'Message received and broadcasted.' });
          } catch (error) {
            next(error);
          }
        });
    } catch (error) {
      console.error(error);
    }
  });

  const wssServer = https.createServer(crt, expressServer);

  const wss = new WebSocketServer({ server: wssServer });

  wss.on('connection', connection => {
    console.log('Новое подключение клиента');

    connection.send(JSON.stringify({ success: true, message: "Новое подключение клиента" }));

    connection.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        const { action, barId } = data;

        if (action === 'getOrdersByBarId') {
          const orders = await OrderModel.find({ barId });
          connection.send(JSON.stringify({ type: 'orders', data: orders }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
        connection.send(JSON.stringify({ success: false, message: 'Error processing your request' }));
      }
    });

    connection.on('close', () => {
      console.log('Клиент отключился');
    });
  });

  wssServer.listen(WS_PORT, () => {
    console.log(`WebSocket server listening on port ${WS_PORT}`);
  });
})(express());

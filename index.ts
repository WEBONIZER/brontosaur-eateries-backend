import cors from "cors";
import 'dotenv/config';
import express from 'express';
import { readFileSync } from 'fs';
import https from 'https';
import mongoose from "mongoose";
import errorMdlwr from "./src/middlewares/error";
import eateries from './src/routes/eateries-routes';
import tables from './src/routes/tables-routes';

const { PORT, MONGO_URL } = process.env;

if (!MONGO_URL) {
  console.error('MongoDB URL is not defined in the env file.');
  process.exit(1);
}

mongoose.set("strictQuery", false);
mongoose
  .connect(MONGO_URL)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/eateries", eateries);
app.use("/tables", tables);
app.use("*", (_req, res) => {
    res.status(404).json({ message: "Not Found" });
});
app.use(errorMdlwr);

const httpsOptions = {
    key: readFileSync("../.env/brontosaur.ru.key"),
    cert: readFileSync("../.env/fullchain.cer"),
};

// Создание HTTPS сервера
https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});

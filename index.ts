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

const MONGO_CONNECT = MONGO_URL ? MONGO_URL : '';

const app = express();

mongoose.set("strictQuery", false);
mongoose.connect(MONGO_CONNECT);

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

https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});